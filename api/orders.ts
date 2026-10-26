import { neon } from '@neondatabase/serverless';

/**
 * ที่เก็บออเดอร์กลาง — ทุกเครื่อง (มือถือลูกค้า, เครื่องร้าน) อ่านเขียนที่นี่ จึงเห็นออเดอร์ชุดเดียวกัน
 * เลขคิวออกที่เซิร์ฟเวอร์ ลูกค้าสองคนสั่งร้านเดียวกันพร้อมกันก็ไม่ได้เลขซ้ำ
 *
 * shortcut: ไม่มีการยืนยันตัวตน ใครมีลิงก์ก็แก้ข้อมูลเดโมได้ — ใช้จริงต้องผูกกับบัญชีนนทรี/PIN ร้านที่ฝั่งเซิร์ฟเวอร์
 */
const sql = neon(process.env.DATABASE_URL ?? '');

// สร้างตารางครั้งแรกที่เครื่องเซิร์ฟเวอร์ตื่น (idempotent) — schema ทั้งหมดอยู่ที่นี่ที่เดียว
let schema: Promise<unknown> | null = null;
const ensureSchema = () =>
  (schema ??= sql`create table if not exists orders (id text primary key, data jsonb not null, updated_at bigint not null)`
    .then(() => sql`create table if not exists counters (stall_id text primary key, next int not null)`)
    .catch((e) => { schema = null; throw e; }));

type Order = { id: string; no: number; stallId: string; lines: unknown[]; status: string; mine?: boolean };
const STATUSES = ['unpaid', 'queued', 'ready', 'done', 'cancelled'];

/** ตรวจข้อมูลที่ส่งมาก่อนเก็บ — เก็บแต่ที่หน้าตาเป็นออเดอร์จริง และไม่เชื่อค่า mine จากเครื่องไหนเลย */
function clean(list: unknown): Order[] {
  if (!Array.isArray(list) || list.length > 500) return [];
  const ok = (o: Record<string, unknown>) =>
    typeof o.id === 'string' && o.id.length > 0 && o.id.length <= 64 &&
    typeof o.stallId === 'string' && o.stallId.length <= 32 &&
    typeof o.no === 'number' && Array.isArray(o.lines) && o.lines.length <= 30 &&
    typeof o.status === 'string' && STATUSES.includes(o.status);
  return list
    .filter((o): o is Record<string, unknown> => !!o && typeof o === 'object')
    .filter(ok)
    .map((o) => ({ ...(o as unknown as Order), mine: false }));
}

async function snapshot() {
  const rows = await sql`select data from orders order by (data->>'sort')::bigint nulls last`;
  const counters = await sql`select stall_id, next from counters`;
  return {
    orders: rows.map((r) => r.data as Order),
    counters: Object.fromEntries(counters.map((r) => [r.stall_id as string, r.next as number])),
  };
}

export async function GET() {
  await ensureSchema();
  return Response.json(await snapshot(), { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: Request) {
  await ensureSchema();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: 'bad json' }, { status: 400 });
  const now = Date.now();

  if (body.op === 'place') {
    const [order] = clean([body.order]);
    const start = Number(body.start);
    if (!order || !Number.isInteger(start)) return Response.json({ error: 'bad order' }, { status: 400 });
    // เลขคิวออกในคำสั่งเดียว: เพิ่มตัวนับแล้วคืนเลขเดิม — สองคำขอพร้อมกันได้คนละเลขเสมอ
    const [row] = await sql`
      insert into counters (stall_id, next) values (${order.stallId}, ${start + 1})
      on conflict (stall_id) do update set next = counters.next + 1
      returning next - 1 as no`;
    const placed = { ...order, no: row!.no as number };
    await sql`insert into orders (id, data, updated_at) values (${placed.id}, ${JSON.stringify(placed)}, ${now})
      on conflict (id) do nothing`;
    return Response.json({ no: placed.no });
  }

  if (body.op === 'upsert') {
    const list = clean(body.orders);
    if (list.length) {
      await sql`
        insert into orders (id, data, updated_at)
        select o->>'id', o, ${now} from jsonb_array_elements(${JSON.stringify(list)}::jsonb) o
        on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at`;
    }
    return Response.json(await snapshot());
  }

  // ออเดอร์ตัวอย่างตอนเริ่มเดโม — ใส่เฉพาะตอนที่ยังไม่มีอะไรเลย เครื่องที่สองจะไม่ใส่ซ้ำ
  if (body.op === 'seed') {
    const list = clean(body.orders);
    const counters = body.counters && typeof body.counters === 'object' ? body.counters as Record<string, unknown> : {};
    const [count] = await sql`select count(*)::int as n from orders`;
    if (count?.n === 0 && list.length) {
      await sql`
        insert into orders (id, data, updated_at)
        select o->>'id', o, ${now} from jsonb_array_elements(${JSON.stringify(list)}::jsonb) o
        on conflict (id) do nothing`;
      for (const [stall, next] of Object.entries(counters)) {
        if (typeof next === 'number' && stall.length <= 32) {
          await sql`insert into counters (stall_id, next) values (${stall}, ${next})
            on conflict (stall_id) do update set next = greatest(counters.next, excluded.next)`;
        }
      }
    }
    return Response.json(await snapshot());
  }

  if (body.op === 'reset') {
    await sql`delete from orders`;
    await sql`delete from counters`;
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'unknown op' }, { status: 400 });
}

import { getStall } from './data';
import { actions, applyServer, getState, notifyReady, subscribe } from './store';
import type { Order } from './types';

/**
 * เชื่อมทุกเครื่องผ่านที่เก็บกลาง (/api/orders บน Vercel + ฐานข้อมูล Neon)
 * ลูกค้ากดสั่งจากมือถือ → ขึ้นที่เครื่องร้าน, ร้านกดเสร็จ → บัตรคิวบนมือถือเปลี่ยนเอง
 *
 * shortcut: ดึงข้อมูลทุก 2 วินาที และบันทึกทับทีละออเดอร์ (ใครบันทึกทีหลังชนะ)
 * พอสำหรับเดโมและร้านไม่กี่ร้าน — ใช้จริงทั้งโรงอาหารควรเปลี่ยนเป็น realtime
 */
const API = '/api/orders';
const POLL_MS = 2000;
const MINE_KEY = 'torqueue.mine';

/** ออเดอร์ที่ต่างจากที่ส่ง/รับไว้ล่าสุด — store สร้าง object ใหม่ทุกครั้งที่แก้ จึงเทียบที่ตัว object ได้เลย */
export function changedSince(last: Map<string, Order>, orders: Order[]): Order[] {
  return orders.filter((o) => last.get(o.id) !== o);
}

/** ที่เก็บกลางไม่รู้ว่าออเดอร์ไหนของใคร — เครื่องนี้จำเลขออเดอร์ของตัวเองไว้ แล้วติดป้าย mine เอง */
export function markMine(orders: Order[], mine: Set<string>): Order[] {
  return orders.map((o) => ({ ...o, mine: mine.has(o.id) }));
}

function loadMine(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(MINE_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

let online = false;

async function api(body?: unknown): Promise<{ orders: Order[]; counters: Record<string, number>; no?: number }> {
  const res = await fetch(API, body === undefined
    ? { cache: 'no-store' }
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error('api ' + res.status);
  return res.json();
}

/** เริ่มเชื่อมต่อ — ถ้าไม่มีที่เก็บกลาง (เช่นรัน npm run dev ในเครื่อง) ก็ทำงานในเครื่องเหมือนเดิม */
export function startSync(): () => void {
  const mine = loadMine();
  for (const o of getState().orders) if (o.mine) mine.add(o.id);
  const saveMine = () => {
    try { localStorage.setItem(MINE_KEY, JSON.stringify([...mine])); } catch { /* โหมดส่วนตัว — ไม่เป็นไร */ }
  };

  let last = new Map<string, Order>();
  let busy = false;
  let stopped = false;
  // เพิ่มทุกครั้งที่เครื่องนี้ส่งของขึ้นไป — ข้อมูลที่ดึงมาก่อนการส่งล่าสุดถือว่าเก่า ห้ามเอามาทับ
  let sent = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  // รับข้อมูลจากที่เก็บกลาง — จำ object ไว้ก่อนส่งเข้า store จะได้ไม่ถูกมองว่าเป็นการแก้ใหม่แล้วส่งกลับ
  const adopt = (data: { orders: Order[]; counters: Record<string, number> }) => {
    const before = new Map(getState().orders.map((o) => [o.id, o]));
    const orders = markMine(data.orders, mine);
    last = new Map(orders.map((o) => [o.id, o]));
    applyServer(orders, data.counters);
    // ร้านกดเสร็จจากอีกเครื่อง — มือถือลูกค้าต้องเตือนเอง
    for (const o of orders) if (o.mine && o.status === 'ready' && before.get(o.id)?.status !== 'ready') notifyReady(o);
  };

  const flush = async () => {
    if (!online || busy || stopped) return;
    const changed = changedSince(last, getState().orders);
    if (!changed.length) return;
    busy = true;
    sent++;
    try {
      // ออเดอร์ใหม่ของเครื่องนี้ — ให้เซิร์ฟเวอร์ออกเลขคิวจริง
      for (const o of changed.filter((c) => c.mine && !last.has(c.id))) {
        const res = await api({ op: 'place', order: o, start: getStall(o.stallId).start });
        mine.add(o.id);
        saveMine();
        last.set(o.id, o);
        if (typeof res.no === 'number') actions.renumber(o.id, res.no);
      }
      const rest = changed.filter((c) => last.get(c.id) !== c);
      if (rest.length) {
        await api({ op: 'upsert', orders: rest });
        for (const o of rest) last.set(o.id, o);
      }
    } catch {
      // เน็ตหลุด — รอบหน้าจะส่งใหม่เอง เพราะยังนับเป็นของที่เปลี่ยน
    } finally {
      busy = false;
    }
    if (changedSince(last, getState().orders).length) void flush();
  };

  let polling = false;
  const poll = async () => {
    // มีของที่ยังไม่ได้ส่ง อย่าเพิ่งเอาของจากเซิร์ฟเวอร์มาทับ / เน็ตช้าก็ไม่ยิงซ้อนรอบเดิม
    if (!online || busy || stopped || polling || changedSince(last, getState().orders).length) return;
    const at = sent;
    polling = true;
    try {
      const data = await api();
      if (at === sent && !busy && !changedSince(last, getState().orders).length) adopt(data);
    } catch {
      // ชั่วคราว รอบหน้าลองใหม่
    } finally {
      polling = false;
    }
  };

  const unsubscribe = subscribe(() => void flush());

  void (async () => {
    try {
      const data = await api();
      if (stopped) return;
      online = true;
      // ที่เก็บกลางยังว่าง — เครื่องแรกเอาออเดอร์ตัวอย่างขึ้นไปให้ทุกเครื่องเห็นชุดเดียวกัน
      adopt(data.orders.length ? data : await api({ op: 'seed', orders: getState().orders, counters: getState().counters }));
      saveMine();
      timer = setInterval(() => void poll(), POLL_MS);
    } catch {
      online = false;
    }
  })();

  return () => {
    stopped = true;
    unsubscribe();
    clearInterval(timer);
  };
}

/** ล้างข้อมูลเดโม — ล้างที่เก็บกลางด้วย ไม่งั้นรีโหลดแล้วออเดอร์เก่าจากเซิร์ฟเวอร์จะกลับมา */
export async function resetAll(): Promise<void> {
  if (online) await api({ op: 'reset' }).catch(() => undefined);
  try { localStorage.removeItem(MINE_KEY); } catch { /* ไม่เป็นไร */ }
  actions.reset();
}

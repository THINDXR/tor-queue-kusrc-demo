import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { PAYMENTS, getStall, stallLabel } from '../lib/data';
import { identityOf, type ShapeName } from '../lib/identity';
import { CASH_TIMEOUT, PREPARE_AT, aheadOf, orderMods, orderTitle, orderTotal, waitMins } from '../lib/queue';
import { actions, useStore } from '../lib/store';
import { baht, padQueueNo } from '../lib/thai';
import type { Order } from '../lib/types';
import { Shape } from '../components/Shape';
import { NotifyPrompt } from '../components/NotifyPrompt';
import { Icon } from '../components/Icon';

// ---------- ทำให้บัตรแต่ละใบไม่ซ้ำกัน ----------

/** แปลงรหัสออเดอร์เป็นตัวเลข แล้วใช้เป็นเมล็ดสุ่ม — ใบเดิมเปิดกี่ครั้งก็ได้ลายเดิม */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MASCOT: Record<string, string> = {
  mango: 'มะม่วง', chili: 'พริกแซ่บ', grass: 'ใบเตย', sky: 'ฟ้าใส',
  grape: 'องุ่น', coral: 'ส้มจี๊ด', teal: 'มรกต', cocoa: 'โกโก้',
};
const MOOD = ['นำโชค', 'สดใส', 'อารมณ์ดี', 'ขี้เล่น', 'ใจดี', 'ตัวจิ๋ว', 'สายกิน', 'ยิ้มหวาน'];

/** ชื่อลายบัตร เช่น "องุ่นนำโชค" — ให้รู้สึกว่าได้บัตรใบพิเศษของตัวเอง */
function ticketName(order: Order): string {
  const id = identityOf(order.no);
  return (MASCOT[id.key] ?? 'ต่อคิว') + (MOOD[hash(order.id) % MOOD.length] ?? '');
}

function serial(order: Order): string {
  return hash(order.id + 'ser').toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

interface Bit { x: number; y: number; s: number; r: number; o: number; d: number }

function scatter(seed: number, count: number): Bit[] {
  const rand = rng(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100, y: rand() * 100, s: 10 + rand() * 22,
    r: rand() * 360, o: 0.16 + rand() * 0.24, d: rand() * 4,
  }));
}

function Confetti({ seed, shape, count, className }: { seed: number; shape: ShapeName; count: number; className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {scatter(seed, count).map((b, i) => (
        <span
          key={i}
          style={{
            left: b.x + '%', top: b.y + '%', opacity: b.o,
            transform: `rotate(${b.r}deg)`, animationDelay: `-${b.d}s`,
          }}
        >
          <Shape shape={shape} size={Math.round(b.s)} color="currentColor" filled={i % 3 !== 0} />
        </span>
      ))}
    </div>
  );
}

/** บาร์โค้ดตกแต่ง สร้างจากรหัสออเดอร์ ใบละลาย */
function Barcode({ order }: { order: Order }) {
  const rand = rng(hash(order.id + 'bar'));
  const bars = Array.from({ length: 30 }, () => 1 + Math.floor(rand() * 3));
  return (
    <span className="tc-barcode" aria-hidden="true">
      {bars.map((w, i) => <i key={i} style={{ width: w }} />)}
    </span>
  );
}

// ---------- ลูกเล่นเอียงการ์ดตามนิ้ว ----------

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', ((0.5 - py) * 10).toFixed(2) + 'deg');
    el.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
  };
  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return { ref, onPointerMove, onPointerLeave };
}

// ---------- ส่วนประกอบของบัตร ----------

function BackButton() {
  return (
    <button className="tback" onClick={() => actions.customerTab('mine')} aria-label="กลับ">
      <Icon name="back" size={22} weight={2.4} />
    </button>
  );
}

function ModPill({ mods }: { mods: string[] }) {
  if (!mods.length) return null;
  return <div className="tc-mods">{mods.map((m) => <span key={m}>{m}</span>)}</div>;
}

interface CardProps {
  order: Order;
  caption: string;
  stamp?: string;
  children: ReactNode;
}

/** ตัวบัตร: ครึ่งบนสีประจำคิว + เลขใหญ่ / รอยฉีก / ต้นขั้วสีขาวเก็บรายละเอียด */
function TicketCard({ order, caption, stamp, children }: CardProps) {
  const id = identityOf(order.no);
  const stall = getStall(order.stallId);
  const seed = hash(order.id);
  const tilt = useTilt();
  const placed = new Date(order.placedAt);
  const time = placed.getHours().toString().padStart(2, '0') + ':' + placed.getMinutes().toString().padStart(2, '0');

  return (
    <div className="tcard" {...tilt}>
      <div className="tc-head">
        <Confetti seed={seed} shape={id.shape} count={12} className="tc-confetti" />
        <div className="tc-sheen" aria-hidden="true" />

        <div className="tc-row">
          <span className="tc-stall">{stallLabel(stall)}</span>
          <span className="tc-name">บัตรลาย “{ticketName(order)}”</span>
        </div>

        <div className="tc-glyph"><Shape shape={id.shape} size={34} color="currentColor" filled /></div>
        <div className="qnum">{padQueueNo(order.no)}</div>
        <div className="tc-caption">{caption}</div>
      </div>
      {/* อยู่นอกส่วนหัว เพราะส่วนหัวของบัตรที่ยังไม่จ่ายถูกทำเป็นสีเทา ตราประทับต้องยังแดงอยู่ */}
      {stamp && <div className="tc-stamp">{stamp}</div>}

      <div className="tc-perf" aria-hidden="true" />

      <div className="tc-stub">
        {children}
        <div className="tc-meta">
          <span className="num">#{serial(order)}</span>
          <Barcode order={order} />
          <span className="num">{time}</span>
        </div>
      </div>
    </div>
  );
}

/** แถบความคืบหน้า: รูปทรงประจำคิววิ่งเข้าหาร้าน */
function Progress({ order, ahead }: { order: Order; ahead: number }) {
  const id = identityOf(order.no);
  const span = 8;
  const pct = Math.round((1 - Math.min(ahead, span) / span) * 100);
  return (
    <div className="tc-progress">
      <div className="tp-track">
        <div className="tp-fill" style={{ width: pct + '%' }} />
        <div className="tp-runner" style={{ left: pct + '%' }}>
          <Shape shape={id.shape} size={18} color="#fff" filled />
        </div>
        <span className="tp-goal" aria-hidden="true">🍽️</span>
      </div>
    </div>
  );
}

function screenStyle(order: Order): CSSProperties {
  const id = identityOf(order.no);
  return { '--c': id.color, '--fg': id.chipFg } as CSSProperties;
}

export function Ticket({ order, orders }: { order: Order; orders: Order[] }) {
  if (order.status === 'unpaid') return <UnpaidTicket order={order} />;
  if (order.status === 'ready') return <ReadyTicket order={order} />;
  return <WaitingTicket order={order} orders={orders} />;
}

/** บัตรระหว่างรอ */
function WaitingTicket({ order, orders }: { order: Order; orders: Order[] }) {
  const id = identityOf(order.no);
  const stall = getStall(order.stallId);
  const ahead = aheadOf(orders, order);
  const soon = ahead <= PREPARE_AT;
  const { notifyPermission } = useStore();

  return (
    <div className="ticket" style={screenStyle(order)}>
      <Confetti seed={hash(order.id + 'bg')} shape={id.shape} count={9} className="t-bg" />
      <div className="t-top">
        <BackButton />
        <span className="t-title">บัตรคิวของคุณ</span>
      </div>

      <TicketCard order={order} caption={ahead === 0 ? 'ถึงคิวคุณแล้ว กำลังทำอยู่' : 'เลขคิวของคุณ'}>
        {soon && (
          <div className="tc-soon">
            <Icon name="bell" size={18} weight={2.2} />
            <span>อีก {ahead} คิวถึงคุณแล้ว — เดินมารอที่<b>{stallLabel(stall)}</b>ได้เลย</span>
          </div>
        )}
        <div className="tc-dish">{orderTitle(order)}</div>
        <div className="tc-sub">{stall.name}</div>
        <ModPill mods={orderMods(order)} />

        <div className="tc-eta">
          <div>
            <b>{ahead === 0 ? 'กำลังทำของคุณ' : `อีก ${ahead} คิวถึงคุณ`}</b>
            <small>ประมาณ {waitMins(stall, ahead)} นาที</small>
          </div>
        </div>
        <Progress order={order} ahead={ahead} />
      </TicketCard>

      {/* วางใต้บัตร บัตรต้องเป็นสิ่งแรกที่เห็น */}
      <NotifyPrompt permission={notifyPermission} />

      <button className="t-cancel" onClick={() => actions.cancel(order.id)}>ยกเลิกออเดอร์</button>
    </div>
  );
}

/** ถึงคิวแล้ว — หน้าที่เดียวคือยกขึ้นให้แม่ค้าดู จึงฉลองให้เต็มที่แต่ไม่มีอะไรเกินจำเป็น */
function ReadyTicket({ order }: { order: Order }) {
  const id = identityOf(order.no);
  const stall = getStall(order.stallId);

  return (
    <div className="ticket ready" style={screenStyle(order)}>
      <Confetti seed={hash(order.id + 'burst')} shape={id.shape} count={18} className="t-burst" />
      <div className="t-top">
        <BackButton />
        <span className="t-title">ถึงคิวแล้ว! 🎉</span>
      </div>

      <TicketCard order={order} caption="รับอาหารได้เลย">
        <div className="tc-showme">
          <b>ไปรับที่{stallLabel(stall)}</b>
          <span>แสดงหน้าจอนี้ให้แม่ค้าดู</span>
        </div>
        <div className="tc-dish">{orderTitle(order)}</div>
        <ModPill mods={orderMods(order)} />
      </TicketCard>

      <button className="t-collect" onClick={() => actions.collect(order.id)}>
        <Icon name="shield" size={20} weight={2.2} />
        รับอาหารแล้ว
      </button>
    </div>
  );
}

/** ยังไม่จ่าย — บัตรเป็นสีเทาพร้อมตราประทับ ดูออกทันทีว่ายังไม่เข้าคิว */
function UnpaidTicket({ order }: { order: Order }) {
  const stall = getStall(order.stallId);
  const left = Math.max(0, CASH_TIMEOUT - (Date.now() - order.placedAt));
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div className="ticket dead" style={screenStyle(order)}>
      <div className="t-top">
        <BackButton />
        <span className="t-title">รอชำระเงิน</span>
      </div>

      <TicketCard order={order} caption="จองเลขไว้ให้แล้ว" stamp="ยังไม่เข้าคิว">
        <div className="tc-deadbar">ยังไม่เข้าคิว — ชำระที่ร้านก่อน</div>
        <div className="tc-dish">{orderTitle(order)}</div>
        <div className="tc-sub">{stallLabel(stall)} · {stall.name}</div>
        <div className="tc-eta">
          <div>
            <b className="num">{baht(orderTotal(order))}</b>
            <small>{PAYMENTS[order.pay].waitingNote}</small>
          </div>
          <div className="tc-timer">
            <small>ยกเลิกอัตโนมัติใน</small>
            <b className="num">{mm}:{String(ss).padStart(2, '0')}</b>
          </div>
        </div>
      </TicketCard>

      <button className="t-cancel" onClick={() => actions.cancel(order.id)}>ยกเลิกออเดอร์</button>
    </div>
  );
}

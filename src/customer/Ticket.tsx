import { PAYMENTS, getStall } from '../lib/data';
import { identityOf } from '../lib/identity';
import { CASH_TIMEOUT, PREPARE_AT, aheadOf, orderTitle, orderTotal, waitMins } from '../lib/queue';
import { actions } from '../lib/store';
import { baht, padQueueNo } from '../lib/thai';
import type { Order } from '../lib/types';
import { Shape } from '../components/Shape';
import { NotifyPrompt } from '../components/NotifyPrompt';
import { useStore } from '../lib/store';

function BackButton() {
  return (
    <button className="tback" onClick={() => actions.customerTab('mine')} aria-label="กลับ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
  );
}

function ModPill({ mods }: { mods: string[] }) {
  if (!mods.length) return null;
  return <div className="modpill"><b>{mods.join(' · ')}</b></div>;
}

export function Ticket({ order, orders }: { order: Order; orders: Order[] }) {
  if (order.status === 'unpaid') return <UnpaidTicket order={order} />;
  if (order.status === 'ready') return <ReadyTicket order={order} />;
  return <WaitingTicket order={order} orders={orders} />;
}

/** บัตรคิวปกติ — พื้นสีเต็มจอ ต้องอ่านออกจากระยะ 2 เมตร */
function WaitingTicket({ order, orders }: { order: Order; orders: Order[] }) {
  const id = identityOf(order.no);
  const stall = getStall(order.stallId);
  const ahead = aheadOf(orders, order);
  const soon = ahead <= PREPARE_AT;
  const { notifyPermission } = useStore();

  return (
    <div className="ticket" style={{ background: id.color }}>
      <BackButton />

      {soon && (
        <div className="banner">
          <span className="bell">🔔</span>
          <span>อีก {ahead} คิวถึงคุณแล้ว — เดินมารอที่ร้านได้เลย</span>
        </div>
      )}

      <NotifyPrompt permission={notifyPermission} />

      <div className="glyph"><Shape shape={id.shape} size={60} color="#fff" /></div>
      <div className="qnum">{padQueueNo(order.no)}</div>
      <div className="stall">{stall.name}</div>
      <div className="dish">{orderTitle(order)}</div>
      <ModPill mods={order.mods} />

      <div className="eta">
        {ahead === 0 ? 'ถึงคิวคุณแล้ว กำลังทำอยู่' : `อีก ${ahead} คิวถึงคุณ`}
        <small>ประมาณ {waitMins(stall, ahead)} นาที</small>
      </div>

      <div className="dots">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} className={i < 6 - Math.min(6, ahead) ? 'on' : ''} />
        ))}
      </div>

      <div className="spacer" />
      <button className="btn onwhite" onClick={() => actions.cancel(order.id)}>ยกเลิกออเดอร์</button>
    </div>
  );
}

/** หน้าจอตอนรับอาหาร — มีหน้าที่เดียวคือยกขึ้นให้แม่ค้าดู จึงไม่มีอะไรอย่างอื่น */
function ReadyTicket({ order }: { order: Order }) {
  const id = identityOf(order.no);

  return (
    <div className="ticket ready" style={{ background: id.color }}>
      <BackButton />
      <div className="showme">แสดงหน้าจอนี้ให้แม่ค้าดู</div>

      <div className="readyrow">
        <Shape shape={id.shape} size={96} color="#fff" />
        <div className="qnum big">{padQueueNo(order.no)}</div>
      </div>

      <div className="dish">{orderTitle(order)}</div>
      <ModPill mods={order.mods} />

      <div className="gap" />
      <button className="btn white" style={{ color: id.color }} onClick={() => actions.collect(order.id)}>
        รับอาหารแล้ว
      </button>
    </div>
  );
}

/** บัตรเงินสดที่ยังไม่จ่าย — ต้องดู "ตาย" ต่างจากบัตรที่เข้าคิวแล้วอย่างชัดเจน */
function UnpaidTicket({ order }: { order: Order }) {
  const stall = getStall(order.stallId);
  const left = Math.max(0, CASH_TIMEOUT - (Date.now() - order.placedAt));
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div className="ticket dead">
      <BackButton />
      <div className="deadbar">ยังไม่เข้าคิว — ชำระที่ร้านก่อน</div>
      <div className="qnum faded">{padQueueNo(order.no)}</div>
      <div className="stall">{stall.name}</div>
      <div className="dish">{orderTitle(order)}</div>

      <div className="eta">
        {baht(orderTotal(order))}
        <small>{PAYMENTS[order.pay].waitingNote}</small>
      </div>
      <div className="eta small">
        ยกเลิกอัตโนมัติใน <span className="num">{mm}:{String(ss).padStart(2, '0')}</span>
      </div>

      <div className="spacer" />
      <button className="btn onwhite" onClick={() => actions.cancel(order.id)}>ยกเลิกออเดอร์</button>
    </div>
  );
}

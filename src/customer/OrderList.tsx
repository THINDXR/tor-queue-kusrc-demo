import { getStall } from '../lib/data';
import { orderTitle, orderTotal } from '../lib/queue';
import { actions } from '../lib/store';
import { baht } from '../lib/thai';
import type { Order, OrderStatus } from '../lib/types';
import { QueueChip } from '../components/QueueChip';

const LABELS: Record<OrderStatus, string> = {
  unpaid: 'รอชำระ',
  queued: 'กำลังรอ',
  ready: 'รับได้แล้ว',
  done: 'รับแล้ว',
  cancelled: 'ยกเลิก',
};

function Row({ order }: { order: Order }) {
  const finished = order.status === 'done' || order.status === 'cancelled';

  return (
    <div className={finished ? 'card finished' : 'card tappable'}>
      <div
        className="row centered"
        onClick={finished ? undefined : () => actions.openTicket(order.id)}
      >
        <div className="rowmain">
          <QueueChip no={order.no} muted={finished} />
          <div>
            <div className="title">{orderTitle(order)}</div>
            <div className="sub">
              {getStall(order.stallId).name}
              {order.mods.length > 0 && ' · ' + order.mods.join(' ')}
            </div>
          </div>
        </div>
        <div className="sub nowrap">{LABELS[order.status]}</div>
      </div>

      {finished && (
        <button className="btn reorder" onClick={() => actions.reorder(order.id)}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11a8 8 0 1 0-2.3 5.7" />
            <path d="M20 5v6h-6" />
          </svg>
          สั่งอีกครั้ง · {baht(orderTotal(order))}
        </button>
      )}
    </div>
  );
}

interface Props {
  title: string;
  orders: Order[];
  empty: string;
}

export function OrderList({ title, orders, empty }: Props) {
  return (
    <>
      <div className="head">
        <div className="eyebrow">ต่อคิว</div>
        <h1>{title}</h1>
      </div>
      <div className="scroll">
        {orders.length ? (
          orders.map((o) => <Row key={o.id} order={o} />)
        ) : (
          <div className="empty">{empty}</div>
        )}
      </div>
    </>
  );
}

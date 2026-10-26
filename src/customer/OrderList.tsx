import { getDish, getStall, stallLabel } from '../lib/data';
import { orderMods, orderTitle, orderTotal } from '../lib/queue';
import { actions } from '../lib/store';
import { baht } from '../lib/thai';
import type { Order, OrderStatus } from '../lib/types';
import { QueueChip } from '../components/QueueChip';
import { Icon } from '../components/Icon';
import { FoodArt } from '../components/FoodArt';

const LABELS: Record<OrderStatus, string> = {
  unpaid: 'รอชำระ',
  queued: 'กำลังรอ',
  ready: 'รับได้แล้ว',
  done: 'รับแล้ว',
  cancelled: 'ยกเลิก',
};

/** เมนูที่ร้านเอาออกไปแล้วยังต้องแสดงในประวัติได้ จึงถอยไปใช้รูปประจำร้านแทน */
function artOf(order: Order): { emoji: string; img?: string } {
  const stall = getStall(order.stallId);
  const first = order.lines[0];
  return first && stall.menu.some((m) => m.id === first.dishId) ? getDish(stall.id, first.dishId) : stall;
}

function Row({ order }: { order: Order }) {
  const finished = order.status === 'done' || order.status === 'cancelled';
  const stall = getStall(order.stallId);

  return (
    <div className={finished ? 'card finished' : 'card tappable'}>
      <div
        className="row centered"
        onClick={finished ? undefined : () => actions.openTicket(order.id)}
      >
        <div className="rowmain">
          <FoodArt {...artOf(order)} tint={stall.tint} size={60} radius={14} />
          <div className="minw0">
            <div className="title">{orderTitle(order)}</div>
            <div className="sub">
              <b className="ku">{stallLabel(stall)}</b> · {stall.name}
              {orderMods(order).length > 0 && ' · ' + orderMods(order).join(' · ')}
            </div>
            <div className="ol-chip"><QueueChip no={order.no} muted={finished} /></div>
          </div>
        </div>
        <div className={'status st-' + order.status}>{LABELS[order.status]}</div>
      </div>

      {finished && (
        <button className="btn reorder" onClick={() => actions.reorder(order.id)}>
          <Icon name="repeat" size={19} weight={2.2} />
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
        <div className="eyebrow">โรงอาหาร มก. ศรีราชา</div>
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

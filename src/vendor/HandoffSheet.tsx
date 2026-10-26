import { identityOf } from '../lib/identity';
import { orderMods, orderTitle } from '../lib/queue';
import { actions } from '../lib/store';
import { padQueueNo, thaiWords } from '../lib/thai';
import type { Order } from '../lib/types';
import { Shape } from '../components/Shape';
import { Icon } from '../components/Icon';

/**
 * แผ่นส่งมอบ — แม่ค้าเห็นสี รูปทรง และเลข ชุดเดียวกับที่ลูกค้ายกจอขึ้นมาโชว์
 * จับคู่ได้ด้วยการเหลือบตา ไม่ต้องอ่านตัวเลขในร้านที่เสียงดังและคนเยอะ
 */
export function HandoffSheet({ order }: { order: Order }) {
  const id = identityOf(order.no);

  return (
    <div className="backdrop" onClick={() => actions.closeSheet()}>
      <div className="sheet" style={{ background: id.color }} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <Shape shape={id.shape} size={104} color="#fff" />
        <div className="qnum">{padQueueNo(order.no)}</div>
        <div className="dish">{orderTitle(order)}</div>
        {orderMods(order).length > 0 && <div className="mods">{orderMods(order).join(' · ')}</div>}

        <div className="panel">
          <p>เรียกคิวนี้ — ให้ลูกค้าโชว์หน้าจอสีเดียวกัน</p>
          <button className="speak" onClick={() => actions.speakAgain(order.no)}>
            <Icon name="speaker" size={22} />
            ประกาศ: คิว{thaiWords(order.no)}
          </button>
        </div>

        <button className="btn white" style={{ color: id.color }} onClick={() => actions.handOver(order.id)}>
          ส่งมอบแล้ว
        </button>
        <button className="btn translucent" onClick={() => actions.skip(order.id)}>
          {order.skipped ? 'ไม่มารับอีก — ยกเลิกคิวนี้' : 'ยังไม่มารับ — ข้ามไปก่อน'}
        </button>
        <button className="btn outline" onClick={() => actions.closeSheet()}>ปิด</button>
      </div>
    </div>
  );
}

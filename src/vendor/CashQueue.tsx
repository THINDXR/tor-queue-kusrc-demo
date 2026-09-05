import { CASH_TIMEOUT, orderTitle, orderTotal, unpaidOf } from '../lib/queue';
import { PAYMENTS } from '../lib/data';
import { actions } from '../lib/store';
import { baht, padQueueNo } from '../lib/thai';
import type { Order } from '../lib/types';

export function CashQueue({ orders, stallId }: { orders: Order[]; stallId: string }) {
  const list = unpaidOf(orders, stallId);

  if (!list.length) {
    return <div className="scroll"><div className="empty">ไม่มีคิวรอชำระ</div></div>;
  }

  return (
    <div className="scroll">
      <div className="warn spaced">
        <span>ℹ</span>
        <span>คิวเหล่านี้จะยังไม่เข้าคิวทำอาหาร จนกว่าจะกดยืนยันว่าได้รับเงินแล้ว</span>
      </div>

      {list.map((o) => {
        const left = Math.max(0, CASH_TIMEOUT - (Date.now() - o.placedAt));
        const mm = Math.floor(left / 60000);
        const ss = Math.floor((left % 60000) / 1000);

        return (
          <div key={o.id} className="card">
            <div className="cashrow">
              <span className="qchip muted">{padQueueNo(o.no)}</span>
              <div>
                <div className="title">{orderTitle(o)}</div>
                <div className="sub">
                  ยกเลิกอัตโนมัติใน <span className="num">{mm}:{String(ss).padStart(2, '0')}</span>
                </div>
              </div>
              <div className="amt">{baht(orderTotal(o))}</div>
            </div>
            <div className="pillrow"><span className="pill">{PAYMENTS[o.pay].label}</span></div>
            <button className="btn go" onClick={() => actions.confirmCash(o.id)}>
              {PAYMENTS[o.pay].confirmLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}

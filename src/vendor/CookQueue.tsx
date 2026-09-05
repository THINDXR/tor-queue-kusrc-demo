import { CASH_TIMEOUT, cookQueue, groupsOf, unpaidOf } from '../lib/queue';
import { actions } from '../lib/store';
import type { Group, Order } from '../lib/types';
import { QueueChip } from '../components/QueueChip';

/**
 * แถบเตือนคิวรอชำระ ปักหมุดไว้บนสุดของคิวทำอาหาร
 *
 * เดิมมีแค่ตัวเลขเล็ก ๆ บนแท็บ ซึ่งต้องอาศัยให้แม่ค้าเงยหน้ามามอง
 * แถบนี้อยู่บนหน้าจอที่แม่ค้าเปิดค้างอยู่แล้วตลอดเวลา และเลื่อนตามไปด้วย
 * พร้อมนับถอยหลังให้เห็นว่าอีกกี่นาทีคิวนั้นจะถูกยกเลิกอัตโนมัติ
 */
function PaymentAlert({ orders, stallId }: { orders: Order[]; stallId: string }) {
  const waiting = unpaidOf(orders, stallId);
  if (!waiting.length) return null;

  const soonest = Math.min(...waiting.map((o) => CASH_TIMEOUT - (Date.now() - o.placedAt)));
  const left = Math.max(0, soonest);
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <button className="payalert" onClick={() => actions.vendorTab('cash')}>
      <span className="dot" aria-hidden="true" />
      <span className="grow">
        <b>{waiting.length} คิวรอรับเงิน</b>
        <small>
          กดเพื่อไปยืนยัน · คิวแรกเหลือ <span className="num">{mm}:{String(ss).padStart(2, '0')}</span>
        </small>
      </span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function GroupCard({ group }: { group: Group }) {
  const n = group.orders.length;

  return (
    <div className={group.special ? 'card group special' : 'card group'}>
      {/* ออเดอร์พิเศษไม่มีแท็บของตัวเองแล้ว จึงต้องอ่านออกทันทีในคิวหลัก */}
      {group.special && <div className="specialtag">พิเศษ — ทำแยก ห้ามสลับจาน</div>}

      <div className="top">
        <div>
          <div className="dish">
            {group.label}
            {n > 1 && <em> ×{n}</em>}
          </div>
          {group.special && <div className="mods">{group.mods.join(' · ')}</div>}
        </div>
        <div className="qchips">
          {group.orders.map((o) => <QueueChip key={o.id} no={o.no} />)}
        </div>
      </div>

      <button className="btn go" onClick={() => actions.finishOne(group.key)}>
        {n > 1 ? 'เสร็จ 1 จาน' : 'เสร็จแล้ว'}
      </button>
    </div>
  );
}

export function CookQueue({ orders, stallId }: { orders: Order[]; stallId: string }) {
  const { cooking, waiting } = cookQueue(orders, stallId);
  const total = cooking.length + waiting.length;

  return (
    <div className="scroll">
      <PaymentAlert orders={orders} stallId={stallId} />

      {total === 0 ? (
        <div className="empty">ยังไม่มีคิวรอทำ สบายๆ ครับ</div>
      ) : (
        <>
          <div className="bigcount">
            <span className="n">{total}</span>
            <span className="l">คิวรอ</span>
          </div>

          {cooking.length > 0 && (
            <>
              <div className="section">กำลังทำ</div>
              {groupsOf(cooking).map((g) => <GroupCard key={g.key} group={g} />)}
            </>
          )}

          {waiting.length > 0 && (
            <>
              <div className="section">รอทำ</div>
              {groupsOf(waiting).map((g) => <GroupCard key={g.key} group={g} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

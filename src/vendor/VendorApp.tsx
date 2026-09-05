import { useEffect, useRef } from 'react';
import { STALLS } from '../lib/data';
import { unpaidOf } from '../lib/queue';
import { alertVendor } from '../lib/alert';
import { actions, orderById, useStore } from '../lib/store';
import type { VendorTab } from '../lib/types';
import { CashQueue } from './CashQueue';
import { CookQueue } from './CookQueue';
import { HandoffSheet } from './HandoffSheet';
import { Summary } from './Summary';

const TABS: { key: VendorTab; label: string }[] = [
  { key: 'cook', label: 'คิวทำอาหาร' },
  { key: 'cash', label: 'รอชำระ' },
  { key: 'summary', label: 'สรุป' },
];

export function VendorApp() {
  const { vend, orders, sheetId } = useStore();
  const stallId = vend.stallId;
  const waitingPayment = unpaidOf(orders, stallId).length;
  const sheetOrder = orderById(sheetId);

  // เตือนด้วยเสียงเมื่อมีคิวรอชำระเพิ่มขึ้น ไม่ใช่ตอนเปิดหน้าจอครั้งแรก
  // จะได้ไม่ร้องรัวตอนแม่ค้าเพิ่งเปิดแอปมาเจอคิวค้างจากเมื่อกี้
  const seen = useRef<number | null>(null);
  useEffect(() => {
    const before = seen.current;
    seen.current = waitingPayment;
    if (before !== null && waitingPayment > before) {
      alertVendor('มีคิวรอรับเงิน');
    }
  }, [waitingPayment]);

  // เปลี่ยนร้านแล้วเริ่มนับใหม่ ไม่งั้นจะเตือนเพราะร้านใหม่มีคิวเยอะกว่าเฉย ๆ
  useEffect(() => {
    seen.current = null;
  }, [stallId]);

  return (
    <>
      <div className="screen">
        <div className="head dark">
          <div className="eyebrow">ต่อคิว · ร้านค้า</div>
          <select
            className="stallpicker"
            value={stallId}
            onChange={(e) => actions.vendorStall(e.target.value)}
            aria-label="เลือกร้าน"
          >
            {STALLS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="vtabs">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => actions.vendorTab(t.key)} aria-current={vend.tab === t.key}>
              {t.label}
              {t.key === 'cash' && waitingPayment > 0 && (
                <span className="tabdot num">{waitingPayment}</span>
              )}
            </button>
          ))}
        </div>

        {vend.tab === 'cook' && <CookQueue orders={orders} stallId={stallId} />}
        {vend.tab === 'cash' && <CashQueue orders={orders} stallId={stallId} />}
        {vend.tab === 'summary' && <Summary orders={orders} stallId={stallId} />}
      </div>

      {sheetOrder && <HandoffSheet order={sheetOrder} />}
    </>
  );
}

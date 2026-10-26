import { useEffect, useRef } from 'react';
import { getStall, stallLabel } from '../lib/data';
import { unpaidOf } from '../lib/queue';
import { alertVendor } from '../lib/alert';
import { actions, orderById, useStore } from '../lib/store';
import type { VendorTab } from '../lib/types';
import { Icon } from '../components/Icon';
import { StallBadge } from '../components/StallBadge';
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
  const stall = getStall(stallId);

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
        {/* ร้านเข้าสู่ระบบมาแล้วจึงเห็นแต่ร้านตัวเอง ไม่มีตัวเลือกร้านให้กดพลาด */}
        <div className="head vhead">
          <StallBadge stall={stall} size="lg" />
          <div className="grow">
            <div className="eyebrow">ต่อคิว · ระบบร้านค้า</div>
            <div className="vname">{stall.name}</div>
            <div className="vsub">{stallLabel(stall)} · โรงอาหาร มก. ศรีราชา</div>
          </div>
          <button
            className="vlogout"
            onClick={() => { if (confirm('ออกจากระบบร้านนี้?')) actions.logout(); }}
            aria-label="ออกจากระบบ"
          >
            <Icon name="logout" size={21} weight={2.2} />
          </button>
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

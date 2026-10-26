import { useState } from 'react';
import { PAYMENTS, getDish, getStall, stallLabel } from '../lib/data';
import { actions, cartLines, cartTotal, useStore } from '../lib/store';
import { baht } from '../lib/thai';
import type { MenuItem, OrderLine, PaymentMethod } from '../lib/types';
import { FoodArt } from '../components/FoodArt';
import { Icon, type IconName } from '../components/Icon';
import { ModChips } from '../components/ModChips';
import { DishSheet } from './DishSheet';

const PAYMENT_ORDER: PaymentMethod[] = ['qr', 'cash', 'thai'];
const PAYMENT_ICON: Record<PaymentMethod, IconName> = { qr: 'qr', cash: 'cash', thai: 'heart' };

export function Checkout() {
  const state = useStore();
  const lines = cartLines(state);
  const total = cartTotal(state);
  const { pay, stallId } = state.cust;
  const stall = stallId ? getStall(stallId) : null;
  const [editing, setEditing] = useState<OrderLine | null>(null);
  const [adding, setAdding] = useState<MenuItem | null>(null);
  const dishes = [...new Set(lines.map((l) => l.dishId))];

  return (
    <>
      <div className="head">
        <button className="btn ghost linkish" onClick={() => actions.back()}>
          <Icon name="back" size={19} weight={2.4} />
          เพิ่มเมนู
        </button>
        <h1>ยืนยันออเดอร์</h1>
        {stall && <div className="sub"><b className="ku">{stallLabel(stall)}</b> · {stall.name}</div>}
      </div>

      <div className="scroll">
        <div className="card cart">
          {dishes.map((dishId) => {
            const dish = stall ? getDish(stall.id, dishId) : null;
            // บรรทัดที่มีหลายจานถูกกางออกเป็นทีละจาน แต่ละจานจะได้แก้/ลบของตัวเองได้
            const plates = lines.filter((l) => l.dishId === dishId).flatMap((l) => Array.from({ length: l.qty }, () => l));
            if (!dish || !stall) return null;
            return (
              <div key={dishId} className="dishgroup">
                <div className="dg-head">
                  <FoodArt emoji={dish.emoji} img={dish.img} tint={stall.tint} size={48} radius={12} alt={dish.name} />
                  <div className="grow">
                    <div className="name">{dish.name}</div>
                    <div className="sub">{baht(dish.price)} × {plates.length} จาน</div>
                  </div>
                  <div className="num money">{baht(dish.price * plates.length)}</div>
                </div>

                <ol className="plates">
                  {plates.map((p, i) => (
                    <li key={i} className="plate">
                      <span className="plate-no num">{i + 1}</span>
                      <ModChips mods={p.mods} />
                      <button className="plate-btn" onClick={() => setEditing(p)} aria-label={`แก้จานที่ ${i + 1}`}>
                        <Icon name="edit" size={18} weight={2.2} />แก้ไข
                      </button>
                      <button className="plate-btn del" onClick={() => actions.setQty(dishId, -1, p.mods)} aria-label={`ลบจานที่ ${i + 1}`}>
                        <Icon name="trash" size={18} weight={2.1} />ลบ
                      </button>
                    </li>
                  ))}
                </ol>

                {/* คำอธิบายบอกเฉพาะสิ่งที่จานนั้นเลือกได้จริง ข้าวมันไก่ไม่มีระดับความเผ็ด */}
                <button className="addplate" onClick={() => setAdding(dish)}>
                  <Icon name="plus" size={16} weight={2.6} />
                  เพิ่มอีกจาน
                  {dish.mods.length > 0 && (
                    <small>({dish.mods.some((g) => g.title === 'ระดับความเผ็ด') ? 'เลือกความเผ็ดใหม่ได้' : 'เลือกตัวเลือกใหม่ได้'})</small>
                  )}
                </button>
              </div>
            );
          })}
          <div className="item total-row">
            <div className="grow"><b>รวม</b></div>
            <div className="num grand">{baht(total)}</div>
          </div>
        </div>

        {lines.some((l) => l.mods.length > 0) && (
          <div className="warn">
            <Icon name="warn" size={21} weight={2.1} />
            <span>เมนูที่ปรับแต่งพิเศษอาจใช้เวลานานขึ้น 2–3 นาที</span>
          </div>
        )}

        <h2 className="sec"><span>วิธีชำระเงิน</span></h2>
        <div className="pay" role="radiogroup" aria-label="วิธีชำระเงิน">
          {PAYMENT_ORDER.map((key) => (
            <button key={key} role="radio" aria-checked={pay === key} onClick={() => actions.setPay(key)}>
              <span className="pay-ico"><Icon name={PAYMENT_ICON[key]} size={22} weight={2.1} /></span>
              <span className="pay-txt">
                <span className="t">{PAYMENTS[key].label}</span>
                <span className="s">{PAYMENTS[key].hint}</span>
              </span>
            </button>
          ))}
        </div>

      </div>

      <div className="dock">
        <button className="cartbar" onClick={() => actions.place()}>
          <span className="cb-ticket" aria-hidden="true">🎫</span>
          <span className="grow">ยืนยันและรับคิว</span>
          <span className="num">{baht(total)}</span>
          <Icon name="next" size={20} weight={2.4} />
        </button>
      </div>
      {editing && stall && (
        <DishSheet
          key={editing.dishId + editing.mods.join('|')}
          item={getDish(stall.id, editing.dishId)}
          stall={stall}
          editing={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {adding && stall && <DishSheet key={adding.id} item={adding} stall={stall} onClose={() => setAdding(null)} />}
    </>
  );
}

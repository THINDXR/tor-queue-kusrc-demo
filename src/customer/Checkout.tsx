import { MODS, PAYMENTS } from '../lib/data';
import { actions, cartLines, cartTotal, useStore } from '../lib/store';
import { baht } from '../lib/thai';
import type { PaymentMethod } from '../lib/types';

const PAYMENT_ORDER: PaymentMethod[] = ['qr', 'cash', 'thai'];

export function Checkout() {
  const state = useStore();
  const lines = cartLines(state);
  const total = cartTotal(state);
  const { mods, pay } = state.cust;

  return (
    <>
      <div className="head">
        <button className="btn ghost linkish" onClick={() => actions.back()}>← กลับ</button>
        <h1>ยืนยันออเดอร์</h1>
      </div>

      <div className="scroll">
        <div className="card">
          {lines.map((l) => (
            <div key={l.dishId} className="item">
              <div className="grow"><div className="name">{l.name}</div></div>
              <div className="num">×{l.qty}</div>
              <div className="num money">{baht(l.price * l.qty)}</div>
            </div>
          ))}
          <div className="item total-row">
            <div className="grow"><b>รวม</b></div>
            <div className="num grand">{baht(total)}</div>
          </div>
        </div>

        <div className="cat">ตัวเลือกพิเศษ</div>
        <div className="chips">
          {MODS.map((m) => (
            <button
              key={m}
              className="chip"
              onClick={() => actions.toggleMod(m)}
              aria-pressed={mods.includes(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {mods.length > 0 && (
          <div className="warn">
            <span>⚠</span>
            <span>ออเดอร์พิเศษอาจใช้เวลานานกว่าปกติ 2-3 นาที เพราะทำรวมกับจานอื่นไม่ได้</span>
          </div>
        )}

        <div className="cat">วิธีชำระเงิน</div>
        <div className="pay">
          {PAYMENT_ORDER.map((key) => (
            <button key={key} onClick={() => actions.setPay(key)} aria-pressed={pay === key}>
              <div className="t">{PAYMENTS[key].label}</div>
              <div className="s">{PAYMENTS[key].hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="dock">
        <button className="btn primary" onClick={() => actions.place()}>ยืนยันและรับคิว</button>
      </div>
    </>
  );
}

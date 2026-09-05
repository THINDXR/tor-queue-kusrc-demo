import { getStall } from '../lib/data';
import { isSpecial, queueOf } from '../lib/queue';
import { actions, cartLines, cartTotal, useStore } from '../lib/store';
import { baht } from '../lib/thai';

export function StallMenu({ stallId }: { stallId: string }) {
  const state = useStore();
  const stall = getStall(stallId);
  const cats = [...new Set(stall.menu.map((m) => m.cat))];
  const lines = cartLines(state);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <div className="head">
        <button className="btn ghost linkish" onClick={() => actions.back()}>← กลับ</button>
        <h1>{stall.name}</h1>
      </div>

      <div className="scroll">
        {cats.map((cat) => (
          <div key={cat}>
            <div className="cat">{cat}</div>
            <div className="card">
              {stall.menu
                .filter((m) => m.cat === cat)
                .map((item) => {
                  const qty = state.cust.cart[item.id] ?? 0;
                  // จำนวนจานเดียวกันที่กำลังทำอยู่ = สัญญาณว่าจานนี้จะได้เร็ว เพราะทำรวมกันได้
                  const same = queueOf(state.orders, stall.id).filter(
                    (o) => !isSpecial(o) && o.lines.length === 1 && o.lines[0]?.dishId === item.id,
                  ).length;

                  return (
                    <div key={item.id} className="item">
                      <div className="grow">
                        <div className="name">{item.name}</div>
                        <div className="price">{baht(item.price)}</div>
                        {same >= 2 && <div className="hint">กำลังทำอยู่ {same} จาน — ได้เร็ว</div>}
                      </div>
                      <div className="stepper">
                        <button
                          onClick={() => actions.setQty(item.id, -1)}
                          disabled={qty === 0}
                          aria-label={`ลด ${item.name}`}
                        >
                          −
                        </button>
                        <div className="qty num">{qty}</div>
                        <button onClick={() => actions.setQty(item.id, 1)} aria-label={`เพิ่ม ${item.name}`}>
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="dock">
        <button className="btn primary" onClick={() => actions.toCheckout()} disabled={count === 0}>
          {count > 0 ? `ตะกร้า ${count} รายการ · ${baht(cartTotal(state))}` : 'เลือกเมนูก่อน'}
        </button>
      </div>
    </>
  );
}

import { useState, type CSSProperties } from 'react';
import { getStall } from '../lib/data';
import { batchingCount, queueOf, waitMins } from '../lib/queue';
import { actions, cartLines, cartTotal, useStore } from '../lib/store';
import { baht } from '../lib/thai';
import type { MenuItem } from '../lib/types';
import { FoodArt } from '../components/FoodArt';
import { Icon } from '../components/Icon';
import { Nontri } from '../components/Brand';
import { DishSheet } from './DishSheet';

const CAT_EMOJI: Record<string, string> = {
  'ตามสั่ง': '🍳', 'ข้าวราด': '🍛', 'แกง': '🍲', 'จานเดียว': '🍽️', 'ก๋วยเตี๋ยว': '🍜', 'ตำ': '🥗', 'ย่าง': '🍗',
};

export function StallMenu({ stallId }: { stallId: string }) {
  const state = useStore();
  const stall = getStall(stallId);
  const cats = [...new Set(stall.menu.map((m) => m.cat))];
  const lines = cartLines(state);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const queueLen = queueOf(state.orders, stall.id).length;
  const [open, setOpen] = useState<MenuItem | null>(null);

  return (
    <>
      <div className="scroll menu-scroll">
        {/* ภาพปกร้าน — เห็นแล้วรู้ทันทีว่าเข้ามาถูกร้าน ไม่ต้องอ่านชื่อ */}
        <div className="cover" style={{ '--tint': stall.tint } as CSSProperties}>
          {stall.img ? (
            <img src={stall.img} alt="" />
          ) : (
            <div className="cover-art" aria-hidden="true">
              {stall.menu.slice(0, 4).map((m) => <span key={m.id}>{m.emoji}</span>)}
            </div>
          )}
          <button className="cover-back" onClick={() => actions.back()} aria-label="กลับ">
            <Icon name="back" size={22} weight={2.4} />
          </button>
        </div>

        <div className="stallinfo">
          <Nontri size={26} className="si-flower" />
          <div className="si-no">
            <small>ร้าน</small>
            <b className="num">{stall.no}</b>
          </div>
          <div className="si-main">
            <h1>{stall.name}</h1>
            <div className="si-meta">
              <span><Icon name="clock" size={15} weight={2.4} />รอ ~<b className="num">{waitMins(stall, queueLen)}</b> นาที</span>
              <span><Icon name="ticket" size={15} weight={2.2} /><b className="num">{queueLen}</b> คิว</span>
            </div>
          </div>
        </div>

        {cats.map((cat) => (
          <section key={cat} className="menusec">
            <h2 className="sec cat-head">
              <span>{CAT_EMOJI[cat] ?? '🍽️'} {cat}</span>
              <small className="cat-count">{stall.menu.filter((m) => m.cat === cat).length} เมนู</small>
            </h2>
            {stall.menu
              .filter((m) => m.cat === cat)
              .map((item) => {
                const qty = lines.filter((l) => l.dishId === item.id).reduce((s, l) => s + l.qty, 0);
                const same = batchingCount(state.orders, stall.id, item.id);

                return (
                  <button
                    key={item.id}
                    className={qty > 0 ? 'menuitem picked' : 'menuitem'}
                    onClick={() => setOpen(item)}
                  >
                    <FoodArt emoji={item.emoji} img={item.img} tint={stall.tint} size={88} radius={16} alt={item.name} />
                    <span className="mi-body">
                      <span className="mi-name">{item.name}</span>
                      {same >= 2 && <span className="hint">กำลังทำอยู่ {same} จาน — ได้เร็ว</span>}
                      <span className="mi-foot">
                        <span className="mi-price num">{baht(item.price)}</span>
                        <span className="addbtn" aria-label={`เพิ่ม ${item.name}`}>
                          <Icon name="plus" size={22} weight={2.6} />
                          {qty > 0 && <b key={qty} className="ab-count num">{qty}</b>}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
          </section>
        ))}
      </div>

      {/* แถบตะกร้าโผล่เมื่อมีของเท่านั้น จอจะได้ไม่มีปุ่มกดไม่ได้ค้างอยู่ */}
      {count > 0 && (
        <div className="dock">
          <button className="cartbar" onClick={() => actions.toCheckout()}>
            {/* key เปลี่ยนทุกครั้งที่จำนวนเปลี่ยน ตัวเลขจึงเด้งให้เห็นว่าใส่ตะกร้าแล้ว */}
            <span key={count} className="cb-count num">{count}</span>
            <span className="grow">{`ตะกร้า ${count} รายการ`}</span>
            <span className="num">{baht(cartTotal(state))}</span>
            <Icon name="next" size={20} weight={2.4} />
          </button>
        </div>
      )}

      {open && <DishSheet key={open.id} item={open} stall={stall} onClose={() => setOpen(null)} />}
    </>
  );
}

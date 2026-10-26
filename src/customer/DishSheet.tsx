import { useState } from 'react';
import { actions } from '../lib/store';
import { baht } from '../lib/thai';
import type { MenuItem, ModGroup, Stall } from '../lib/types';
import { FoodArt } from '../components/FoodArt';
import { Icon } from '../components/Icon';
import { spiceIcon, spiceTone } from '../components/ModChips';

interface Props {
  item: MenuItem;
  stall: Stall;
  /** เปิดจากหน้ายืนยันเพื่อแก้ตัวเลือกของจานเดียว */
  editing?: { mods: string[] };
  onClose: () => void;
}

/**
 * แผ่นเลือกตัวเลือกแบบ Grab — เลือกความเผ็ด/เส้น/ของเพิ่มตอนหยิบจานใส่ตะกร้า
 * ตัวเลือกจึงผูกกับจานนั้นจานเดียว สั่งกะเพราสองจานคนละความเผ็ดก็แยกกันได้
 */
const GROUP_EMOJI: Record<string, string> = { 'เส้น': '🍜', 'ระดับความเผ็ด': '🌶️', 'เพิ่มเติม': '✨' };

export function DishSheet({ item, stall, editing, onClose }: Props) {
  const [picked, setPicked] = useState<string[]>(editing?.mods ?? []);
  const [qty, setQty] = useState(1);

  const toggle = (group: ModGroup, option: string) => {
    if (picked.includes(option)) return setPicked(picked.filter((m) => m !== option));
    // กลุ่มเลือกได้อย่างเดียว: กดอันใหม่แล้วอันเก่าในกลุ่มเดียวกันหลุดออก
    const rest = group.one ? picked.filter((m) => !group.options.includes(m)) : picked;
    setPicked([...rest, option]);
  };

  const save = () => {
    if (editing) actions.editPlate(item.id, editing.mods, picked);
    else actions.setQty(item.id, qty, picked);
    onClose();
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dishsheet" role="dialog" aria-label={item.name} onClick={(e) => e.stopPropagation()}>
        <div className="ds-photo">
          <FoodArt emoji={item.emoji} img={item.img} tint={stall.tint} size="100%" radius={0} alt={item.name} />
          <button className="ds-close" onClick={onClose} aria-label="ปิด">×</button>
        </div>

        <div className="ds-body">
          <div className="ds-head">
            <h2>{item.name}</h2>
            <span className="ds-price num">{baht(item.price)}</span>
          </div>

          {item.mods.map((g) => (
            <div key={g.title} className="ds-group">
              <div className="ds-gtitle">
                <span aria-hidden="true">{GROUP_EMOJI[g.title] ?? '✨'}</span> {g.title}
                <small>{g.one ? 'เลือก 1 อย่าง · ไม่บังคับ' : 'เลือกได้หลายอย่าง'}</small>
              </div>
              <div className="ds-options">
                {g.options.map((o) => (
                  <button
                    key={o}
                    className={['ds-opt', g.one && 'one', spiceTone(o)].filter(Boolean).join(' ')}
                    aria-pressed={picked.includes(o)}
                    onClick={() => toggle(g, o)}
                  >
                    {spiceIcon(o) && <span aria-hidden="true">{spiceIcon(o)} </span>}
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="ds-foot">
          {!editing && <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty === 1} aria-label="ลดจำนวน">
              <Icon name="minus" size={18} weight={2.6} />
            </button>
            <div className="qty num">{qty}</div>
            <button onClick={() => setQty(Math.min(9, qty + 1))} aria-label="เพิ่มจำนวน">
              <Icon name="plus" size={18} weight={2.6} />
            </button>
          </div>}
          <button className="cartbar ds-add" onClick={save}>
            <span className="grow">{editing ? 'บันทึกจานนี้' : 'ใส่ตะกร้า'}</span>
            {!editing && <span className="num">{baht(item.price * qty)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

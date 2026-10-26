import { useState } from 'react';
import { STALLS, getStall, stallLabel } from '../lib/data';
import { batchingCount, myActive, queueOf, waitMins } from '../lib/queue';
import { actions, useStore } from '../lib/store';
import { baht, padQueueNo } from '../lib/thai';
import type { MenuItem, Order, Stall } from '../lib/types';
import { FoodArt } from '../components/FoodArt';
import { Icon } from '../components/Icon';
import { KuLogo, Nontri } from '../components/Brand';

function busy(n: number): { label: string; tone: 'calm' | 'mid' | 'busy' } {
  if (n <= 6) return { label: 'คิวน้อย', tone: 'calm' };
  if (n <= 10) return { label: 'ปานกลาง', tone: 'mid' };
  return { label: 'คิวเยอะ', tone: 'busy' };
}

const ALL = 'ทั้งหมด';

/** คิวที่ยังไม่จบปักไว้บนสุดของหน้าแรก เปิดแอปมาแล้วเห็นเลยว่าต้องไปร้านไหน */
function ActiveStrip({ orders }: { orders: Order[] }) {
  const active = myActive(orders);
  const first = active[0];
  if (!first) return null;
  const stall = getStall(first.stallId);
  const ready = first.status === 'ready';

  return (
    <button className={ready ? 'activestrip ready' : 'activestrip'} onClick={() => actions.openTicket(first.id)}>
      <span className="as-no num">{padQueueNo(first.no)}</span>
      <span className="grow">
        <b>{ready ? 'รับอาหารได้แล้ว!' : 'คิวของคุณกำลังรอ'}</b>
        <small>
          {stallLabel(stall)} · {stall.name}
          {active.length > 1 && ` · อีก ${active.length - 1} คิว`}
        </small>
      </span>
      <Icon name="next" size={22} weight={2.4} />
    </button>
  );
}

/** สามขั้นสั้น ๆ สำหรับคนที่ยังไม่มีคิว ใช้ครั้งแรกจะได้ไม่ต้องเดาว่าแอปทำงานยังไง */
function HowTo() {
  return (
    <div className="howto">
      <div className="ht-title">สั่งง่าย ๆ 3 ขั้นตอน</div>
      <ol>
        <li><span className="ht-ico"><Icon name="store" size={22} weight={2.1} /></span>เลือกร้าน<br />และเมนู</li>
        <li><span className="ht-ico"><Icon name="qr" size={22} weight={2.1} /></span>จ่ายเงิน<br />รับเลขคิว</li>
        <li><span className="ht-ico"><Icon name="bell" size={22} weight={2.1} /></span>รอแจ้งเตือน<br />แล้วไปรับ</li>
      </ol>
    </div>
  );
}

interface DishHit {
  stall: Stall;
  item: MenuItem;
  same: number;
}

/** การ์ดเมนูแนวนอน แตะแล้วเข้าร้านนั้นเลย */
function DishCard({ hit }: { hit: DishHit }) {
  const { stall, item, same } = hit;
  return (
    <button className="dishcard" onClick={() => actions.openStall(stall.id)}>
      <FoodArt emoji={item.emoji} img={item.img} tint={stall.tint} size="100%" radius={14} className="dc-img" alt={item.name} />
      <span className="dc-stall num">ร้าน {stall.no}</span>
      <div className="dc-name">{item.name}</div>
      <div className="dc-meta">
        <span className="num">{baht(item.price)}</span>
        {same >= 2 && <span className="fast"><Icon name="bolt" size={13} weight={2.4} />ได้เร็ว</span>}
      </div>
    </button>
  );
}

function StallRow({ stall, orders }: { stall: Stall; orders: Order[] }) {
  const n = queueOf(orders, stall.id).length;
  const b = busy(n);
  return (
    <button className="stallrow" onClick={() => actions.openStall(stall.id)}>
      <span className="sr-cover">
        <FoodArt emoji={stall.emoji} img={stall.img} tint={stall.tint} size={84} radius={18} alt={stall.name} />
        <span className="sr-no" aria-label={'ร้าน ' + stall.no}>
          <small>ร้าน</small><b className="num">{stall.no}</b>
        </span>
      </span>
      <span className="sr-body">
        <span className="sr-name">{stall.name}</span>
        <span className="sr-kind">
          {stall.kind} · {stall.menu.slice(0, 2).map((m) => m.name).join(', ')}
        </span>
        <span className="sr-meta">
          <span className="sc-wait">
            <Icon name="clock" size={15} weight={2.4} />
            ~<span className="num">{waitMins(stall, n)}</span> นาที
          </span>
          <span className={'busy tone-' + b.tone}>{b.label} · <span className="num">{n}</span> คิว</span>
        </span>
      </span>
    </button>
  );
}

export function StallList({ orders }: { orders: Order[] }) {
  const { session } = useStore();
  const name = session?.kind === 'customer' ? session.name : '';
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState(ALL);

  const q = query.trim();
  const kinds = [ALL, ...new Set(STALLS.map((s) => s.kind))];
  const stalls = STALLS.filter((s) => kind === ALL || s.kind === kind);

  const allDishes: DishHit[] = STALLS.flatMap((stall) =>
    stall.menu.map((item) => ({ stall, item, same: batchingCount(orders, stall.id, item.id) })),
  );
  // ตอนค้นหา โชว์เมนูที่ตรงจากทุกร้าน คนส่วนใหญ่รู้ว่าอยากกินอะไร แต่ไม่รู้ว่าร้านไหนมี
  const hits = q ? allDishes.filter((d) => d.item.name.includes(q) || d.stall.name.includes(q)) : [];
  const fast = allDishes.filter((d) => d.same >= 2).sort((a, b) => b.same - a.same).slice(0, 8);

  return (
    <>
      <div className="topbar">
        <Nontri size={30} className="tb-flower f1" />
        <Nontri size={18} className="tb-flower f2" />
        <div className="tb-row">
          <KuLogo height={48} />
          <div className="grow">
            <div className="tb-hello">สวัสดี {name} 👋</div>
            <div className="tb-loc"><Icon name="pin" size={15} weight={2.4} />โรงอาหาร มก. ศรีราชา</div>
          </div>
          <button className="tb-avatar" onClick={() => actions.customerTab('account')} aria-label="บัญชีของฉัน">
            <Icon name="user" size={22} weight={2.2} />
          </button>
        </div>
        <label className="searchbox">
          <Icon name="search" size={20} weight={2.2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="อยากกินอะไร? เช่น กะเพรา, ก๋วยเตี๋ยว"
            aria-label="ค้นหาเมนูหรือร้าน"
          />
          {q && <button className="sb-clear" onClick={() => setQuery('')} aria-label="ล้างคำค้น">×</button>}
        </label>
      </div>

      <div className="scroll home">
        <ActiveStrip orders={orders} />
        {myActive(orders).length === 0 && !q && <HowTo />}

        {q ? (
          <>
            <h2 className="sec">ผลการค้นหา “{q}”</h2>
            {hits.length ? (
              <div className="dishgrid">
                {hits.map((h) => <DishCard key={h.stall.id + h.item.id} hit={h} />)}
              </div>
            ) : (
              <div className="empty">ไม่พบเมนูที่ค้นหา ลองคำอื่นดูนะ</div>
            )}
          </>
        ) : (
          <>
            <div className="kinds" role="tablist" aria-label="ประเภทอาหาร">
              {kinds.map((k) => {
                const stall = STALLS.find((s) => s.kind === k);
                return (
                  <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
                    <span className="k-emoji" aria-hidden="true">{stall ? stall.emoji : '🍽️'}</span>
                    {k}
                  </button>
                );
              })}
            </div>

            {kind === ALL && fast.length > 0 && (
              <>
                <h2 className="sec">
                  <span>ได้เร็วตอนนี้ <Icon name="bolt" size={18} weight={2.4} className="sec-ico" /></span>
                  <small>เมนูที่ร้านกำลังทำพร้อมกันหลายจาน</small>
                </h2>
                <div className="hscroll">
                  {fast.map((h) => <DishCard key={h.stall.id + h.item.id} hit={h} />)}
                </div>
              </>
            )}

            <h2 className="sec">
              <span>{kind === ALL ? 'ร้านทั้งหมด' : kind}</span>
              <small>เรียงตามเลขร้านในโรงอาหาร</small>
            </h2>
            {stalls.map((stall) => <StallRow key={stall.id} stall={stall} orders={orders} />)}
          </>
        )}
      </div>
    </>
  );
}

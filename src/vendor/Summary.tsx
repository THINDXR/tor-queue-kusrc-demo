import { HOURS, HOUR_LABELS, SEED_SALES, getStall } from '../lib/data';
import { orderTotal, queueOf, waitMins } from '../lib/queue';
import { actions } from '../lib/store';
import { baht } from '../lib/thai';
import type { Order } from '../lib/types';

export function Summary({ orders, stallId }: { orders: Order[]; stallId: string }) {
  const mine = orders.filter((o) => o.stallId === stallId);
  const done = mine.filter((o) => o.status === 'done');

  const seed = SEED_SALES[stallId] ?? 0;
  const count = seed + done.length;
  const revenue = seed * 91 + done.reduce((s, o) => s + orderTotal(o), 0);

  const tally = new Map<string, number>();
  for (const o of mine) {
    if (o.status === 'cancelled') continue;
    for (const l of o.lines) tally.set(l.name, (tally.get(l.name) ?? 0) + l.qty);
  }
  const best = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...HOURS);
  const queueLen = queueOf(orders, stallId).length;

  return (
    <div className="scroll">
      <div className="stat spaced">
        <div className="card"><div className="k">ยอดขาย</div><div className="v">{baht(revenue)}</div></div>
        <div className="card"><div className="k">ออเดอร์</div><div className="v">{count}</div></div>
      </div>

      <div className="card">
        <div className="k">เวลารอเฉลี่ย</div>
        <div className="v">{waitMins(getStall(stallId), Math.round(queueLen / 2))} นาที</div>
      </div>

      <div className="card">
        <div className="k">ออเดอร์ต่อชั่วโมง</div>
        <div className="hours">
          {HOURS.map((h, i) => <div key={i} className="h" style={{ height: `${(h / max) * 100}%` }} />)}
        </div>
        <div className="hours-x">{HOUR_LABELS.map((h) => <span key={h}>{h}</span>)}</div>
      </div>

      <div className="card">
        <div className="k mb">ขายดี</div>
        {best.map(([name, qty], i) => (
          <div key={name} className="item">
            <div className="grow"><span className="num rank">{i + 1}</span>{name}</div>
            <div className="num">{qty}</div>
          </div>
        ))}
      </div>

      <button
        className="btn ghost"
        onClick={() => { if (confirm('ล้างคิวทั้งหมดและเริ่มใหม่?')) actions.reset(); }}
      >
        รีเซ็ตข้อมูลเดโม
      </button>
    </div>
  );
}

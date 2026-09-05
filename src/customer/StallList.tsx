import { STALLS, getStall } from '../lib/data';
import { queueOf, waitMins } from '../lib/queue';
import { actions } from '../lib/store';
import type { Order } from '../lib/types';

function busyColor(n: number): string {
  return n <= 6 ? '#10B981' : n <= 10 ? '#F59E0B' : '#EF4444';
}

export function StallList({ orders }: { orders: Order[] }) {
  return (
    <>
      <div className="head">
        <div className="eyebrow">ต่อคิว · KU Sriracha</div>
        <h1>เลือกร้านอาหาร</h1>
      </div>
      <div className="scroll">
        {STALLS.map((stall) => {
          const n = queueOf(orders, stall.id).length;
          return (
            <div
              key={stall.id}
              className="card tappable"
              onClick={() => actions.openStall(stall.id)}
            >
              <div className="row">
                <div className="stall-name">{stall.name}</div>
                <div className="wait">
                  <div className="mins">
                    รอ <span className="num">~{waitMins(getStall(stall.id), n)}</span> นาที
                  </div>
                  <div className="qn">
                    <span className="num">{n}</span> คิว
                  </div>
                </div>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.min(100, (n / 15) * 100)}%`, background: busyColor(n) }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

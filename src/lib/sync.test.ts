import { describe, expect, it } from 'vitest';
import { changedSince, markMine } from './sync';
import type { Order } from './types';

const order = (id: string): Order => ({
  id, no: 1, stallId: 'panoi', lines: [], pay: 'qr', status: 'queued',
  placedAt: 0, sort: 1, skipped: false, prepared: false, mine: false,
});

describe('เชื่อมหลายเครื่อง', () => {
  it('ส่งขึ้นเฉพาะออเดอร์ที่เปลี่ยนจริง', () => {
    const a = order('a');
    const b = order('b');
    const last = new Map([[a.id, a], [b.id, b]]);
    const b2 = { ...b, status: 'ready' as const };
    const c = order('c');
    expect(changedSince(last, [a, b2, c]).map((o) => o.id)).toEqual(['b', 'c']);
  });

  it('ออเดอร์จากที่เก็บกลางติดป้าย mine เฉพาะของเครื่องนี้ ไม่เชื่อค่าที่ติดมา', () => {
    const fromServer = [{ ...order('a'), mine: true }, order('b')];
    expect(markMine(fromServer, new Set(['b'])).map((o) => o.mine)).toEqual([false, true]);
  });
});

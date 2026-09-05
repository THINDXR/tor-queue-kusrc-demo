import { beforeEach, describe, expect, it } from 'vitest';
import { boot, getState, resetForTest } from './store';
import { cookQueue, groupsOf, queueOf, specialsOf, unpaidOf } from './queue';

beforeEach(() => {
  resetForTest();
  boot();
});

describe('คิวตั้งต้น', () => {
  it('ร้านป้าน้อยมี 9 คิวรอ และ 1 คิวรอเงินสด', () => {
    const { orders } = getState();
    expect(queueOf(orders, 'panoi')).toHaveLength(9);
    expect(unpaidOf(orders, 'panoi')).toHaveLength(1);
  });

  it('เลขคิวเริ่มที่ 34 ตามที่ตั้งไว้', () => {
    expect(queueOf(getState().orders, 'panoi')[0]?.no).toBe(34);
  });

  it('มีออเดอร์พิเศษ 2 รายการ', () => {
    expect(specialsOf(getState().orders, 'panoi')).toHaveLength(2);
  });
});

describe('การจับกลุ่มออเดอร์ (หัวใจของแอป)', () => {
  it('แบ่งเป็นกำลังทำ 5 คิว และรอทำ 4 คิว', () => {
    const { cooking, waiting } = cookQueue(getState().orders, 'panoi');
    expect(cooking).toHaveLength(5);
    expect(waiting).toHaveLength(4);
  });

  it('รวมจานที่เหมือนกันเป็นการ์ดเดียว', () => {
    const groups = groupsOf(cookQueue(getState().orders, 'panoi').cooking);
    expect(groups).toHaveLength(3);
    expect(groups[0]?.label).toBe('ผัดซีอิ๊ว');
    expect(groups[0]?.orders).toHaveLength(2);
  });

  it('ออเดอร์พิเศษแยกการ์ดเสมอ ไม่ถูกรวมกับจานชื่อเดียวกัน', () => {
    const groups = groupsOf(cookQueue(getState().orders, 'panoi').cooking);
    const special = groups[1];
    const normal = groups[2];

    expect(special?.special).toBe(true);
    expect(special?.orders).toHaveLength(1);
    expect(special?.mods).toEqual(['ไม่ใส่ผัก', 'ข้าวเพิ่ม']);

    // ทั้งสองการ์ดเป็น "ข้าวหมูกรอบ" เหมือนกัน แต่ต้องไม่ถูกจับรวมกัน
    expect(special?.label).toBe('ข้าวหมูกรอบ');
    expect(normal?.label).toBe('ข้าวหมูกรอบ');
    expect(normal?.special).toBe(false);
    expect(normal?.orders).toHaveLength(2);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { actions, boot, cartLines, cartTotal, getState, orderById, resetForTest, tick } from './store';
import { CASH_TIMEOUT, cookQueue, groupsOf, myActive, queueOf, unpaidOf } from './queue';

beforeEach(() => {
  resetForTest();
  boot();
});

function panoiGroups() {
  return groupsOf(cookQueue(getState().orders, 'panoi').cooking);
}

describe('แม่ค้าทำอาหารเสร็จ', () => {
  it('หยิบคิวที่เก่าที่สุดในกลุ่มขึ้นมาส่งมอบ', () => {
    const group = panoiGroups()[0]!;
    const firstNo = group.orders[0]!.no;

    actions.finishOne(group.key);

    const sheet = orderById(getState().sheetId);
    expect(sheet?.no).toBe(firstNo);
    expect(sheet?.status).toBe('ready');
    expect(queueOf(getState().orders, 'panoi')).toHaveLength(8);
  });

  it('กดส่งมอบแล้วออเดอร์จบและแผ่นปิด', () => {
    actions.finishOne(panoiGroups()[0]!.key);
    const id = getState().sheetId!;
    actions.handOver(id);

    expect(orderById(id)?.status).toBe('done');
    expect(getState().sheetId).toBeNull();
  });
});

describe('ลูกค้าไม่มารับ', () => {
  it('ครั้งแรกย้ายไปท้ายแถว', () => {
    actions.finishOne(panoiGroups()[0]!.key);
    const id = getState().sheetId!;
    actions.skip(id);

    const order = orderById(id)!;
    const queue = queueOf(getState().orders, 'panoi');
    expect(order.status).toBe('queued');
    expect(order.skipped).toBe(true);
    expect(queue.at(-1)?.no).toBe(order.no);
    expect(queue).toHaveLength(9);
  });

  it('ครั้งที่สองยกเลิกคิวไปเลย', () => {
    actions.finishOne(panoiGroups()[0]!.key);
    const id = getState().sheetId!;
    actions.skip(id);

    // ถูกเรียกอีกครั้งแล้วยังไม่มารับอีก
    actions.finishOne(groupsOf([orderById(id)!])[0]!.key);
    actions.skip(id);

    expect(orderById(id)?.status).toBe('cancelled');
  });
});

describe('การจ่ายเงิน', () => {
  it('สแกนจ่ายเข้าคิวทันที', () => {
    actions.openStall('saeb');
    actions.setQty('tamthai', 1);
    actions.setPay('qr');
    actions.place();

    expect(myActive(getState().orders)[0]?.status).toBe('queued');
  });

  it('เงินสดยังไม่เข้าคิวจนกว่าแม่ค้าจะกดรับเงิน', () => {
    actions.openStall('muay');
    actions.setQty('kmg', 1);
    actions.setQty('kmg', 1);
    actions.setPay('cash');
    actions.place();

    const order = myActive(getState().orders)[0]!;
    expect(order.status).toBe('unpaid');
    expect(queueOf(getState().orders, 'muay').some((o) => o.id === order.id)).toBe(false);

    actions.confirmCash(order.id);
    expect(orderById(order.id)?.status).toBe('queued');
    expect(queueOf(getState().orders, 'muay').at(-1)?.id).toBe(order.id);
  });

  it('เงินสดที่ไม่มาจ่ายใน 5 นาที ถูกยกเลิกอัตโนมัติ', () => {
    const stale = unpaidOf(getState().orders, 'panoi')[0]!;
    tick(stale.placedAt + CASH_TIMEOUT + 1000);
    expect(orderById(stale.id)?.status).toBe('cancelled');
  });
});

describe('ตะกร้าของลูกค้า', () => {
  it('รวมราคาถูกต้องและล้างตะกร้าหลังสั่ง', () => {
    actions.openStall('muay');
    actions.setQty('kmg', 1);
    actions.setQty('kmg', 1);

    expect(cartLines()[0]?.qty).toBe(2);
    expect(cartTotal()).toBe(90);

    actions.toggleMod('ไม่เผ็ด');
    actions.place();

    expect(cartLines()).toHaveLength(0);
    expect(myActive(getState().orders)[0]?.mods).toEqual(['ไม่เผ็ด']);
  });

  it('เปลี่ยนร้านแล้วล้างตะกร้าเดิม', () => {
    actions.openStall('muay');
    actions.setQty('kmg', 1);
    actions.openStall('saeb');
    expect(cartLines()).toHaveLength(0);
  });
});

describe('แจ้งเตือนจังหวะเตรียมตัว', () => {
  it('เตือนเฉพาะคิวที่เหลืออีกไม่เกิน 2 คิว', () => {
    tick();
    const queue = queueOf(getState().orders, 'panoi');
    expect(queue.slice(0, 3).every((o) => o.prepared)).toBe(true);
    expect(queue.at(-1)?.prepared).toBe(false);
  });
});

describe('ไทยช่วยไทย', () => {
  it('ยังไม่เข้าคิวจนกว่าแม่ค้าจะยืนยัน เหมือนเงินสด', () => {
    actions.openStall('saeb');
    actions.setQty('tamthai', 1);
    actions.setPay('thai');
    actions.place();

    const order = myActive(getState().orders)[0]!;
    expect(order.pay).toBe('thai');
    expect(order.status).toBe('unpaid');
    expect(queueOf(getState().orders, 'saeb').some((o) => o.id === order.id)).toBe(false);

    actions.confirmCash(order.id);
    expect(orderById(order.id)?.status).toBe('queued');
  });

  it('ค้างเกิน 5 นาทีก็ถูกยกเลิกอัตโนมัติเหมือนกัน', () => {
    actions.openStall('saeb');
    actions.setQty('tamthai', 1);
    actions.setPay('thai');
    actions.place();

    const order = myActive(getState().orders)[0]!;
    tick(order.placedAt + CASH_TIMEOUT + 1000);
    expect(orderById(order.id)?.status).toBe('cancelled');
  });

  it('สแกนจ่ายยังเข้าคิวทันทีเหมือนเดิม', () => {
    actions.openStall('saeb');
    actions.setQty('tamthai', 1);
    actions.setPay('qr');
    actions.place();
    expect(myActive(getState().orders)[0]?.status).toBe('queued');
  });
});

describe('สั่งซ้ำจากประวัติ', () => {
  function placeAndFinish() {
    actions.openStall('muay');
    actions.setQty('kmg', 2);
    actions.toggleMod('ไม่เผ็ด');
    actions.setPay('thai');
    actions.place();
    const order = myActive(getState().orders)[0]!;
    actions.collect(order.id);
    return order;
  }

  it('ยกรายการเดิมใส่ตะกร้าแล้วพาไปหน้ายืนยัน', () => {
    const past = placeAndFinish();
    actions.reorder(past.id);

    const s = getState();
    expect(s.cust.view).toBe('checkout');
    expect(s.cust.stallId).toBe('muay');
    expect(cartLines()).toEqual([{ dishId: 'kmg', name: 'ข้าวมันไก่', price: 45, qty: 2 }]);
    expect(cartTotal()).toBe(90);
  });

  it('จำตัวเลือกพิเศษและวิธีจ่ายเงินเดิมไว้ด้วย', () => {
    const past = placeAndFinish();
    actions.reorder(past.id);

    expect(getState().cust.mods).toEqual(['ไม่เผ็ด']);
    expect(getState().cust.pay).toBe('thai');
  });

  it('สั่งซ้ำแล้วได้เลขคิวใหม่ ไม่ใช่ของเดิม', () => {
    const past = placeAndFinish();
    actions.reorder(past.id);
    actions.place();

    const fresh = myActive(getState().orders)[0]!;
    expect(fresh.id).not.toBe(past.id);
    expect(fresh.no).toBeGreaterThan(past.no);
    expect(fresh.mods).toEqual(['ไม่เผ็ด']);
    expect(orderById(past.id)?.status).toBe('done');
  });

  it('เมนูที่ร้านเอาออกไปแล้วถูกตัดทิ้ง ไม่ทำให้ทั้งออเดอร์พัง', () => {
    const past = placeAndFinish();
    // จำลองว่าเมนูนี้ถูกถอดออกจากร้านไปแล้ว
    const broken = getState().orders.map((o) =>
      o.id === past.id ? { ...o, lines: [{ dishId: 'เมนูที่ถูกลบ', name: 'เมนูเก่า', price: 40, qty: 1 }] } : o,
    );
    getState().orders.splice(0, getState().orders.length, ...broken);

    actions.reorder(past.id);
    expect(getState().cust.view).not.toBe('checkout');
    expect(getState().toast).toContain('ไม่มีขายแล้ว');
  });
});

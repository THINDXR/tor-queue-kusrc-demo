import { beforeEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { actions, boot, getState, orderById, resetForTest } from './lib/store';
import { cookQueue, groupsOf, myActive, queueOf } from './lib/queue';
import { identityOf } from './lib/identity';
import type { NotifyPermission } from './lib/notify';

/** เรนเดอร์แอปทั้งตัวเป็น HTML เพื่อดูว่าหน้าจอไหนพังบ้าง */
function html(): string {
  return renderToString(<App />);
}

/** เบราว์เซอร์จริงเป็นคนตั้งค่านี้ ในเทสต์จึงเซ็ตตรง ๆ เพื่อดูหน้าจอแต่ละแบบ */
function setNotifyPermission(permission: NotifyPermission): void {
  const s = getState() as { notifyPermission: NotifyPermission };
  s.notifyPermission = permission;
}

beforeEach(() => {
  resetForTest();
  boot();
});

describe('เข้าสู่ระบบ', () => {
  it('ยังไม่เข้าสู่ระบบจะเห็นหน้าเข้าสู่ระบบก่อน', () => {
    const out = html();
    expect(out).toContain('บัญชีนนทรี');
    expect(out).toContain('ร้านค้า');
    expect(out).toContain('เข้าใช้แบบบุคคลทั่วไป');
    expect(out).not.toContain('ร้านทั้งหมด');
  });

  it('ต้องกรอกบัญชีและรหัสผ่านครบถึงจะเข้าได้', () => {
    expect(actions.loginCustomer('', 'x')).not.toBeNull();
    expect(actions.loginCustomer('6530200123', '')).not.toBeNull();
    expect(getState().session).toBeNull();

    expect(actions.loginCustomer('6530200123', 'demo')).toBeNull();
    expect(getState().session?.kind).toBe('customer');
    expect(html()).toContain('ร้านทั้งหมด');
  });

  it('ร้านค้าเข้าด้วย PIN แล้วเห็นแต่ร้านตัวเอง', () => {
    expect(actions.loginVendor('muay', '0000')).toBe('PIN ไม่ถูกต้อง');
    expect(actions.loginVendor('muay', '1234')).toBeNull();
    expect(getState().vend.stallId).toBe('muay');

    const out = html();
    expect(out).toContain('ข้าวมันไก่เจ๊หมวย');
    expect(out).toContain('ร้าน 3');
    expect(out).not.toContain('stallpicker');
  });

  it('ออกจากระบบแล้วกลับไปหน้าเข้าสู่ระบบ', () => {
    actions.loginGuest();
    actions.customerTab('account');
    expect(html()).toContain('ออกจากระบบ');
    actions.logout();
    expect(getState().session).toBeNull();
    expect(html()).toContain('เข้าใช้แบบบุคคลทั่วไป');
  });
});

describe('ฝั่งลูกค้า', () => {
  beforeEach(() => {
    actions.loginCustomer('6530200123', 'demo');
  });

  it('หน้าเลือกร้านแสดงเลขร้าน ชื่อร้าน และจำนวนคิว', () => {
    const out = html();
    expect(out).toContain('ร้านทั้งหมด');
    expect(out).toContain('อยากกินอะไร');
    expect(out).toContain('ได้เร็วตอนนี้');   // ร้าน 1 มีผัดซีอิ๊วรอทำหลายจาน
    expect(out).toContain('🍛');
    expect(out).toContain('ข้าวแกงป้าน้อย');
    expect(out).toContain('อาหารตามสั่งพี่เบิร์ด');
    expect(out).toContain('aria-label="ร้าน 1"');
    expect(out).toContain('aria-label="ร้าน 6"');
  });

  it('บัตรคิวบอกเลขร้านที่ต้องเดินไปรับ', () => {
    actions.openStall('chan');
    actions.setQty('ntok', 1);
    actions.place();
    expect(html()).toContain('ร้าน 4');
  });

  it('หน้าเมนูแสดงราคาและปุ่มตะกร้า', () => {
    actions.openStall('panoi');
    expect(html()).not.toContain('cartbar');   // ตะกร้าว่าง ยังไม่โชว์แถบ

    actions.setQty('kaprao', 1);
    const out = html();
    expect(out).toContain('กะเพราหมูไข่ดาว');
    expect(out).toContain('ตะกร้า 1 รายการ');
    expect(out).toContain('฿50');
  });

  it('ป้าย "กำลังทำอยู่ N จาน" ขึ้นเมื่อมีจานเดียวกันในคิวหลายจาน', () => {
    actions.openStall('panoi');
    expect(html()).toContain('กำลังทำอยู่');
  });

  it('หน้ายืนยันโชว์ตัวเลือกของแต่ละจานและวิธีจ่ายเงินครบ', () => {
    actions.openStall('panoi');
    actions.setQty('kaprao', 1);
    actions.toCheckout();

    const out = html();
    expect(out).toContain('ยืนยันและรับคิว');
    expect(out).toContain('สแกนจ่าย');
    expect(out).toContain('เงินสด');
    expect(out).toContain('ไทยช่วยไทย');
    expect(out).not.toContain('ปรับแต่งพิเศษอาจใช้เวลานานขึ้น');

    actions.setQty('kaprao', 1, ['ไม่เผ็ด']);   // จานที่สอง คนละความเผ็ด เป็นคนละบรรทัด
    const withMods = html();
    expect(withMods).toContain('ไม่เผ็ด');
    expect(withMods).toContain('ปรับแต่งพิเศษอาจใช้เวลานานขึ้น');
  });

  it('บัตรคิวแสดงเลข สีประจำคิว และตัวเลือกพิเศษ', () => {
    actions.openStall('panoi');
    actions.setQty('kaprao', 1);
    actions.setQty('kaprao', -1);
    actions.setQty('kaprao', 1, ['ไม่เผ็ด']);
    actions.place();

    const order = myActive(getState().orders)[0]!;
    const out = html();
    expect(out).toContain(String(order.no).padStart(3, '0'));
    expect(out).toContain(identityOf(order.no).color);
    expect(out).toContain('ไม่เผ็ด');
    expect(out).toContain('ยกเลิกออเดอร์');
  });

  it('หน้ารับอาหารมีแค่สิ่งที่ต้องยกให้แม่ค้าดู', () => {
    // สั่งแบบมีตัวเลือกพิเศษ จะได้เป็นกลุ่มเดี่ยวของตัวเอง แม่ค้ากดเสร็จแล้วตกที่ออเดอร์นี้แน่นอน
    actions.openStall('saeb');
    actions.setQty('tamthai', 1, ['ไม่เผ็ด']);
    actions.place();
    const order = myActive(getState().orders)[0]!;

    actions.setRole('vendor');
    actions.vendorStall('saeb');
    const mineGroup = groupsOf(queueOf(getState().orders, 'saeb'))
      .find((g) => g.orders[0]?.id === order.id)!;
    actions.finishOne(mineGroup.key);
    expect(orderById(order.id)?.status).toBe('ready');

    actions.setRole('customer');
    actions.openTicket(order.id);

    const out = html();
    expect(out).toContain('แสดงหน้าจอนี้ให้แม่ค้าดู');
    expect(out).toContain('รับอาหารแล้ว');
    expect(out).toContain('ticket ready');
    expect(out).toContain(identityOf(order.no).color);
    expect(out).toContain('ไม่เผ็ด');
  });

  it('บัตรคิวชวนเปิดแจ้งเตือน และหายไปเมื่ออนุญาตแล้ว', () => {
    actions.openStall('panoi');
    actions.setQty('kaprao', 1);
    actions.place();

    const asking = html();
    expect(asking).toContain('เปิดแจ้งเตือนไว้');
    expect(asking).toContain('ไปนั่งรอที่โต๊ะหรือเล่นแอปอื่นได้');

    setNotifyPermission('granted');
    expect(html()).not.toContain('เปิดแจ้งเตือนไว้');
  });

  it('บอกทางแก้เมื่อผู้ใช้เคยกดปฏิเสธการแจ้งเตือนไว้', () => {
    actions.openStall('panoi');
    actions.setQty('kaprao', 1);
    actions.place();

    setNotifyPermission('denied');
    const out = html();
    expect(out).toContain('ตั้งค่าเบราว์เซอร์');
    expect(out).toContain('เปิดหน้านี้ค้างไว้');
  });

  it('บัตรเงินสดแสดงว่ายังไม่เข้าคิว', () => {
    actions.openStall('panoi');
    actions.setQty('kaprao', 1);
    actions.setPay('cash');
    actions.place();

    const out = html();
    expect(out).toContain('ยังไม่เข้าคิว');
    expect(out).toContain('แจ้งแม่ค้าว่าจ่ายเงินสด');
    expect(out).toContain('ticket dead');
  });

  it('ประวัติมีปุ่มสั่งอีกครั้ง และกดแล้วไปหน้ายืนยันพร้อมของเดิม', () => {
    actions.openStall('muay');
    actions.setQty('kmg', 2, ['ไม่เอาหนัง']);
    actions.place();
    const order = myActive(getState().orders)[0]!;
    actions.collect(order.id);

    actions.customerTab('history');
    const history = html();
    expect(history).toContain('สั่งอีกครั้ง');
    expect(history).toContain('฿90');

    actions.reorder(order.id);
    const checkout = html();
    expect(checkout).toContain('ยืนยันและรับคิว');
    expect(checkout).toContain('ข้าวมันไก่');
    expect(checkout).toContain('฿90');
  });

  it('บัตรไทยช่วยไทยบอกให้แจ้งแม่ค้าใช้สิทธิ์', () => {
    actions.openStall('saeb');
    actions.setQty('tamthai', 1);
    actions.setPay('thai');
    actions.place();

    const out = html();
    expect(out).toContain('ยังไม่เข้าคิว');
    expect(out).toContain('แจ้งแม่ค้าว่าใช้สิทธิ์ไทยช่วยไทย');
  });

  it('แท็บคิวของฉัน ประวัติ และบัญชีเปิดได้', () => {
    actions.customerTab('account');
    expect(html()).toContain('บัญชีนนทรี · 6530200123');
    actions.customerTab('mine');
    expect(html()).toContain('คิวของฉัน');
    actions.customerTab('history');
    expect(html()).toContain('ยังไม่มีประวัติการสั่ง');
  });
});

describe('ฝั่งร้าน', () => {
  beforeEach(() => {
    actions.loginVendor('panoi', '1234');
  });

  it('คิวทำอาหารจับกลุ่มจานเหมือนกันและแยกออเดอร์พิเศษ', () => {
    const out = html();
    expect(out).toContain('คิวรอ');
    expect(out).toContain('กำลังทำ');
    expect(out).toContain('รอทำ');
    expect(out).toContain('เสร็จ 1 จาน');
    expect(out).toContain('ผัดซีอิ๊ว');
    expect(out).toContain('card group special');   // การ์ดออเดอร์พิเศษต้องมีอยู่
    expect(out).toContain('ไม่ใส่ผัก');
  });

  it('แท็บรอเงินสดมีปุ่มรับเงิน', () => {
    actions.vendorTab('cash');
    expect(html()).toContain('รับเงินแล้ว — เข้าคิว');
  });

  it('ไม่มีแท็บพิเศษแล้ว ออเดอร์พิเศษอยู่ในคิวหลักและอ่านออกทันที', () => {
    const out = html();
    expect(out).not.toContain('>พิเศษ<');            // แท็บหายไปแล้ว
    expect(out).toContain('พิเศษ — ทำแยก ห้ามสลับจาน'); // แต่ป้ายบนการ์ดยังอยู่
    expect(out).toContain('card group special');
    expect(out).toContain('ไม่ใส่ผัก');
  });

  it('มีแถบเตือนคิวรอรับเงินอยู่บนหน้าคิวทำอาหาร', () => {
    const out = html();
    expect(out).toContain('payalert');
    expect(out).toContain('คิวรอรับเงิน');
    expect(out).toContain('กดเพื่อไปยืนยัน');
  });

  it('ไม่มีคิวรอชำระก็ไม่ขึ้นแถบเตือน', () => {
    actions.vendorStall('muay');   // ร้านนี้ไม่มีคิวเงินสดค้าง
    expect(html()).not.toContain('payalert');
  });

  it('แท็บสรุปแสดงยอดขายและของขายดี', () => {
    actions.vendorTab('summary');
    const out = html();
    expect(out).toContain('ยอดขาย');
    expect(out).toContain('ขายดี');
    expect(out).toContain('เวลารอเฉลี่ย');
  });

  it('แผ่นส่งมอบแสดงสี รูปทรง และเลขคิวชุดเดียวกับบัตรลูกค้า', () => {
    const group = groupsOf(cookQueue(getState().orders, 'panoi').cooking)[0]!;
    const first = group.orders[0]!;
    actions.finishOne(group.key);

    const out = html();
    expect(out).toContain('ส่งมอบแล้ว');
    expect(out).toContain('ยังไม่มารับ — ข้ามไปก่อน');
    expect(out).toContain('ประกาศ: คิว');
    expect(out).toContain('สามสิบสี่');
    expect(out).toContain('โชว์หน้าจอสีเดียวกัน');
    expect(out).toContain(identityOf(first.no).color);
  });

  it('ทุกร้านและทุกแท็บเรนเดอร์ได้ไม่พัง', () => {
    for (const stallId of ['panoi', 'yaay', 'muay', 'chan', 'bird', 'saeb']) {
      actions.vendorStall(stallId);
      for (const tab of ['cook', 'cash', 'summary'] as const) {
        actions.vendorTab(tab);
        expect(html().length).toBeGreaterThan(100);
      }
    }
  });
});

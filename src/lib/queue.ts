import type { Group, Order, Stall } from './types';
import { getStall } from './data';

/** ออเดอร์ที่อยู่ 5 คิวแรกถือว่า "กำลังทำ" ที่เหลือคือ "รอทำ"
 *  ไม่ต้องให้แม่ค้ากดเริ่มทำ เพราะทุกการกดคือภาระตอนมือไม่ว่าง */
export const COOK_WINDOW = 5;

/** คิวเงินสดที่ไม่มาจ่ายภายใน 5 นาที ยกเลิกอัตโนมัติ กันคนสั่งทิ้ง */
export const CASH_TIMEOUT = 5 * 60 * 1000;

/** เหลืออีกกี่คิวถึงจะเตือนให้เดินมารอที่ร้าน */
export const PREPARE_AT = 2;

export function isSpecial(order: Order): boolean {
  return order.mods.length > 0;
}

export function orderTitle(order: Order): string {
  return order.lines.map((l) => (l.qty > 1 ? l.name + ' ×' + l.qty : l.name)).join(' + ');
}

export function orderTotal(order: Order): number {
  return order.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

/** คิวที่รอทำของร้านหนึ่ง เรียงตามลำดับจริง คิวที่ถูกข้ามจะไปต่อท้าย */
export function queueOf(orders: Order[], stallId: string): Order[] {
  return orders
    .filter((o) => o.stallId === stallId && o.status === 'queued')
    .sort((a, b) => a.sort - b.sort);
}

export function aheadOf(orders: Order[], order: Order): number {
  const i = queueOf(orders, order.stallId).findIndex((o) => o.id === order.id);
  return i < 0 ? 0 : i;
}

export function waitMins(stall: Stall, ahead: number): number {
  return Math.max(1, Math.round(stall.mins * ahead) + 1);
}

export function waitMinsFor(orders: Order[], stallId: string): number {
  return waitMins(getStall(stallId), queueOf(orders, stallId).length);
}

/**
 * จับกลุ่มออเดอร์ที่เหมือนกันเป๊ะให้แม่ค้าทำรวดเดียว
 *
 * นี่คือหัวใจของแอป: จานที่เหมือนกันทุกอย่างแทนกันได้ จึงไม่จำเป็นต้องรู้ว่า
 * จานไหนเป็นของใคร รู้แค่ว่าถึงตาใครรับก็พอ
 *
 * แต่ออเดอร์ที่มีตัวเลือกพิเศษแทนกันไม่ได้จริง ๆ จึงได้ key เฉพาะตัว
 * ทำให้แยกเป็นการ์ดของตัวเองเสมอ ไม่มีทางถูกรวมกับจานชื่อเดียวกัน
 */
export function groupsOf(orders: Order[]): Group[] {
  const out: Group[] = [];
  const index = new Map<string, Group>();

  for (const o of orders) {
    const key = isSpecial(o)
      ? 'x:' + o.id
      : 's:' + o.lines.map((l) => l.dishId + '*' + l.qty).sort().join('|');

    let group = index.get(key);
    if (!group) {
      group = { key, label: orderTitle(o), special: isSpecial(o), mods: o.mods, orders: [] };
      index.set(key, group);
      out.push(group);
    }
    group.orders.push(o);
  }
  return out;
}

export function cookQueue(orders: Order[], stallId: string): { cooking: Order[]; waiting: Order[] } {
  const q = queueOf(orders, stallId);
  return { cooking: q.slice(0, COOK_WINDOW), waiting: q.slice(COOK_WINDOW) };
}

export function unpaidOf(orders: Order[], stallId: string): Order[] {
  return orders.filter((o) => o.stallId === stallId && o.status === 'unpaid');
}

export function specialsOf(orders: Order[], stallId: string): Order[] {
  return queueOf(orders, stallId).filter(isSpecial);
}

export function myOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.mine).sort((a, b) => b.placedAt - a.placedAt);
}

export function myActive(orders: Order[]): Order[] {
  return myOrders(orders).filter(
    (o) => o.status === 'unpaid' || o.status === 'queued' || o.status === 'ready',
  );
}

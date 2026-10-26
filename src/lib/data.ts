import type { MenuItem, ModGroup, PaymentMethod, Stall } from './types';

export interface PaymentInfo {
  label: string;
  hint: string;
  /** true = เข้าคิวทำอาหารได้ทันที, false = ต้องให้แม่ค้ากดยืนยันก่อน */
  instant: boolean;
  /** ข้อความบนบัตรคิวตอนที่ยังรอชำระ */
  waitingNote: string;
  /** ปุ่มยืนยันบนหน้าจอแม่ค้า */
  confirmLabel: string;
}

/**
 * วิธีชำระเงิน
 *
 * สแกนจ่ายเข้าคิวได้ทันทีเพราะเงินเข้าระบบเราตรง ๆ
 * ส่วนเงินสดกับไทยช่วยไทยจ่ายกันนอกแอปนี้ (คนละแอป/คนละมือ) เราตรวจเองไม่ได้
 * จึงต้องรอแม่ค้ากดยืนยันก่อน กันคนสั่งทิ้งแล้วแม่ค้าทำเสร็จโดยไม่มีคนมารับ
 */
export const PAYMENTS: Record<PaymentMethod, PaymentInfo> = {
  qr: {
    label: 'สแกนจ่าย',
    hint: 'เข้าคิวทันที',
    instant: true,
    waitingNote: '',
    confirmLabel: '',
  },
  cash: {
    label: 'เงินสด',
    // 5 นาทีตรงกับ CASH_TIMEOUT ใน queue.ts — แก้ที่หนึ่งต้องแก้อีกที่ด้วย
    hint: 'ชำระเงินสดที่ร้านภายใน 5 นาที',
    instant: false,
    waitingNote: 'แจ้งแม่ค้าว่าจ่ายเงินสด',
    confirmLabel: 'รับเงินแล้ว — เข้าคิว',
  },
  thai: {
    label: 'ไทยช่วยไทย',
    hint: 'ใช้สิทธิ์ที่ร้าน แม่ค้ายืนยันแล้วจึงเข้าคิว',
    instant: false,
    waitingNote: 'แจ้งแม่ค้าว่าใช้สิทธิ์ไทยช่วยไทย',
    confirmLabel: 'ยืนยันการชำระ — เข้าคิว',
  },
};

/**
 * ตัวเลือกพิเศษแยกตามชนิดอาหาร — ออเดอร์ที่ติดตัวเลือกคือออเดอร์ที่ "แทนกันไม่ได้"
 * แยกตามจานเพราะตัวเลือกเดียวกันใช้ไม่ได้กับทุกจาน (ต้มยำไม่มีไข่ดาว ข้าวมันไก่ไม่มีเผ็ด)
 */
const spice = (...options: string[]): ModGroup => ({ title: 'ระดับความเผ็ด', one: true, options });
const extra = (...options: string[]): ModGroup => ({ title: 'เพิ่มเติม', one: false, options });

const STIRFRY = [spice('ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดมาก'), extra('ไม่ใส่ผัก', 'ข้าวเพิ่ม', 'ไข่ดาว')];
const RICE_TOPPED = [extra('ไม่ใส่ผัก', 'ข้าวเพิ่ม', 'ราดแยก', 'ไข่ต้ม')];
const CURRY_RICE = [spice('เผ็ดน้อย', 'เผ็ดมาก'), extra('ข้าวเพิ่ม', 'ราดแยก')];
const SOUP = [spice('ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดมาก'), extra('ไม่ใส่ผักชี')];
const OMELETTE = [extra('ข้าวเพิ่ม', 'ทอดกรอบ', 'ไม่ใส่หอม')];
const CHICKEN_RICE = [extra('ไม่เอาหนัง', 'น้ำจิ้มแยก', 'ข้าวเพิ่ม')];
const NOODLE = [
  { title: 'เส้น', one: true, options: ['เส้นเล็ก', 'เส้นใหญ่', 'เส้นหมี่'] },
  spice('ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดมาก'),
  extra('ไม่ใส่ผัก'),
];
const FRIED_RICE = [extra('ไข่ดาว', 'ไม่ใส่ผัก', 'ซอสแยก')];
const SOMTAM = [spice('ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดมาก'), extra('ไม่ใส่ถั่ว')];
const GRILL = [extra('ข้าวเหนียวเพิ่ม', 'น้ำจิ้มแยก')];

/** ตัวเลือกทั้งหมดของเมนู ใช้ตรวจว่าตัวเลือกที่ส่งมายังมีอยู่จริง */
export function modOptions(item: MenuItem): string[] {
  return item.mods.flatMap((g) => g.options);
}

export const STALLS: Stall[] = [
  { id: 'panoi', no: 1, name: 'ข้าวแกงป้าน้อย', kind: 'ข้าวแกง', emoji: '🍛', tint: '#F2A541', img: '/food/kaprao.jpg', mins: 1.4, start: 34, menu: [
    { id: 'kaprao',  name: 'กะเพราหมูไข่ดาว', price: 50, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🍳', img: '/food/kaprao.jpg' },
    { id: 'seeew',   name: 'ผัดซีอิ๊ว',        price: 45, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🍝', img: '/food/seeew.jpg' },
    { id: 'krob',    name: 'ข้าวหมูกรอบ',      price: 55, cat: 'ข้าวราด', mods: RICE_TOPPED, emoji: '🥓', img: '/food/krob.jpg' },
    { id: 'kanajub', name: 'คะน้าหมูกรอบ',     price: 55, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🥬', img: '/food/kanajub.jpg' },
    { id: 'gaeng',   name: 'แกงเขียวหวานไก่',  price: 50, cat: 'ข้าวราด', mods: CURRY_RICE, emoji: '🍛', img: '/food/gaeng.jpg' },
  ]},
  { id: 'yaay', no: 2, name: 'ครัวคุณยาย', kind: 'อาหารไทย', emoji: '🍲', tint: '#E8704F', img: '/food/tomyum.jpg', mins: 1.5, start: 12, menu: [
    { id: 'tomyum',  name: 'ต้มยำกุ้งน้ำข้น', price: 60, cat: 'แกง', mods: SOUP, emoji: '🦐', img: '/food/tomyum.jpg' },
    { id: 'pladuk',  name: 'ฉู่ฉี่ปลาดุก',     price: 55, cat: 'แกง', mods: SOUP, emoji: '🐟', img: '/food/pladuk.jpg' },
    { id: 'kaijeaw', name: 'ไข่เจียวหมูสับ',   price: 40, cat: 'ตามสั่ง', mods: OMELETTE, emoji: '🍳', img: '/food/kaijeaw.jpg' },
  ]},
  { id: 'muay', no: 3, name: 'ข้าวมันไก่เจ๊หมวย', kind: 'ข้าวมันไก่', emoji: '🍗', tint: '#E3B23C', img: '/food/kmg.jpg', mins: 1.6, start: 51, menu: [
    { id: 'kmg',    name: 'ข้าวมันไก่',    price: 45, cat: 'จานเดียว', mods: CHICKEN_RICE, emoji: '🍚', img: '/food/kmg.jpg' },
    { id: 'kmgtod', name: 'ข้าวมันไก่ทอด', price: 50, cat: 'จานเดียว', mods: CHICKEN_RICE, emoji: '🍗', img: '/food/kmgtod.jpg' },
    { id: 'kmgmix', name: 'ข้าวมันไก่รวม', price: 55, cat: 'จานเดียว', mods: CHICKEN_RICE, emoji: '🍱', img: '/food/kmgmix.jpg' },
  ]},
  { id: 'chan', no: 4, name: 'ก๋วยเตี๋ยวลุงชาญ', kind: 'ก๋วยเตี๋ยว', emoji: '🍜', tint: '#D65A4A', img: '/food/ntok.jpg', mins: 1.1, start: 78, menu: [
    { id: 'ntok',    name: 'ก๋วยเตี๋ยวน้ำตก', price: 45, cat: 'ก๋วยเตี๋ยว', mods: NOODLE, emoji: '🍜', img: '/food/ntok.jpg' },
    { id: 'tomyumn', name: 'ก๋วยเตี๋ยวต้มยำ', price: 50, cat: 'ก๋วยเตี๋ยว', mods: NOODLE, emoji: '🌶️', img: '/food/tomyumn.jpg' },
    { id: 'yen',     name: 'เย็นตาโฟ',        price: 50, cat: 'ก๋วยเตี๋ยว', mods: NOODLE, emoji: '🍥', img: '/food/yen.jpg' },
  ]},
  { id: 'bird', no: 5, name: 'อาหารตามสั่งพี่เบิร์ด', kind: 'ตามสั่ง', emoji: '🍳', tint: '#4F9A5B', img: '/food/promt.jpg', mins: 1.35, start: 96, menu: [
    { id: 'kapraog', name: 'กะเพราไก่ไข่ดาว', price: 50, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🌿', img: '/food/kapraog.jpg' },
    { id: 'khimao',  name: 'ผัดขี้เมาหมู',    price: 55, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🍝', img: '/food/khimao.jpg' },
    { id: 'promt',   name: 'ข้าวผัดอเมริกัน', price: 60, cat: 'จานเดียว', mods: FRIED_RICE, emoji: '🍤', img: '/food/promt.jpg' },
    { id: 'prik',    name: 'ผัดพริกแกงหมู',   price: 50, cat: 'ตามสั่ง', mods: STIRFRY, emoji: '🌶️', img: '/food/prik.jpg' },
  ]},
  { id: 'saeb', no: 6, name: 'ส้มตำแซ่บนัว', kind: 'ส้มตำ', emoji: '🥗', tint: '#7DB249', img: '/food/tamthai.jpg', mins: 1.7, start: 23, menu: [
    { id: 'tamthai', name: 'ส้มตำไทย',       price: 40, cat: 'ตำ', mods: SOMTAM, emoji: '🥗', img: '/food/tamthai.jpg' },
    { id: 'tampu',   name: 'ตำปูปลาร้า',     price: 45, cat: 'ตำ', mods: SOMTAM, emoji: '🦀', img: '/food/tampu.jpg' },
    { id: 'gaiyang', name: 'ไก่ย่างครึ่งตัว', price: 70, cat: 'ย่าง', mods: GRILL, emoji: '🍗', img: '/food/gaiyang.jpg' },
  ]},
];

export interface SeedOrder {
  stall: string;
  dish: string;
  mods: string[];
  cash?: boolean;
}

/**
 * คิวตั้งต้น เขียนไว้ให้เห็นการจับกลุ่มทันทีที่เปิดแอป
 * ป้าน้อยจงใจให้ตรงกับดีไซน์: ผัดซีอิ๊ว ×2 → ออเดอร์พิเศษเดี่ยว → ข้าวหมูกรอบ ×2
 */
export const SEED: SeedOrder[] = [
  { stall: 'panoi', dish: 'seeew',  mods: [] },
  { stall: 'panoi', dish: 'seeew',  mods: [] },
  { stall: 'panoi', dish: 'krob',   mods: ['ไม่ใส่ผัก', 'ข้าวเพิ่ม'] },
  { stall: 'panoi', dish: 'krob',   mods: [] },
  { stall: 'panoi', dish: 'krob',   mods: [] },
  { stall: 'panoi', dish: 'kaprao', mods: [] },
  { stall: 'panoi', dish: 'kaprao', mods: [] },
  { stall: 'panoi', dish: 'kaprao', mods: ['ไม่เผ็ด'] },
  { stall: 'panoi', dish: 'gaeng',  mods: [] },
  { stall: 'panoi', dish: 'seeew',  mods: [], cash: true },

  { stall: 'yaay', dish: 'kaijeaw', mods: [] },
  { stall: 'yaay', dish: 'kaijeaw', mods: [] },
  { stall: 'yaay', dish: 'tomyum',  mods: [] },
  { stall: 'yaay', dish: 'pladuk',  mods: ['ไม่เผ็ด'] },
  { stall: 'yaay', dish: 'kaijeaw', mods: [] },

  { stall: 'muay', dish: 'kmg',    mods: [] },
  { stall: 'muay', dish: 'kmg',    mods: [] },
  { stall: 'muay', dish: 'kmgtod', mods: [] },

  { stall: 'chan', dish: 'tomyumn', mods: [] },
  { stall: 'chan', dish: 'tomyumn', mods: [] },
  { stall: 'chan', dish: 'yen',     mods: [] },
  { stall: 'chan', dish: 'ntok',    mods: ['เผ็ดน้อย'] },
  { stall: 'chan', dish: 'ntok',    mods: [] },
  { stall: 'chan', dish: 'tomyumn', mods: [] },

  { stall: 'bird', dish: 'kapraog', mods: [] },
  { stall: 'bird', dish: 'kapraog', mods: [] },
  { stall: 'bird', dish: 'kapraog', mods: [] },
  { stall: 'bird', dish: 'khimao',  mods: [] },
  { stall: 'bird', dish: 'khimao',  mods: ['ไม่เผ็ด'] },
  { stall: 'bird', dish: 'promt',   mods: [] },
  { stall: 'bird', dish: 'prik',    mods: [] },
  { stall: 'bird', dish: 'prik',    mods: [] },
  { stall: 'bird', dish: 'kapraog', mods: ['ข้าวเพิ่ม'] },
  { stall: 'bird', dish: 'promt',   mods: [] },
  { stall: 'bird', dish: 'khimao',  mods: [] },

  { stall: 'saeb', dish: 'tamthai', mods: [] },
  { stall: 'saeb', dish: 'tamthai', mods: ['เผ็ดน้อย'] },
  { stall: 'saeb', dish: 'gaiyang', mods: [] },
  { stall: 'saeb', dish: 'tampu',   mods: [] },
];

/** ออเดอร์ต่อชั่วโมงของหน้าสรุป 10:00-16:00 */
export const HOURS = [4, 9, 14, 11, 5, 3, 1];
export const HOUR_LABELS = ['10', '11', '12', '13', '14', '15', '16'];

/** ยอดสะสมตั้งต้นสำหรับเดโม ยอดที่เกิดในแอปจริงจะบวกทับตัวเลขนี้ */
export const SEED_SALES: Record<string, number> = {
  panoi: 47, yaay: 31, muay: 39, chan: 44, bird: 52, saeb: 26,
};

export function getStall(id: string): Stall {
  const found = STALLS.find((s) => s.id === id);
  if (!found) throw new Error('ไม่พบร้าน: ' + id);
  return found;
}

/** ชื่อเรียกร้านแบบที่คนในโรงอาหารใช้กันจริง: "ร้าน 1" */
export function stallLabel(stall: Stall): string {
  return 'ร้าน ' + stall.no;
}

/** PIN สาธิตของทุกร้าน ของจริงร้านจะตั้งเองตอนลงทะเบียนกับโรงอาหาร */
export const DEMO_PIN = '1234';

export function getDish(stallId: string, dishId: string): MenuItem {
  const found = getStall(stallId).menu.find((m) => m.id === dishId);
  if (!found) throw new Error('ไม่พบเมนู: ' + stallId + '/' + dishId);
  return found;
}

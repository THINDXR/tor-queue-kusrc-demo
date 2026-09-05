import type { MenuItem, PaymentMethod, Stall } from './types';

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
    hint: 'จ่ายที่ร้านก่อนเข้าคิว',
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

/** ตัวเลือกพิเศษ — ออเดอร์ที่ติดตัวเลือกเหล่านี้คือออเดอร์ที่ "แทนกันไม่ได้" */
export const MODS = ['ไม่เผ็ด', 'เผ็ดน้อย', 'ไม่ใส่ผัก', 'ข้าวเพิ่ม', 'ไข่ดาว'] as const;

export const STALLS: Stall[] = [
  { id: 'panoi', name: 'ร้านป้าน้อย ข้าวแกง', mins: 1.4, start: 34, menu: [
    { id: 'kaprao',  name: 'กะเพราหมูไข่ดาว', price: 50, cat: 'ตามสั่ง' },
    { id: 'seeew',   name: 'ผัดซีอิ๊ว',        price: 45, cat: 'ตามสั่ง' },
    { id: 'krob',    name: 'ข้าวหมูกรอบ',      price: 55, cat: 'ข้าวราด' },
    { id: 'kanajub', name: 'คะน้าหมูกรอบ',     price: 55, cat: 'ตามสั่ง' },
    { id: 'gaeng',   name: 'แกงเขียวหวานไก่',  price: 50, cat: 'ข้าวราด' },
  ]},
  { id: 'yaay', name: 'ครัวคุณยาย', mins: 1.5, start: 12, menu: [
    { id: 'tomyum',  name: 'ต้มยำกุ้งน้ำข้น', price: 60, cat: 'แกง' },
    { id: 'pladuk',  name: 'ฉู่ฉี่ปลาดุก',     price: 55, cat: 'แกง' },
    { id: 'kaijeaw', name: 'ไข่เจียวหมูสับ',   price: 40, cat: 'ตามสั่ง' },
  ]},
  { id: 'muay', name: 'ข้าวมันไก่เจ๊หมวย', mins: 1.6, start: 51, menu: [
    { id: 'kmg',    name: 'ข้าวมันไก่',    price: 45, cat: 'จานเดียว' },
    { id: 'kmgtod', name: 'ข้าวมันไก่ทอด', price: 50, cat: 'จานเดียว' },
    { id: 'kmgmix', name: 'ข้าวมันไก่รวม', price: 55, cat: 'จานเดียว' },
  ]},
  { id: 'chan', name: 'ก๋วยเตี๋ยวลุงชาญ', mins: 1.1, start: 78, menu: [
    { id: 'ntok',    name: 'ก๋วยเตี๋ยวน้ำตก', price: 45, cat: 'ก๋วยเตี๋ยว' },
    { id: 'tomyumn', name: 'ก๋วยเตี๋ยวต้มยำ', price: 50, cat: 'ก๋วยเตี๋ยว' },
    { id: 'yen',     name: 'เย็นตาโฟ',        price: 50, cat: 'ก๋วยเตี๋ยว' },
  ]},
  { id: 'bird', name: 'อาหารตามสั่งพี่เบิร์ด', mins: 1.35, start: 96, menu: [
    { id: 'kapraog', name: 'กะเพราไก่ไข่ดาว', price: 50, cat: 'ตามสั่ง' },
    { id: 'khimao',  name: 'ผัดขี้เมาหมู',    price: 55, cat: 'ตามสั่ง' },
    { id: 'promt',   name: 'ข้าวผัดอเมริกัน', price: 60, cat: 'จานเดียว' },
    { id: 'prik',    name: 'ผัดพริกแกงหมู',   price: 50, cat: 'ตามสั่ง' },
  ]},
  { id: 'saeb', name: 'ส้มตำแซ่บนัว', mins: 1.7, start: 23, menu: [
    { id: 'tamthai', name: 'ส้มตำไทย',       price: 40, cat: 'ตำ' },
    { id: 'tampu',   name: 'ตำปูปลาร้า',     price: 45, cat: 'ตำ' },
    { id: 'gaiyang', name: 'ไก่ย่างครึ่งตัว', price: 70, cat: 'ย่าง' },
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

export function getDish(stallId: string, dishId: string): MenuItem {
  const found = getStall(stallId).menu.find((m) => m.id === dishId);
  if (!found) throw new Error('ไม่พบเมนู: ' + stallId + '/' + dishId);
  return found;
}

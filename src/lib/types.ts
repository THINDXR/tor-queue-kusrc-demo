export type Role = 'customer' | 'vendor';
export type PaymentMethod = 'qr' | 'cash' | 'thai';

/**
 * วงจรชีวิตของออเดอร์
 * unpaid  — เลือกจ่ายเงินสด ยังไม่เข้าคิวทำอาหารจนกว่าแม่ค้าจะกดรับเงิน
 * queued  — อยู่ในคิว (5 คิวแรกถือว่ากำลังทำ ดูที่ COOK_WINDOW)
 * ready   — ทำเสร็จ รอลูกค้ามารับ
 * done    — ส่งมอบแล้ว
 */
export type OrderStatus = 'unpaid' | 'queued' | 'ready' | 'done' | 'cancelled';

export interface OrderLine {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  /** ตัวเลือกของจานนี้ เช่น ไม่เผ็ด — จานที่มีตัวเลือกแทนกันไม่ได้ จึงไม่ถูกจับกลุ่มกับจานอื่น */
  mods: string[];
}

export interface Order {
  id: string;
  no: number;
  stallId: string;
  lines: OrderLine[];
  pay: PaymentMethod;
  status: OrderStatus;
  placedAt: number;
  /** ลำดับในคิว คิวที่ถูกข้ามจะได้ค่าใหม่เพื่อไปต่อท้ายแถว */
  sort: number;
  /** เคยถูกข้ามมาแล้วหรือยัง ข้ามได้ครั้งเดียว */
  skipped: boolean;
  /** ส่งแจ้งเตือน "เดินมารอ" ไปแล้วหรือยัง */
  prepared: boolean;
  /** ออเดอร์ของผู้ใช้เครื่องนี้ */
  mine: boolean;
  readyAt?: number;
  paidAt?: number;
}

/** ออเดอร์ที่เหมือนกันถูกรวมเป็นการ์ดเดียวบนหน้าจอแม่ค้า */
export interface Group {
  key: string;
  label: string;
  special: boolean;
  mods: string[];
  orders: Order[];
}

/** กลุ่มตัวเลือกแบบ Grab: one = เลือกได้อย่างเดียว (ความเผ็ด, เส้น) ไม่เลือกก็ได้ */
export interface ModGroup {
  title: string;
  one: boolean;
  options: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cat: string;
  /** กลุ่มตัวเลือกที่สั่งกับเมนูนี้ได้ เช่น ก๋วยเตี๋ยวเลือกเส้น ต้มยำไม่มีไข่ดาว */
  mods: ModGroup[];
  /** ภาพประกอบสำรองเวลายังไม่มีรูปถ่ายจริง */
  emoji: string;
  /** รูปถ่ายจริงของเมนู เช่น /food/kaprao.jpg วางไฟล์ไว้ใน public/food แล้วใส่ path ที่นี่ */
  img?: string;
}

export interface Stall {
  id: string;
  /** เลขร้านที่ติดอยู่หน้าร้านจริงในโรงอาหาร คนเรียกร้านด้วยเลขนี้ ไม่ใช่ชื่อ */
  no: number;
  name: string;
  /** ประเภทร้าน ใช้เป็นหมวดกรองในหน้าแรก */
  kind: string;
  emoji: string;
  /** สีประจำร้าน ใช้ทำพื้นหลังภาพปก */
  tint: string;
  /** รูปปกร้าน เช่น /food/stall-1.jpg */
  img?: string;
  /** นาทีต่อหนึ่งคิว ใช้ประมาณเวลารอ */
  mins: number;
  /** เลขคิวเริ่มต้นของวัน */
  start: number;
  menu: MenuItem[];
}

export type CustomerTab = 'home' | 'mine' | 'history' | 'account';
export type CustomerView = 'stalls' | 'menu' | 'checkout' | 'ticket' | 'list';
export type VendorTab = 'cook' | 'cash' | 'summary';

/**
 * ใครกำลังใช้เครื่องนี้อยู่
 * นิสิต/บุคลากรเข้าด้วยบัญชีนนทรี บุคคลทั่วไปเข้าแบบไม่ต้องมีบัญชี
 * ร้านค้าเข้าด้วยเลขร้าน + PIN แล้วจะเห็นแต่คิวของร้านตัวเอง
 */
export type Session =
  | { kind: 'customer'; name: string; account: string; guest: boolean }
  | { kind: 'vendor'; stallId: string };

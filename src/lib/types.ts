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
}

export interface Order {
  id: string;
  no: number;
  stallId: string;
  lines: OrderLine[];
  /** ตัวเลือกพิเศษ เช่น ไม่เผ็ด — ออเดอร์ที่มีค่านี้จะไม่ถูกจับกลุ่มกับจานอื่น */
  mods: string[];
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

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cat: string;
}

export interface Stall {
  id: string;
  name: string;
  /** นาทีต่อหนึ่งคิว ใช้ประมาณเวลารอ */
  mins: number;
  /** เลขคิวเริ่มต้นของวัน */
  start: number;
  menu: MenuItem[];
}

export type CustomerTab = 'home' | 'mine' | 'history';
export type CustomerView = 'stalls' | 'menu' | 'checkout' | 'ticket' | 'list';
export type VendorTab = 'cook' | 'cash' | 'summary';

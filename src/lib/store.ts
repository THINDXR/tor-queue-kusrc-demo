import { useSyncExternalStore } from 'react';
import type {
  CustomerTab, CustomerView, Order, OrderLine, PaymentMethod, Role, VendorTab,
} from './types';
import { PAYMENTS, SEED, getDish, getStall } from './data';
import { CASH_TIMEOUT, PREPARE_AT, aheadOf, cookQueue, groupsOf, myActive, queueOf } from './queue';
import { padQueueNo, thaiWords } from './thai';
import { currentPermission, notify, requestPermission } from './notify';
import type { NotifyPermission } from './notify';

const STORAGE_KEY = 'torqueue.v2';

export interface AppState {
  role: Role;
  cust: {
    tab: CustomerTab;
    view: CustomerView;
    stallId: string | null;
    cart: Record<string, number>;
    mods: string[];
    pay: PaymentMethod;
    ticketId: string | null;
  };
  vend: { stallId: string; tab: VendorTab };
  counters: Record<string, number>;
  orders: Order[];
  sheetId: string | null;
  toast: string | null;
  seq: number;
  notifyPermission: NotifyPermission;
}

// ---------- ตัวเก็บสถานะ ----------

const listeners = new Set<() => void>();

function emptyState(): AppState {
  return {
    role: 'customer',
    cust: { tab: 'home', view: 'stalls', stallId: null, cart: {}, mods: [], pay: 'qr', ticketId: null },
    vend: { stallId: 'panoi', tab: 'cook' },
    counters: {},
    orders: [],
    sheetId: null,
    toast: null,
    seq: 0,
    notifyPermission: 'default',
  };
}

let state: AppState = emptyState();

/** ทุกการเปลี่ยนแปลงสร้าง object ใหม่ เพื่อให้ React รู้ว่าต้อง re-render */
function setState(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  save();
  listeners.forEach((l) => l());
}

function patchOrder(id: string, patch: Partial<Order>): void {
  setState({ orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
}

export function getState(): AppState {
  return state;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ---------- เก็บลงเครื่อง ----------

function save(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ seq: state.seq, counters: state.counters, orders: state.orders }),
    );
  } catch {
    // โหมดส่วนตัวหรือปิด storage — ปล่อยผ่าน แอปยังทำงานได้
  }
}

function load(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as Partial<AppState>;
    if (!data.orders?.length) return false;
    state = { ...state, seq: data.seq ?? 0, counters: data.counters ?? {}, orders: data.orders };
    return true;
  } catch {
    return false;
  }
}

// ---------- ตัวช่วย ----------

function nextSeq(): number {
  const n = state.seq + 1;
  state = { ...state, seq: n };
  return n;
}

function nextQueueNo(stallId: string): number {
  const current = state.counters[stallId] ?? getStall(stallId).start;
  state = { ...state, counters: { ...state.counters, [stallId]: current + 1 } };
  return current;
}

export function orderById(id: string | null): Order | null {
  if (!id) return null;
  return state.orders.find((o) => o.id === id) ?? null;
}

export function cartLines(s: AppState = state): OrderLine[] {
  const { stallId, cart } = s.cust;
  if (!stallId) return [];
  return Object.keys(cart)
    .filter((k) => (cart[k] ?? 0) > 0)
    .map((k) => {
      const d = getDish(stallId, k);
      return { dishId: k, name: d.name, price: d.price, qty: cart[k] ?? 0 };
    });
}

export function cartTotal(s: AppState = state): number {
  return cartLines(s).reduce((sum, l) => sum + l.price * l.qty, 0);
}

// ---------- เสียงและการแจ้งเตือน ----------

/** ประกาศเลขคิวออกลำโพงมือถือแม่ค้า แทนจอเรียกคิว โดยไม่ต้องซื้ออะไรเพิ่ม */
export function speakQueueNo(no: number): boolean {
  try {
    if (!('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance('คิว ' + thaiWords(no) + ' ค่ะ');
    u.lang = 'th-TH';
    u.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

function push(title: string, body: string, orderId: string, sticky = false): void {
  notify(title, body, { orderId, sticky });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function toast(msg: string): void {
  setState({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: null }), 3000);
}

// ---------- คำสั่งต่าง ๆ ----------

export const actions = {
  setRole(role: Role) {
    setState({ role });
  },

  customerTab(tab: CustomerTab) {
    setState({ cust: { ...state.cust, tab, view: tab === 'home' ? 'stalls' : 'list' } });
  },

  openStall(stallId: string) {
    const same = state.cust.stallId === stallId;
    setState({
      cust: {
        ...state.cust,
        stallId,
        view: 'menu',
        cart: same ? state.cust.cart : {},
        mods: same ? state.cust.mods : [],
      },
    });
  },

  back() {
    setState({ cust: { ...state.cust, view: state.cust.view === 'checkout' ? 'menu' : 'stalls' } });
  },

  setQty(dishId: string, delta: number) {
    const next = Math.max(0, Math.min(9, (state.cust.cart[dishId] ?? 0) + delta));
    setState({ cust: { ...state.cust, cart: { ...state.cust.cart, [dishId]: next } } });
  },

  toCheckout() {
    setState({ cust: { ...state.cust, view: 'checkout' } });
  },

  toggleMod(mod: string) {
    const mods = state.cust.mods.includes(mod)
      ? state.cust.mods.filter((m) => m !== mod)
      : [...state.cust.mods, mod];
    setState({ cust: { ...state.cust, mods } });
  },

  setPay(pay: PaymentMethod) {
    setState({ cust: { ...state.cust, pay } });
  },

  place() {
    const lines = cartLines();
    const stallId = state.cust.stallId;
    if (!lines.length || !stallId) return;

    const order: Order = {
      id: 'o' + nextSeq() + '_' + Math.random().toString(36).slice(2, 7),
      no: nextQueueNo(stallId),
      stallId,
      lines,
      mods: [...state.cust.mods],
      pay: state.cust.pay,
      // วิธีจ่ายที่จ่ายกันนอกแอปจะยังไม่เข้าคิวจนกว่าแม่ค้าจะกดยืนยัน
      status: PAYMENTS[state.cust.pay].instant ? 'queued' : 'unpaid',
      placedAt: Date.now(),
      sort: nextSeq(),
      skipped: false,
      prepared: false,
      mine: true,
    };

    setState({
      orders: [...state.orders, order],
      cust: { ...state.cust, cart: {}, mods: [], view: 'ticket', ticketId: order.id, tab: 'mine' },
    });
  },

  /**
   * สั่งซ้ำจากประวัติ — ยกรายการเดิมใส่ตะกร้าแล้วพาไปหน้ายืนยันเลย
   * เมนูที่ร้านเอาออกไปแล้วจะถูกตัดทิ้ง ไม่ใช่ทำให้พังทั้งออเดอร์
   */
  reorder(id: string) {
    const source = orderById(id);
    if (!source) return;

    const menu = getStall(source.stallId).menu;
    const cart: Record<string, number> = {};
    let dropped = 0;

    for (const line of source.lines) {
      if (menu.some((m) => m.id === line.dishId)) cart[line.dishId] = line.qty;
      else dropped++;
    }

    if (!Object.keys(cart).length) {
      toast('เมนูที่เคยสั่งไม่มีขายแล้ว');
      return;
    }

    setState({
      cust: {
        ...state.cust,
        tab: 'home',
        view: 'checkout',
        stallId: source.stallId,
        cart,
        mods: [...source.mods],
        pay: source.pay,
      },
    });

    if (dropped > 0) toast('มี ' + dropped + ' เมนูที่ไม่มีขายแล้ว ตัดออกให้แล้ว');
  },

  openTicket(id: string) {
    setState({ cust: { ...state.cust, ticketId: id, view: 'ticket', tab: 'mine' } });
  },

  cancel(id: string) {
    const o = orderById(id);
    if (!o) return;
    patchOrder(id, { status: 'cancelled' });
    setState({ cust: { ...state.cust, view: 'stalls', tab: 'home' } });
    toast('ยกเลิกคิว ' + padQueueNo(o.no) + ' แล้ว');
  },

  /** ลูกค้ากดยืนยันว่ารับอาหารแล้ว */
  collect(id: string) {
    patchOrder(id, { status: 'done' });
    setState({ cust: { ...state.cust, view: 'stalls', tab: 'home' } });
    toast('รับอาหารเรียบร้อย ขอบคุณครับ');
  },

  askNotify() {
    void requestPermission().then((permission) => {
      setState({ notifyPermission: permission });
      if (permission === 'granted') toast('เปิดแจ้งเตือนแล้ว ไปนั่งรอที่โต๊ะได้เลย');
      else if (permission === 'unsupported') toast('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
      else toast('ยังไม่ได้เปิดแจ้งเตือน');
    });
  },

  /** เรียกตอนแอปเริ่มทำงาน เพื่อดึงสถานะสิทธิ์จริงจากเบราว์เซอร์ */
  syncNotifyPermission() {
    setState({ notifyPermission: currentPermission() });
  },

  vendorTab(tab: VendorTab) {
    setState({ vend: { ...state.vend, tab } });
  },

  vendorStall(stallId: string) {
    setState({ vend: { ...state.vend, stallId } });
  },

  /** แม่ค้ากด "เสร็จ 1 จาน" — หยิบคิวที่เก่าที่สุดในกลุ่มนั้นขึ้นมาส่งมอบ */
  finishOne(groupKey: string) {
    const group = groupsOf(queueOf(state.orders, state.vend.stallId)).find((g) => g.key === groupKey);
    const order = group?.orders[0];
    if (!order) return;

    patchOrder(order.id, { status: 'ready', readyAt: Date.now() });
    setState({ sheetId: order.id });
    speakQueueNo(order.no);
    // ใบนี้ค้างไว้จนกว่าจะแตะ เพราะพลาดแล้วอาหารจะวางรอจนเย็น
    if (order.mine) {
      push('คิว ' + padQueueNo(order.no) + ' รับได้แล้ว', 'แสดงหน้าจอนี้ให้แม่ค้าดูได้เลย', order.id, true);
    }
  },

  handOver(id: string) {
    const o = orderById(id);
    if (!o) return;
    patchOrder(id, { status: 'done' });
    setState({ sheetId: null });
    toast('ส่งมอบคิว ' + padQueueNo(o.no) + ' แล้ว');
  },

  /** ลูกค้าไม่มารับ — ย้ายไปท้ายแถวได้ครั้งเดียว ครั้งที่สองต้องยกเลิก */
  skip(id: string) {
    const o = orderById(id);
    if (!o) return;

    if (o.skipped) {
      patchOrder(id, { status: 'cancelled' });
      toast('ยกเลิกคิว ' + padQueueNo(o.no) + ' (ไม่มารับซ้ำ)');
    } else {
      patchOrder(id, { status: 'queued', skipped: true, prepared: false, sort: nextSeq() });
      toast('ย้ายคิว ' + padQueueNo(o.no) + ' ไปท้ายแถว');
    }
    setState({ sheetId: null });
  },

  closeSheet() {
    setState({ sheetId: null });
  },

  speakAgain(no: number) {
    if (!speakQueueNo(no)) toast('เครื่องนี้ไม่รองรับเสียงพูด');
  },

  /** แม่ค้ากดรับเงินสดแล้ว ออเดอร์จึงเข้าคิวทำอาหาร */
  confirmCash(id: string) {
    const o = orderById(id);
    if (!o) return;
    patchOrder(id, { status: 'queued', sort: nextSeq(), paidAt: Date.now() });
    toast('คิว ' + padQueueNo(o.no) + ' เข้าคิวแล้ว');
  },

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ไม่เป็นไร รีโหลดแล้วจะได้ seed ใหม่อยู่ดี
    }
    location.reload();
  },
};

// ---------- นาฬิกา ----------

/** เดินทุกวินาที คอยยกเลิกคิวเงินสดที่ค้าง และยิงแจ้งเตือนจังหวะ "เตรียมตัว" */
export function tick(now: number = Date.now()): void {
  const updates: Order[] = [];

  for (const o of state.orders) {
    if (o.status === 'unpaid' && now - o.placedAt > CASH_TIMEOUT) {
      updates.push({ ...o, status: 'cancelled' });
      if (o.mine) toast('คิว ' + padQueueNo(o.no) + ' ถูกยกเลิก เพราะไม่ได้จ่ายเงินภายใน 5 นาที');
      continue;
    }
    // จังหวะแจ้งเตือนแรก: ให้เดินมารอก่อนอาหารเสร็จ
    // นี่คือสิ่งที่ทำให้ไม่ต้องมีป้ายหรือคลิปติดจาน เพราะอาหารไม่ต้องวางรอ
    if (o.status === 'queued' && !o.prepared && aheadOf(state.orders, o) <= PREPARE_AT) {
      updates.push({ ...o, prepared: true });
      if (o.mine) {
        push('อีก ' + PREPARE_AT + ' คิวถึงคุณแล้ว', 'เดินมารอที่ ' + getStall(o.stallId).name + ' ได้เลย', o.id);
      }
    }
  }

  if (!updates.length) return;
  const byId = new Map(updates.map((o) => [o.id, o]));
  setState({ orders: state.orders.map((o) => byId.get(o.id) ?? o) });
}

export function startClock(): () => void {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}

// ---------- เริ่มระบบ ----------

export function boot(): void {
  if (load()) return;

  const orders: Order[] = [];
  for (const s of SEED) {
    const d = getDish(s.stall, s.dish);
    orders.push({
      id: 'o' + nextSeq() + '_' + Math.random().toString(36).slice(2, 7),
      no: nextQueueNo(s.stall),
      stallId: s.stall,
      lines: [{ dishId: d.id, name: d.name, price: d.price, qty: 1 }],
      mods: s.mods,
      pay: s.cash ? 'cash' : 'qr',
      status: s.cash ? 'unpaid' : 'queued',
      placedAt: Date.now(),
      sort: nextSeq(),
      skipped: false,
      prepared: false,
      mine: false,
    });
  }
  setState({ orders });
}

/** ใช้ในเทสต์เท่านั้น — ล้างสถานะกลับไปเป็นค่าเริ่มต้น */
export function resetForTest(): void {
  state = emptyState();
}

export { myActive, cookQueue };

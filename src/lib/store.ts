import { useSyncExternalStore } from 'react';
import type {
  CustomerTab, CustomerView, Order, OrderLine, PaymentMethod, Role, Session, VendorTab,
} from './types';
import { DEMO_PIN, PAYMENTS, SEED, getDish, getStall, modOptions, stallLabel } from './data';
import { CASH_TIMEOUT, PREPARE_AT, aheadOf, cookQueue, groupsOf, myActive, queueOf } from './queue';
import { padQueueNo, thaiWords } from './thai';
import { currentPermission, notify, requestPermission } from './notify';
import type { NotifyPermission } from './notify';

// v3: ตัวเลือกย้ายจากระดับออเดอร์ไปอยู่ในแต่ละจาน ข้อมูล v2 เก่าจึงไม่อ่าน
const STORAGE_KEY = 'torqueue.v3';
const SESSION_KEY = 'torqueue.session';

export interface AppState {
  /** null = ยังไม่ได้เข้าสู่ระบบ จะเห็นแต่หน้าเข้าสู่ระบบ */
  session: Session | null;
  role: Role;
  cust: {
    tab: CustomerTab;
    view: CustomerView;
    stallId: string | null;
    /** จานเดียวกันที่ตัวเลือกต่างกันเป็นคนละบรรทัด เช่น กะเพราไม่เผ็ด 1 + กะเพราเผ็ดมาก 1 */
    cart: { dishId: string; qty: number; mods: string[] }[];
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
    session: null,
    role: 'customer',
    cust: { tab: 'home', view: 'stalls', stallId: null, cart: [], pay: 'qr', ticketId: null },
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

export function subscribe(listener: () => void): () => void {
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

/** เก็บแยกจากออเดอร์ รีเซ็ตข้อมูลเดโมแล้วจะได้ไม่ต้องเข้าสู่ระบบใหม่ */
function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ไม่เป็นไร แค่ต้องเข้าสู่ระบบใหม่รอบหน้า
  }
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function startSession(session: Session): void {
  saveSession(session);
  if (session.kind === 'vendor') {
    setState({ session, role: 'vendor', vend: { stallId: session.stallId, tab: 'cook' } });
  } else {
    setState({ session, role: 'customer', cust: { ...emptyState().cust } });
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
  return cart.map((c) => {
    const d = getDish(stallId, c.dishId);
    return { dishId: c.dishId, name: d.name, price: d.price, qty: c.qty, mods: c.mods };
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

/** แจ้งลูกค้าว่ารับอาหารได้ — ใบนี้ค้างไว้จนกว่าจะแตะ เพราะพลาดแล้วอาหารจะวางรอจนเย็น */
export function notifyReady(order: Order): void {
  push('คิว ' + padQueueNo(order.no) + ' รับได้แล้ว', 'ไปรับที่' + stallLabel(getStall(order.stallId)) + ' แล้วแสดงหน้าจอนี้ให้แม่ค้าดู', order.id, true);
}

/** ข้อมูลจากที่เก็บกลางทับของในเครื่อง — ออเดอร์ทุกร้าน และตัวนับเลขคิว */
export function applyServer(orders: Order[], counters: Record<string, number>): void {
  setState({ orders, counters: { ...state.counters, ...counters } });
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

  /**
   * เข้าสู่ระบบด้วยบัญชีนนทรี — เวอร์ชันนี้ยังไม่ได้ต่อระบบจริงของมหาวิทยาลัย
   * รับทุกบัญชีที่กรอกครบ ตอนติดตั้งจริงค่อยเปลี่ยนไปเรียก KU SSO ตรงนี้ที่เดียว
   */
  loginCustomer(account: string, password: string): string | null {
    const id = account.trim();
    if (!id) return 'กรอกบัญชีนนทรีหรือรหัสนิสิตก่อน';
    if (!password) return 'กรอกรหัสผ่านก่อน';
    const name = /^\d+$/.test(id) ? 'นิสิต ' + id.slice(-4) : id.split(/[.@]/)[0] ?? id;
    startSession({ kind: 'customer', name, account: id, guest: false });
    return null;
  },

  /** บุคคลทั่วไปที่ไม่มีบัญชีมหาวิทยาลัย เช่น ผู้ปกครองหรือแขกที่มาติดต่อ */
  loginGuest() {
    startSession({ kind: 'customer', name: 'บุคคลทั่วไป', account: '', guest: true });
  },

  loginVendor(stallId: string, pin: string): string | null {
    if (pin !== DEMO_PIN) return 'PIN ไม่ถูกต้อง';
    startSession({ kind: 'vendor', stallId });
    toast('เข้าสู่ระบบ ' + stallLabel(getStall(stallId)) + ' แล้ว');
    return null;
  },

  logout() {
    saveSession(null);
    setState({ session: null, role: 'customer', sheetId: null, cust: { ...emptyState().cust } });
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
        cart: same ? state.cust.cart : [],
      },
    });
  },

  back() {
    setState({ cust: { ...state.cust, view: state.cust.view === 'checkout' ? 'menu' : 'stalls' } });
  },

  /** เพิ่ม/ลดจำนวนของบรรทัดที่ตรงทั้งจานและตัวเลือก ไม่มีก็สร้างใหม่ เหลือ 0 ก็ลบทิ้ง */
  setQty(dishId: string, delta: number, mods: string[] = []) {
    const stallId = state.cust.stallId;
    if (!stallId) return;
    // เรียงตามลำดับในเมนูและทิ้งตัวเลือกที่ไม่มีจริง บรรทัดเดียวกันจึงเทียบกันได้เสมอ
    const clean = modOptions(getDish(stallId, dishId)).filter((m) => mods.includes(m));
    const same = (c: { dishId: string; mods: string[] }) => c.dishId === dishId && c.mods.join('|') === clean.join('|');
    const cart = state.cust.cart;
    const qty = Math.max(0, Math.min(9, (cart.find(same)?.qty ?? 0) + delta));
    const next = cart.some(same)
      ? cart.map((c) => (same(c) ? { ...c, qty } : c))
      : [...cart, { dishId, qty, mods: clean }];
    setState({ cust: { ...state.cust, cart: next.filter((c) => c.qty > 0) } });
  },

  /**
   * แก้ตัวเลือกของจานเดียว — แยกออกจากบรรทัดเดิม (ที่อาจมีหลายจาน) แล้ววางต่อท้ายบรรทัดนั้น
   * ถ้าตัวเลือกใหม่ไปตรงกับบรรทัดอื่นก็รวมเข้าบรรทัดนั้นแทน
   */
  editPlate(dishId: string, from: string[], mods: string[]) {
    const stallId = state.cust.stallId;
    if (!stallId) return;
    const clean = modOptions(getDish(stallId, dishId)).filter((m) => mods.includes(m));
    const is = (c: { dishId: string; mods: string[] }, m: string[]) => c.dishId === dishId && c.mods.join('|') === m.join('|');
    const cart = state.cust.cart;
    const at = cart.findIndex((c) => is(c, from));
    if (at < 0 || clean.join('|') === from.join('|')) return;
    const dup = cart.find((c) => is(c, clean));
    let next = cart.map((c, i) => (i === at ? { ...c, qty: c.qty - 1 } : c));
    next = dup
      ? next.map((c) => (c === dup ? { ...c, qty: Math.min(9, c.qty + 1) } : c))
      : [...next.slice(0, at + 1), { dishId, qty: 1, mods: clean }, ...next.slice(at + 1)];
    setState({ cust: { ...state.cust, cart: next.filter((c) => c.qty > 0) } });
  },

  toCheckout() {
    setState({ cust: { ...state.cust, view: 'checkout' } });
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
      cust: { ...state.cust, cart: [], view: 'ticket', ticketId: order.id, tab: 'mine' },
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
    const cart: AppState['cust']['cart'] = [];
    let dropped = 0;

    for (const line of source.lines) {
      const dish = menu.find((m) => m.id === line.dishId);
      // ตัวเลือกที่ร้านเลิกมีแล้วก็ตัดทิ้งเหมือนเมนู
      if (dish) cart.push({ dishId: dish.id, qty: line.qty, mods: modOptions(dish).filter((m) => line.mods.includes(m)) });
      else dropped++;
    }

    if (!cart.length) {
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
    if (order.mine) notifyReady(order);
  },

  /** เซิร์ฟเวอร์ออกเลขคิวจริงให้แล้ว — เปลี่ยนเลขที่จองไว้ชั่วคราวในเครื่องเป็นเลขจริง */
  renumber(id: string, no: number) {
    if (orderById(id)?.no !== no) patchOrder(id, { no });
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
        push('อีก ' + PREPARE_AT + ' คิวถึงคุณแล้ว', 'เดินมารอที่' + stallLabel(getStall(o.stallId)) + ' ได้เลย', o.id);
      }
    }
  }

  if (!updates.length) return;
  const byId = new Map(updates.map((o) => [o.id, o]));
  setState({ orders: state.orders.map((o) => byId.get(o.id) ?? o) });
}

/**
 * อีกแท็บเพิ่งบันทึกออเดอร์ (เช่น ลูกค้ากดสั่งในแท็บหนึ่ง ร้านเปิดอีกแท็บ) — รับมาแสดงทันที
 * ไม่บันทึกกลับ ไม่งั้นสองแท็บจะเขียนทับกันไปมาไม่รู้จบ
 */
export function applyRemote(raw: string | null): void {
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as Partial<AppState>;
    if (!Array.isArray(data.orders)) return;
    state = { ...state, seq: data.seq ?? state.seq, counters: data.counters ?? state.counters, orders: data.orders };
    listeners.forEach((l) => l());
  } catch {
    // ข้อมูลจากอีกแท็บอ่านไม่ได้ เก็บของเดิมไว้ดีกว่าเอามาทับ
  }
}

// shortcut: เชื่อมได้เฉพาะแท็บในเบราว์เซอร์เดียวกัน (localStorage) — ลูกค้ากับร้านคนละเครื่องต้องมีฐานข้อมูลกลาง
export function listenOtherTabs(): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) applyRemote(e.newValue);
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function startClock(): () => void {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}

// ---------- เริ่มระบบ ----------

export function boot(): void {
  const session = loadSession();
  if (session) {
    state = {
      ...state,
      session,
      role: session.kind,
      vend: session.kind === 'vendor' ? { ...state.vend, stallId: session.stallId } : state.vend,
    };
  }
  if (load()) return;

  const orders: Order[] = [];
  for (const s of SEED) {
    const d = getDish(s.stall, s.dish);
    orders.push({
      id: 'o' + nextSeq() + '_' + Math.random().toString(36).slice(2, 7),
      no: nextQueueNo(s.stall),
      stallId: s.stall,
      lines: [{ dishId: d.id, name: d.name, price: d.price, qty: 1, mods: s.mods }],
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

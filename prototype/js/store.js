window.Store = (function () {

  /* ออเดอร์ที่อยู่ 5 คิวแรกถือว่า "กำลังทำ" ที่เหลือคือ "รอทำ"
     ไม่ต้องให้แม่ค้ากดเริ่มทำ เพราะทุกการกดเพิ่มคือภาระตอนมือไม่ว่าง */
  var COOK_WINDOW = 5;

  /* คิวเงินสดที่ไม่มาจ่ายภายใน 5 นาที ยกเลิกอัตโนมัติ
     กันคนสั่งทิ้งแล้วแม่ค้าทำเสร็จโดยไม่มีคนมารับ */
  var CASH_TIMEOUT = 5 * 60 * 1000;

  var PREPARE_AT = 2;   // เหลืออีกกี่คิวถึงจะเตือนให้เดินมารอ
  var KEY = 'torqueue.v1';

  var seq = 0;
  var listeners = [];

  var state = {
    role: 'customer',
    cust: { tab: 'home', view: 'stalls', stallId: null, cart: {}, mods: [], pay: 'qr', ticketId: null },
    vend: { stallId: 'panoi', tab: 'cook' },
    counters: {},
    orders: [],
    sheetId: null,
    toast: null,
    now: Date.now()
  };

  // ---------- helpers ----------

  function uid() { return 'o' + (++seq) + '_' + Math.random().toString(36).slice(2, 7); }

  function emit() { save(); listeners.forEach(function (f) { f(); }); }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ seq: seq, counters: state.counters, orders: state.orders }));
    } catch (e) { /* โหมดส่วนตัวหรือปิด storage — ปล่อยผ่าน แอปยังทำงานได้ */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (!d || !d.orders || !d.orders.length) return false;
      seq = d.seq || 0; state.counters = d.counters || {}; state.orders = d.orders;
      return true;
    } catch (e) { return false; }
  }

  function nextNo(stallId) {
    if (state.counters[stallId] == null) state.counters[stallId] = Data.stall(stallId).start;
    return state.counters[stallId]++;
  }

  // ---------- selectors ----------

  /** คิวที่รอทำของร้านหนึ่ง เรียงตามลำดับจริง (คิวที่ถูกข้ามจะไปต่อท้าย) */
  function queueOf(stallId) {
    return state.orders
      .filter(function (o) { return o.stallId === stallId && o.status === 'queued'; })
      .sort(function (a, b) { return a.sort - b.sort; });
  }

  function aheadOf(order) {
    var q = queueOf(order.stallId);
    var i = q.findIndex(function (o) { return o.id === order.id; });
    return i < 0 ? 0 : i;
  }

  function waitMins(stallId, ahead) {
    return Math.max(1, Math.round(Data.stall(stallId).mins * ahead) + 1);
  }

  function orderById(id) {
    return state.orders.filter(function (o) { return o.id === id; })[0] || null;
  }

  function title(order) {
    return order.lines.map(function (l) {
      return l.qty > 1 ? l.name + ' ×' + l.qty : l.name;
    }).join(' + ');
  }

  function isSpecial(order) { return order.mods.length > 0; }

  /**
   * จับกลุ่มออเดอร์ที่เหมือนกันเป๊ะให้แม่ค้าทำรวดเดียว
   * นี่คือหัวใจของแอป: จานที่เหมือนกันแทนกันได้ จึงไม่ต้องรู้ว่าจานไหนของใคร
   * แต่ออเดอร์ที่มีตัวเลือกพิเศษแทนกันไม่ได้ จึงแยกการ์ดเสมอ
   */
  function groupsOf(orders) {
    var out = [], index = {};
    orders.forEach(function (o) {
      var key = isSpecial(o)
        ? 'x:' + o.id
        : 's:' + o.lines.map(function (l) { return l.dishId + '*' + l.qty; }).sort().join('|');
      if (!index[key]) {
        index[key] = { key: key, label: title(o), special: isSpecial(o), mods: o.mods, orders: [] };
        out.push(index[key]);
      }
      index[key].orders.push(o);
    });
    return out;
  }

  function cookQueue(stallId) {
    var q = queueOf(stallId);
    return { cooking: q.slice(0, COOK_WINDOW), waiting: q.slice(COOK_WINDOW) };
  }

  function unpaidOf(stallId) {
    return state.orders.filter(function (o) { return o.stallId === stallId && o.status === 'unpaid'; });
  }

  function specialsOf(stallId) {
    return queueOf(stallId).filter(isSpecial);
  }

  function myOrders() {
    return state.orders
      .filter(function (o) { return o.mine; })
      .sort(function (a, b) { return b.placedAt - a.placedAt; });
  }

  function myActive() {
    return myOrders().filter(function (o) {
      return o.status === 'unpaid' || o.status === 'queued' || o.status === 'ready';
    });
  }

  function cartLines() {
    var c = state.cust;
    if (!c.stallId) return [];
    return Object.keys(c.cart).filter(function (k) { return c.cart[k] > 0; }).map(function (k) {
      var d = Data.dish(c.stallId, k);
      return { dishId: k, name: d.name, price: d.price, qty: c.cart[k] };
    });
  }

  function cartTotal() {
    return cartLines().reduce(function (s, l) { return s + l.price * l.qty; }, 0);
  }

  // ---------- เสียงและการแจ้งเตือน ----------

  /* ประกาศเลขคิวออกลำโพงมือถือแม่ค้า — แทนจอเรียกคิว โดยไม่ต้องซื้ออะไรเพิ่ม */
  function speak(no) {
    try {
      if (!('speechSynthesis' in window)) return false;
      var u = new SpeechSynthesisUtterance('คิว ' + Thai.words(no) + ' ค่ะ');
      u.lang = 'th-TH'; u.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function push(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body, tag: 'torqueue' });
      }
    } catch (e) { /* ไม่ซีเรียส แบนเนอร์ในแอปยังทำงาน */ }
  }

  function toast(msg) {
    state.toast = { msg: msg, at: Date.now() };
    setTimeout(function () {
      if (state.toast && Date.now() - state.toast.at >= 2900) { state.toast = null; emit(); }
    }, 3000);
  }

  // ---------- actions ----------

  var A = {};

  A.setRole = function (r) { state.role = r; emit(); };

  A.custTab = function (t) {
    state.cust.tab = t;
    state.cust.view = t === 'home' ? 'stalls' : 'list';
    emit();
  };

  A.openStall = function (id) {
    var c = state.cust;
    if (c.stallId !== id) { c.cart = {}; c.mods = []; }
    c.stallId = id; c.view = 'menu'; emit();
  };

  A.back = function () {
    var c = state.cust;
    c.view = c.view === 'checkout' ? 'menu' : 'stalls';
    emit();
  };

  A.setQty = function (dishId, delta) {
    var c = state.cust;
    c.cart[dishId] = Math.max(0, Math.min(9, (c.cart[dishId] || 0) + delta));
    emit();
  };

  A.toCheckout = function () { state.cust.view = 'checkout'; emit(); };

  A.toggleMod = function (m) {
    var c = state.cust, i = c.mods.indexOf(m);
    if (i < 0) c.mods.push(m); else c.mods.splice(i, 1);
    emit();
  };

  A.setPay = function (p) { state.cust.pay = p; emit(); };

  A.place = function () {
    var c = state.cust, lines = cartLines();
    if (!lines.length) return;

    var order = {
      id: uid(),
      no: nextNo(c.stallId),
      stallId: c.stallId,
      lines: lines,
      mods: c.mods.slice(),
      pay: c.pay,
      status: c.pay === 'cash' ? 'unpaid' : 'queued',   // เงินสดยังไม่เข้าคิวจนกว่าแม่ค้าจะกดรับเงิน
      placedAt: Date.now(),
      sort: ++seq,
      skipped: false,
      prepared: false,
      mine: true
    };
    state.orders.push(order);

    c.cart = {}; c.mods = []; c.view = 'ticket'; c.ticketId = order.id; c.tab = 'mine';
    emit();
  };

  A.openTicket = function (id) {
    state.cust.ticketId = id; state.cust.view = 'ticket'; state.cust.tab = 'mine'; emit();
  };

  A.cancel = function (id) {
    var o = orderById(id); if (!o) return;
    o.status = 'cancelled';
    state.cust.view = 'stalls'; state.cust.tab = 'home';
    toast('ยกเลิกคิว ' + Thai.pad(o.no) + ' แล้ว');
    emit();
  };

  /** ลูกค้ากดยืนยันว่ารับอาหารแล้ว */
  A.collect = function (id) {
    var o = orderById(id); if (!o) return;
    o.status = 'done';
    state.cust.view = 'stalls'; state.cust.tab = 'home';
    toast('รับอาหารเรียบร้อย ขอบคุณครับ');
    emit();
  };

  A.vendTab = function (t) { state.vend.tab = t; emit(); };
  A.vendStall = function (id) { state.vend.stallId = id; emit(); };

  /** แม่ค้ากด "เสร็จ 1 จาน" — หยิบคิวที่เก่าที่สุดในกลุ่มนั้นขึ้นมาส่งมอบ */
  A.finishOne = function (groupKey) {
    var g = groupsOf(queueOf(state.vend.stallId)).filter(function (x) { return x.key === groupKey; })[0];
    if (!g || !g.orders.length) return;
    var o = g.orders[0];
    o.status = 'ready'; o.readyAt = Date.now();
    state.sheetId = o.id;
    speak(o.no);
    if (o.mine) push('คิว ' + Thai.pad(o.no) + ' รับได้แล้ว', 'แสดงหน้าจอให้แม่ค้าดูได้เลย');
    emit();
  };

  A.handOver = function (id) {
    var o = orderById(id); if (!o) return;
    o.status = 'done';
    state.sheetId = null;
    toast('ส่งมอบคิว ' + Thai.pad(o.no) + ' แล้ว');
    emit();
  };

  /** ลูกค้าไม่มารับ — ย้ายไปท้ายแถวได้ครั้งเดียว ครั้งที่สองต้องยกเลิก */
  A.skip = function (id) {
    var o = orderById(id); if (!o) return;
    if (o.skipped) {
      o.status = 'cancelled';
      toast('ยกเลิกคิว ' + Thai.pad(o.no) + ' (ไม่มารับซ้ำ)');
    } else {
      o.status = 'queued'; o.skipped = true; o.prepared = false; o.sort = ++seq;
      toast('ย้ายคิว ' + Thai.pad(o.no) + ' ไปท้ายแถว');
    }
    state.sheetId = null;
    emit();
  };

  A.closeSheet = function () { state.sheetId = null; emit(); };

  A.speakAgain = function (no) { if (!speak(no)) toast('เครื่องนี้ไม่รองรับเสียงพูด'); };

  /** แม่ค้ากดรับเงินสดแล้ว ออเดอร์จึงเข้าคิวทำอาหาร */
  A.confirmCash = function (id) {
    var o = orderById(id); if (!o) return;
    o.status = 'queued'; o.sort = ++seq; o.paidAt = Date.now();
    toast('คิว ' + Thai.pad(o.no) + ' เข้าคิวแล้ว');
    emit();
  };

  A.askNotify = function () {
    if (!('Notification' in window)) { toast('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน'); return; }
    Notification.requestPermission().then(function (p) {
      toast(p === 'granted' ? 'เปิดแจ้งเตือนแล้ว' : 'ยังไม่ได้เปิดแจ้งเตือน');
      emit();
    });
  };

  A.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  // ---------- นาฬิกา ----------

  function tick() {
    var changed = false;
    state.now = Date.now();

    state.orders.forEach(function (o) {
      // เงินสดค้างจ่ายเกินเวลา
      if (o.status === 'unpaid' && state.now - o.placedAt > CASH_TIMEOUT) {
        o.status = 'cancelled';
        if (o.mine) toast('คิว ' + Thai.pad(o.no) + ' ถูกยกเลิก เพราะไม่ได้จ่ายเงินภายใน 5 นาที');
        changed = true;
      }
      // แจ้งเตือนจังหวะแรก: ให้เดินมารอก่อนอาหารเสร็จ
      // จังหวะนี้คือสิ่งที่ทำให้ไม่ต้องมีป้ายหรือคลิปติดจาน เพราะอาหารไม่ต้องวางรอ
      if (o.status === 'queued' && !o.prepared && aheadOf(o) <= PREPARE_AT) {
        o.prepared = true;
        if (o.mine) push('อีก ' + PREPARE_AT + ' คิวถึงคุณแล้ว', 'เดินมารอที่ ' + Data.stall(o.stallId).name + ' ได้เลย');
        changed = true;
      }
    });

    if (changed) emit(); else listeners.forEach(function (f) { f(); });
  }

  // ---------- boot ----------

  function boot() {
    if (!load()) {
      Data.SEED.forEach(function (s) {
        var d = Data.dish(s.stall, s.dish);
        state.orders.push({
          id: uid(), no: nextNo(s.stall), stallId: s.stall,
          lines: [{ dishId: d.id, name: d.name, price: d.price, qty: 1 }],
          mods: s.mods, pay: s.cash ? 'cash' : 'qr',
          status: s.cash ? 'unpaid' : 'queued',
          placedAt: Date.now(), sort: ++seq,
          skipped: false, prepared: false, mine: false
        });
      });
    }
    setInterval(tick, 1000);
  }

  return {
    state: state, actions: A, boot: boot,
    subscribe: function (f) { listeners.push(f); },
    queueOf: queueOf, aheadOf: aheadOf, waitMins: waitMins, orderById: orderById,
    title: title, isSpecial: isSpecial, groupsOf: groupsOf, cookQueue: cookQueue,
    unpaidOf: unpaidOf, specialsOf: specialsOf, myOrders: myOrders, myActive: myActive,
    cartLines: cartLines, cartTotal: cartTotal, toast: toast,
    CASH_TIMEOUT: CASH_TIMEOUT, PREPARE_AT: PREPARE_AT
  };
})();

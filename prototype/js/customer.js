window.Customer = (function () {

  var S = Store, D = Data, I = Identity, T = Thai;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  function busyColor(n) { return n <= 6 ? '#10B981' : n <= 10 ? '#F59E0B' : '#EF4444'; }

  // ---------- 1. เลือกร้าน ----------

  function stalls() {
    var cards = D.STALLS.map(function (s) {
      var n = S.queueOf(s.id).length;
      return '' +
        '<div class="card tappable" data-act="stall" data-id="' + s.id + '">' +
          '<div class="row">' +
            '<div class="stall-name">' + esc(s.name) + '</div>' +
            '<div class="wait">' +
              '<div class="mins">รอ <span class="num">~' + S.waitMins(s.id, n) + '</span> นาที</div>' +
              '<div class="qn"><span class="num">' + n + '</span> คิว</div>' +
            '</div>' +
          '</div>' +
          '<div class="bar"><i style="width:' + Math.min(100, n / 15 * 100) + '%;background:' + busyColor(n) + '"></i></div>' +
        '</div>';
    }).join('');

    return '' +
      '<div class="head"><div class="eyebrow">ต่อคิว · KU Sriracha</div><h1>เลือกร้านอาหาร</h1></div>' +
      '<div class="scroll">' + cards + '</div>';
  }

  // ---------- 2. เมนูร้าน ----------

  function menu() {
    var c = S.state.cust, stall = D.stall(c.stallId);
    var cats = [], seen = {};
    stall.menu.forEach(function (m) { if (!seen[m.cat]) { seen[m.cat] = 1; cats.push(m.cat); } });

    var body = cats.map(function (cat) {
      var items = stall.menu.filter(function (m) { return m.cat === cat; }).map(function (m) {
        var qty = c.cart[m.id] || 0;
        // จำนวนที่กำลังทำอยู่ของจานเดียวกัน = สัญญาณว่าจานนี้จะได้เร็ว เพราะทำรวมกันได้
        var same = S.queueOf(stall.id).filter(function (o) {
          return !S.isSpecial(o) && o.lines.length === 1 && o.lines[0].dishId === m.id;
        }).length;
        return '' +
          '<div class="item">' +
            '<div class="grow">' +
              '<div class="name">' + esc(m.name) + '</div>' +
              '<div class="price">' + T.baht(m.price) + '</div>' +
              (same >= 2 ? '<div class="hint">กำลังทำอยู่ ' + same + ' จาน — ได้เร็ว</div>' : '') +
            '</div>' +
            '<div class="stepper">' +
              '<button data-act="qty" data-id="' + m.id + '" data-d="-1"' + (qty ? '' : ' disabled') + ' aria-label="ลด">−</button>' +
              '<div class="qty num">' + qty + '</div>' +
              '<button data-act="qty" data-id="' + m.id + '" data-d="1" aria-label="เพิ่ม">+</button>' +
            '</div>' +
          '</div>';
      }).join('');
      return '<div class="cat">' + esc(cat) + '</div><div class="card">' + items + '</div>';
    }).join('');

    var lines = S.cartLines(), total = S.cartTotal();
    var count = lines.reduce(function (s, l) { return s + l.qty; }, 0);

    return '' +
      '<div class="head">' +
        '<button class="btn ghost" style="width:auto;min-height:0;justify-content:flex-start;margin-bottom:6px" data-act="back">← กลับ</button>' +
        '<h1>' + esc(stall.name) + '</h1>' +
      '</div>' +
      '<div class="scroll">' + body + '</div>' +
      '<div class="dock">' +
        '<button class="btn primary" data-act="checkout"' + (count ? '' : ' disabled') + '>' +
          (count ? 'ตะกร้า ' + count + ' รายการ · ' + T.baht(total) : 'เลือกเมนูก่อน') +
        '</button>' +
      '</div>';
  }

  // ---------- 3. ยืนยันออเดอร์ ----------

  function checkout() {
    var c = S.state.cust, lines = S.cartLines(), total = S.cartTotal();

    var summary = lines.map(function (l) {
      return '<div class="item"><div class="grow"><div class="name">' + esc(l.name) + '</div></div>' +
             '<div class="num">×' + l.qty + '</div>' +
             '<div class="num" style="min-width:64px;text-align:right">' + T.baht(l.price * l.qty) + '</div></div>';
    }).join('');

    var mods = D.MODS.map(function (m) {
      return '<button class="chip" data-act="mod" data-m="' + esc(m) + '" aria-pressed="' +
             (c.mods.indexOf(m) >= 0) + '">' + esc(m) + '</button>';
    }).join('');

    return '' +
      '<div class="head">' +
        '<button class="btn ghost" style="width:auto;min-height:0;justify-content:flex-start;margin-bottom:6px" data-act="back">← กลับ</button>' +
        '<h1>ยืนยันออเดอร์</h1>' +
      '</div>' +
      '<div class="scroll">' +
        '<div class="card">' + summary +
          '<div class="item" style="border-top:1px solid var(--line);border-bottom:0">' +
            '<div class="grow"><b>รวม</b></div><div class="num" style="font-size:22px">' + T.baht(total) + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="cat">ตัวเลือกพิเศษ</div>' +
        '<div class="chips">' + mods + '</div>' +
        (c.mods.length
          ? '<div class="warn"><span>⚠</span><span>ออเดอร์พิเศษอาจใช้เวลานานกว่าปกติ 2-3 นาที เพราะทำรวมกับจานอื่นไม่ได้</span></div>'
          : '') +

        '<div class="cat">วิธีชำระเงิน</div>' +
        '<div class="pay">' +
          '<button data-act="pay" data-p="qr" aria-pressed="' + (c.pay === 'qr') + '">' +
            '<div class="t">สแกนจ่าย</div><div class="s">เข้าคิวทันที</div></button>' +
          '<button data-act="pay" data-p="cash" aria-pressed="' + (c.pay === 'cash') + '">' +
            '<div class="t">เงินสด</div><div class="s">ต้องจ่ายที่ร้านก่อนเข้าคิว</div></button>' +
        '</div>' +
      '</div>' +
      '<div class="dock"><button class="btn primary" data-act="place">ยืนยันและรับคิว</button></div>';
  }

  // ---------- 4-7. บัตรคิว ----------

  function ticket() {
    var o = S.orderById(S.state.cust.ticketId);
    if (!o || o.status === 'done' || o.status === 'cancelled') return stalls();

    var id = I.of(o.no), stall = D.stall(o.stallId);
    var pad = T.pad(o.no);

    if (o.status === 'unpaid') return unpaidTicket(o, stall, pad);
    if (o.status === 'ready')  return readyTicket(o, id, pad);
    return waitingTicket(o, id, stall, pad);
  }

  /** บัตรคิวปกติ — พื้นสีเต็มจอ อ่านออกจากระยะ 2 เมตร */
  function waitingTicket(o, id, stall, pad) {
    var ahead = S.aheadOf(o);
    var soon = ahead <= S.PREPARE_AT;
    var dots = '';
    for (var i = 0; i < 6; i++) dots += '<i class="' + (i < 6 - Math.min(6, ahead) ? 'on' : '') + '"></i>';

    var canNotify = ('Notification' in window) && Notification.permission === 'default';

    return '' +
      '<div class="ticket" style="background:' + id.color + '">' +
        '<button class="tback" data-act="tab" data-t="mine" aria-label="กลับ"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>' +
        (soon
          ? '<div class="banner"><span style="font-size:22px">🔔</span>' +
            '<span>อีก ' + ahead + ' คิวถึงคุณแล้ว — เดินมารอที่ร้านได้เลย</span></div>'
          : '') +
        '<div class="glyph">' + I.svg(id.shape, 60, '#fff', false) + '</div>' +
        '<div class="qnum">' + pad + '</div>' +
        '<div class="stall">' + esc(stall.name) + '</div>' +
        '<div class="dish">' + esc(S.title(o)) + '</div>' +
        (o.mods.length ? '<div class="modpill"><b>' + esc(o.mods.join(' · ')) + '</b></div>' : '') +
        '<div class="eta">' +
          (ahead === 0 ? 'ถึงคิวคุณแล้ว กำลังทำอยู่' : 'อีก ' + ahead + ' คิวถึงคุณ') +
          '<small>ประมาณ ' + S.waitMins(o.stallId, ahead) + ' นาที</small>' +
        '</div>' +
        '<div class="dots">' + dots + '</div>' +
        '<div class="spacer"></div>' +
        (canNotify ? '<button class="btn outline" style="border:1.5px solid rgba(255,255,255,.6);color:#fff;margin-bottom:10px" data-act="notify">เปิดแจ้งเตือน</button>' : '') +
        '<button class="btn" style="border:1.5px solid rgba(255,255,255,.5);color:#fff" data-act="cancel" data-id="' + o.id + '">ยกเลิกออเดอร์</button>' +
      '</div>';
  }

  /** หน้าจอตอนรับอาหาร — มีหน้าที่เดียวคือยกขึ้นให้แม่ค้าดู จึงไม่มีอะไรอย่างอื่น */
  function readyTicket(o, id, pad) {
    return '' +
      '<div class="ticket ready" style="background:' + id.color + '">' +
        '<button class="tback" data-act="tab" data-t="mine" aria-label="กลับ"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>' +
        '<div class="showme">แสดงหน้าจอนี้ให้แม่ค้าดู</div>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:14px">' +
          I.svg(id.shape, 96, '#fff', false) +
          '<div class="qnum" style="font-size:clamp(120px,38vw,170px)">' + pad + '</div>' +
        '</div>' +
        '<div class="dish">' + esc(S.title(o)) + '</div>' +
        (o.mods.length ? '<div class="modpill"><b>' + esc(o.mods.join(' · ')) + '</b></div>' : '') +
        '<div style="height:26px"></div>' +
        '<button class="btn white" style="color:' + id.color + '" data-act="collect" data-id="' + o.id + '">รับอาหารแล้ว</button>' +
      '</div>';
  }

  /** บัตรเงินสดที่ยังไม่จ่าย — ต้องดู "ตาย" ต่างจากบัตรที่เข้าคิวแล้วอย่างชัดเจน */
  function unpaidTicket(o, stall, pad) {
    var left = Math.max(0, S.CASH_TIMEOUT - (Date.now() - o.placedAt));
    var mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000);

    return '' +
      '<div class="ticket dead">' +
        '<button class="tback" data-act="tab" data-t="mine" aria-label="กลับ"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>' +
        '<div class="deadbar">ยังไม่เข้าคิว — จ่ายเงินที่ร้านก่อน</div>' +
        '<div class="qnum" style="opacity:.55">' + pad + '</div>' +
        '<div class="stall">' + esc(stall.name) + '</div>' +
        '<div class="dish">' + esc(S.title(o)) + '</div>' +
        '<div class="eta">' + T.baht(o.lines.reduce(function (s, l) { return s + l.price * l.qty; }, 0)) +
          '<small>แจ้งแม่ค้าว่าจ่ายเงินสด</small></div>' +
        '<div class="eta" style="font-size:16px;opacity:.9">ยกเลิกอัตโนมัติใน ' +
          '<span class="num">' + mm + ':' + String(ss).padStart(2, '0') + '</span></div>' +
        '<div class="spacer"></div>' +
        '<button class="btn" style="border:1.5px solid rgba(255,255,255,.5);color:#fff" data-act="cancel" data-id="' + o.id + '">ยกเลิกออเดอร์</button>' +
      '</div>';
  }

  // ---------- คิวของฉัน / ประวัติ ----------

  function orderRow(o) {
    var id = I.of(o.no);
    var label = { unpaid: 'รอชำระ', queued: 'กำลังรอ', ready: 'รับได้แล้ว', done: 'รับแล้ว', cancelled: 'ยกเลิก' }[o.status];
    var dim = (o.status === 'done' || o.status === 'cancelled');
    return '' +
      '<div class="card' + (dim ? '' : ' tappable" data-act="ticket" data-id="' + o.id) + '"' +
        (dim ? ' style="opacity:.55"' : '') + '>' +
        '<div class="row" style="align-items:center">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<span class="qchip" style="background:' + (dim ? '#9CA3AF' : id.color) + ';color:' + id.chipFg + ';display:flex;align-items:center;gap:6px">' +
              I.svg(id.shape, 13, id.chipFg, true) + T.pad(o.no) + '</span>' +
            '<div><div style="font-weight:700">' + esc(S.title(o)) + '</div>' +
            '<div style="color:var(--muted);font-size:15px">' + esc(D.stall(o.stallId).name) + '</div></div>' +
          '</div>' +
          '<div style="color:var(--muted);font-size:15px;white-space:nowrap">' + label + '</div>' +
        '</div>' +
      '</div>';
  }

  function mine() {
    var list = S.myActive();
    return '<div class="head"><div class="eyebrow">ต่อคิว</div><h1>คิวของฉัน</h1></div>' +
      '<div class="scroll">' + (list.length ? list.map(orderRow).join('')
        : '<div class="empty">ยังไม่มีคิวที่รออยู่<br>เลือกร้านจากหน้าแรกได้เลย</div>') + '</div>';
  }

  function history() {
    var list = S.myOrders().filter(function (o) { return o.status === 'done' || o.status === 'cancelled'; });
    return '<div class="head"><div class="eyebrow">ต่อคิว</div><h1>ประวัติ</h1></div>' +
      '<div class="scroll">' + (list.length ? list.map(orderRow).join('')
        : '<div class="empty">ยังไม่มีประวัติการสั่ง</div>') + '</div>';
  }

  // ---------- ประกอบหน้าจอ ----------

  function tabbar() {
    var c = S.state.cust, n = S.myActive().length;
    function tab(key, label, icon) {
      return '<button data-act="tab" data-t="' + key + '" aria-current="' + (c.tab === key) + '">' +
        icon + '<span>' + label + '</span>' +
        (key === 'mine' && n ? '<span class="badge num">' + n + '</span>' : '') + '</button>';
    }
    var home = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3Z"/></svg>';
    var q    = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 14h6"/></svg>';
    var hist = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/></svg>';
    return '<nav class="tabbar">' + tab('home', 'หน้าแรก', home) + tab('mine', 'คิวของฉัน', q) + tab('history', 'ประวัติ', hist) + '</nav>';
  }

  function render() {
    var c = S.state.cust, body, showTabs = true;
    var t = c.view === 'ticket' ? S.orderById(c.ticketId) : null;
    var live = !!t && (t.status === 'unpaid' || t.status === 'queued' || t.status === 'ready');

    if (c.tab === 'mine' && live) { body = ticket(); showTabs = false; }
    else if (c.tab === 'mine')     body = mine();
    else if (c.tab === 'history')  body = history();
    else if (c.view === 'menu')    { body = menu(); showTabs = false; }
    else if (c.view === 'checkout'){ body = checkout(); showTabs = false; }
    else                            body = stalls();

    return '<div class="screen">' + body + '</div>' + (showTabs ? tabbar() : '');
  }

  return { render: render };
})();

window.Vendor = (function () {

  var S = Store, D = Data, I = Identity, T = Thai;

  /* ยอดสะสมตั้งต้นสำหรับเดโม — ยอดขายจริงที่เกิดในแอปจะบวกทับตัวเลขนี้ */
  var SEED_SALES = { panoi: 47, yaay: 31, muay: 39, chan: 44, bird: 52, saeb: 26 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  function money(o) { return o.lines.reduce(function (s, l) { return s + l.price * l.qty; }, 0); }

  /** ชิปเลขคิว: สี + รูปทรง + ตัวเลข ทั้งสามอย่างพร้อมกันเสมอ */
  function chip(no) {
    var id = I.of(no);
    return '<span class="qchip" style="background:' + id.color + ';color:' + id.chipFg +
           ';display:inline-flex;align-items:center;gap:6px">' +
           I.svg(id.shape, 13, id.chipFg, true) + T.pad(no) + '</span>';
  }

  // ---------- คิวทำอาหาร ----------

  function groupCard(g) {
    var n = g.orders.length;
    return '' +
      '<div class="card group' + (g.special ? ' special' : '') + '">' +
        '<div class="top">' +
          '<div>' +
            '<div class="dish">' + esc(g.label) + (n > 1 ? ' <em>×' + n + '</em>' : '') + '</div>' +
            (g.special ? '<div class="mods">' + esc(g.mods.join(' ')) + '</div>' : '') +
          '</div>' +
          '<div class="qchips">' + g.orders.map(function (o) { return chip(o.no); }).join('') + '</div>' +
        '</div>' +
        '<button class="btn go" data-act="finish" data-k="' + esc(g.key) + '">' +
          (n > 1 ? 'เสร็จ 1 จาน' : 'เสร็จแล้ว') +
        '</button>' +
      '</div>';
  }

  function cook() {
    var sid = S.state.vend.stallId;
    var q = S.cookQueue(sid);
    var total = q.cooking.length + q.waiting.length;

    if (!total) return '<div class="scroll"><div class="empty">ยังไม่มีคิวรอทำ<br>สบายๆ ครับ</div></div>';

    var html = '<div class="bigcount"><span class="n">' + total + '</span><span class="l">คิวรอ</span></div>';
    if (q.cooking.length) {
      html += '<div class="section">กำลังทำ</div>' + S.groupsOf(q.cooking).map(groupCard).join('');
    }
    if (q.waiting.length) {
      html += '<div class="section">รอทำ</div>' + S.groupsOf(q.waiting).map(groupCard).join('');
    }
    return '<div class="scroll">' + html + '</div>';
  }

  // ---------- รอเงินสด ----------

  function cash() {
    var list = S.unpaidOf(S.state.vend.stallId);
    if (!list.length) return '<div class="scroll"><div class="empty">ไม่มีคิวรอชำระ</div></div>';

    var rows = list.map(function (o) {
      var left = Math.max(0, S.CASH_TIMEOUT - (Date.now() - o.placedAt));
      var mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000);
      return '' +
        '<div class="card">' +
          '<div class="cashrow">' +
            '<span class="qchip" style="background:#9CA3AF;color:#fff">' + T.pad(o.no) + '</span>' +
            '<div><div style="font-weight:700">' + esc(S.title(o)) + '</div>' +
              '<div style="color:var(--muted);font-size:14px">ยกเลิกอัตโนมัติใน <span class="num">' +
              mm + ':' + String(ss).padStart(2, '0') + '</span></div></div>' +
            '<div class="amt">' + T.baht(money(o)) + '</div>' +
          '</div>' +
          '<div style="margin-bottom:14px"><span class="pill">รอเงินสด</span></div>' +
          '<button class="btn go" data-act="cash" data-id="' + o.id + '">รับเงินแล้ว — เข้าคิว</button>' +
        '</div>';
    }).join('');

    return '<div class="scroll">' +
      '<div class="warn" style="margin-top:20px"><span>ℹ</span>' +
      '<span>คิวเงินสดจะยังไม่เข้าคิวทำอาหาร จนกว่าจะกดรับเงิน</span></div>' + rows + '</div>';
  }

  // ---------- ออเดอร์พิเศษ ----------

  function special() {
    var list = S.specialsOf(S.state.vend.stallId);
    if (!list.length) return '<div class="scroll"><div class="empty">ไม่มีออเดอร์พิเศษในคิวตอนนี้</div></div>';

    var rows = list.map(function (o) {
      return '<div class="card special">' +
        '<div class="top">' +
          '<div><div class="dish">' + esc(S.title(o)) + '</div>' +
          '<div class="mods">' + esc(o.mods.join(' · ')) + '</div></div>' +
          '<div class="qchips">' + chip(o.no) + '</div>' +
        '</div></div>';
    }).join('');

    return '<div class="scroll"><div class="section" style="margin-top:20px">' +
      'เช็คก่อนส่ง — ออเดอร์เหล่านี้สลับกันไม่ได้</div>' + rows + '</div>';
  }

  // ---------- สรุปวันนี้ ----------

  function summary() {
    var sid = S.state.vend.stallId;
    var done = S.state.orders.filter(function (o) { return o.stallId === sid && o.status === 'done'; });
    var count = SEED_SALES[sid] + done.length;
    var baht = SEED_SALES[sid] * 91 + done.reduce(function (s, o) { return s + money(o); }, 0);

    var tally = {};
    S.state.orders.filter(function (o) { return o.stallId === sid && o.status !== 'cancelled'; })
      .forEach(function (o) { o.lines.forEach(function (l) { tally[l.name] = (tally[l.name] || 0) + l.qty; }); });
    var best = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; }).slice(0, 5);

    var max = Math.max.apply(null, D.HOURS);
    var bars = D.HOURS.map(function (h) {
      return '<div class="h" style="height:' + (h / max * 100) + '%"></div>';
    }).join('');
    var labels = ['10', '11', '12', '13', '14', '15', '16']
      .map(function (h) { return '<span>' + h + '</span>'; }).join('');

    return '<div class="scroll">' +
      '<div class="stat" style="margin-top:20px">' +
        '<div class="card"><div class="k">ยอดขาย</div><div class="v">' + T.baht(baht) + '</div></div>' +
        '<div class="card"><div class="k">ออเดอร์</div><div class="v">' + count + '</div></div>' +
      '</div>' +
      '<div class="card"><div class="k">เวลารอเฉลี่ย</div><div class="v">' +
        S.waitMins(sid, Math.round(S.queueOf(sid).length / 2)) + ' นาที</div></div>' +

      '<div class="card"><div class="k">ออเดอร์ต่อชั่วโมง</div>' +
        '<div class="hours">' + bars + '</div><div class="hours-x">' + labels + '</div></div>' +

      '<div class="card"><div class="k" style="margin-bottom:10px">ขายดี</div>' +
        best.map(function (n, i) {
          return '<div class="item"><div class="grow"><span class="num" style="color:var(--muted);margin-right:10px">' +
            (i + 1) + '</span>' + esc(n) + '</div><div class="num">' + tally[n] + '</div></div>';
        }).join('') + '</div>' +

      '<button class="btn ghost" data-act="reset" style="margin-top:8px">รีเซ็ตข้อมูลเดโม</button>' +
    '</div>';
  }

  // ---------- แผ่นส่งมอบ ----------
  // แม่ค้าเห็นสี+รูปทรง+เลขเดียวกับที่ลูกค้ายกจอขึ้นมาโชว์ จับคู่ได้โดยไม่ต้องอ่าน

  function sheet() {
    var o = S.orderById(S.state.sheetId);
    if (!o) return '';
    var id = I.of(o.no);

    return '' +
      '<div class="backdrop" data-act="closesheet">' +
        '<div class="sheet" style="background:' + id.color + '" data-stop="1">' +
          '<div class="grab"></div>' +
          '<div>' + I.svg(id.shape, 104, '#fff', false) + '</div>' +
          '<div class="qnum">' + T.pad(o.no) + '</div>' +
          '<div class="dish">' + esc(S.title(o)) + '</div>' +
          (o.mods.length ? '<div class="mods">' + esc(o.mods.join(' · ')) + '</div>' : '') +
          '<div class="panel">' +
            '<p>เรียกคิวนี้ — ให้ลูกค้าโชว์หน้าจอสีเดียวกัน</p>' +
            '<button class="speak" data-act="speak" data-no="' + o.no + '">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round">' +
              '<path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7" stroke-linecap="round"/></svg>' +
              'ประกาศ: คิว' + Thai.words(o.no) +
            '</button>' +
          '</div>' +
          '<button class="btn white" style="color:' + id.color + '" data-act="handover" data-id="' + o.id + '">ส่งมอบแล้ว</button>' +
          '<button class="btn translucent" data-act="skip" data-id="' + o.id + '">' +
            (o.skipped ? 'ไม่มารับอีก — ยกเลิกคิวนี้' : 'ยังไม่มารับ — ข้ามไปก่อน') + '</button>' +
          '<button class="btn outline" data-act="closesheet">ปิด</button>' +
        '</div>' +
      '</div>';
  }

  // ---------- ประกอบหน้าจอ ----------

  function render() {
    var v = S.state.vend, stall = D.stall(v.stallId);
    var nCash = S.unpaidOf(v.stallId).length;

    var picker = D.STALLS.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === v.stallId ? ' selected' : '') + '>' + esc(s.name) + '</option>';
    }).join('');

    function tab(key, label, badge) {
      return '<button data-act="vtab" data-t="' + key + '" aria-current="' + (v.tab === key) + '">' +
        label + (badge ? ' <span class="num" style="color:var(--unpaid)">' + badge + '</span>' : '') + '</button>';
    }

    var body = v.tab === 'cash' ? cash()
             : v.tab === 'special' ? special()
             : v.tab === 'summary' ? summary()
             : cook();

    return '<div class="screen">' +
      '<div class="head dark">' +
        '<div class="eyebrow">ต่อคิว · ร้านค้า</div>' +
        '<select data-act="vstall" style="background:none;border:0;color:#fff;font:700 26px var(--font-th);' +
          'padding:0;max-width:100%">' + picker + '</select>' +
      '</div>' +
      '<div class="vtabs">' +
        tab('cook', 'คิวทำอาหาร') + tab('cash', 'รอเงินสด', nCash) +
        tab('special', 'พิเศษ') + tab('summary', 'สรุป') +
      '</div>' + body +
    '</div>';
  }

  return { render: render, sheet: sheet };
})();

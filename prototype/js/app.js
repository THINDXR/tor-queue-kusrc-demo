(function () {

  var S = Store, A = Store.actions;
  var root = document.getElementById('root');
  var sheetEl = document.getElementById('sheet');
  var toastEl = document.getElementById('toast');
  var lastRoot = '', lastSheet = '', lastToast = '';

  function roleSwitch() {
    function b(role, label) {
      return '<button data-act="role" data-r="' + role + '" aria-pressed="' +
        (S.state.role === role) + '">' + label + '</button>';
    }
    return '<div class="roleswitch">' + b('customer', 'ลูกค้า') + b('vendor', 'ร้านค้า') + '</div>';
  }

  function render() {
    // เขียนทับ DOM เฉพาะตอนผลลัพธ์เปลี่ยนจริง ไม่งั้นนาฬิกาที่เดินทุกวินาที
    // จะรีเซ็ตตำแหน่งเลื่อนจอและกินแรงเครื่องเปล่าๆ
    var html = roleSwitch() +
      (S.state.role === 'vendor' ? Vendor.render() : Customer.render());

    if (html !== lastRoot) {
      var sc = root.querySelector('.scroll');
      var top = sc ? sc.scrollTop : 0;
      root.innerHTML = html;
      lastRoot = html;
      var sc2 = root.querySelector('.scroll');
      if (sc2 && top) sc2.scrollTop = top;
    }

    var sh = S.state.role === 'vendor' ? Vendor.sheet() : '';
    if (sh !== lastSheet) { sheetEl.innerHTML = sh; lastSheet = sh; }

    var to = S.state.toast ? '<div class="t">' + S.state.toast.msg + '</div>' : '';
    if (to !== lastToast) { toastEl.innerHTML = to; lastToast = to; }
  }

  var HANDLERS = {
    role:       function (d) { A.setRole(d.r); },
    tab:        function (d) { A.custTab(d.t); },
    stall:      function (d) { A.openStall(d.id); },
    back:       function ()  { A.back(); },
    qty:        function (d) { A.setQty(d.id, Number(d.d)); },
    checkout:   function ()  { A.toCheckout(); },
    mod:        function (d) { A.toggleMod(d.m); },
    pay:        function (d) { A.setPay(d.p); },
    place:      function ()  { A.place(); },
    ticket:     function (d) { A.openTicket(d.id); },
    cancel:     function (d) { A.cancel(d.id); },
    collect:    function (d) { A.collect(d.id); },
    notify:     function ()  { A.askNotify(); },

    vtab:       function (d) { A.vendTab(d.t); },
    finish:     function (d) { A.finishOne(d.k); },
    cash:       function (d) { A.confirmCash(d.id); },
    handover:   function (d) { A.handOver(d.id); },
    skip:       function (d) { A.skip(d.id); },
    speak:      function (d) { A.speakAgain(Number(d.no)); },
    closesheet: function ()  { A.closeSheet(); },
    reset:      function ()  { if (confirm('ล้างคิวทั้งหมดและเริ่มใหม่?')) A.reset(); }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    // คลิกในแผ่นส่งมอบไม่ควรทะลุไปโดนพื้นหลังจนแผ่นปิดเอง
    if (el.classList.contains('backdrop') && e.target !== el) return;

    var fn = HANDLERS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el.dataset); }
  });

  document.addEventListener('change', function (e) {
    if (e.target.dataset && e.target.dataset.act === 'vstall') A.vendStall(e.target.value);
  });

  S.subscribe(render);
  S.boot();
  render();
})();

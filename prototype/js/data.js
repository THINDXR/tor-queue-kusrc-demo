window.Data = (function () {

  /* ตัวเลือกพิเศษ — ออเดอร์ที่ติดตัวเลือกเหล่านี้คือออเดอร์ที่ "แทนกันไม่ได้"
     จึงห้ามถูกจับกลุ่มรวมกับจานอื่นบนหน้าจอแม่ค้า */
  var MODS = ['ไม่เผ็ด', 'เผ็ดน้อย', 'ไม่ใส่ผัก', 'ข้าวเพิ่ม', 'ไข่ดาว'];

  var STALLS = [
    { id: 'panoi',  name: 'ร้านป้าน้อย ข้าวแกง',   mins: 1.4, start: 34, menu: [
      { id: 'kaprao',  name: 'กะเพราหมูไข่ดาว', price: 50, cat: 'ตามสั่ง', hot: true },
      { id: 'seeew',   name: 'ผัดซีอิ๊ว',        price: 45, cat: 'ตามสั่ง' },
      { id: 'krob',    name: 'ข้าวหมูกรอบ',      price: 55, cat: 'ข้าวราด' },
      { id: 'kanajub', name: 'คะน้าหมูกรอบ',     price: 55, cat: 'ตามสั่ง' },
      { id: 'gaeng',   name: 'แกงเขียวหวานไก่',  price: 50, cat: 'ข้าวราด' }
    ]},
    { id: 'yaay',   name: 'ครัวคุณยาย',           mins: 1.5, start: 12, menu: [
      { id: 'tomyum',  name: 'ต้มยำกุ้งน้ำข้น',  price: 60, cat: 'แกง' },
      { id: 'pladuk',  name: 'ฉู่ฉี่ปลาดุก',      price: 55, cat: 'แกง' },
      { id: 'kaijeaw', name: 'ไข่เจียวหมูสับ',    price: 40, cat: 'ตามสั่ง', hot: true }
    ]},
    { id: 'muay',   name: 'ข้าวมันไก่เจ๊หมวย',    mins: 1.6, start: 51, menu: [
      { id: 'kmg',     name: 'ข้าวมันไก่',        price: 45, cat: 'จานเดียว', hot: true },
      { id: 'kmgtod',  name: 'ข้าวมันไก่ทอด',     price: 50, cat: 'จานเดียว' },
      { id: 'kmgmix',  name: 'ข้าวมันไก่รวม',     price: 55, cat: 'จานเดียว' }
    ]},
    { id: 'chan',   name: 'ก๋วยเตี๋ยวลุงชาญ',     mins: 1.1, start: 78, menu: [
      { id: 'ntok',    name: 'ก๋วยเตี๋ยวน้ำตก',   price: 45, cat: 'ก๋วยเตี๋ยว' },
      { id: 'tomyumn', name: 'ก๋วยเตี๋ยวต้มยำ',   price: 50, cat: 'ก๋วยเตี๋ยว', hot: true },
      { id: 'yen',     name: 'เย็นตาโฟ',          price: 50, cat: 'ก๋วยเตี๋ยว' }
    ]},
    { id: 'bird',   name: 'อาหารตามสั่งพี่เบิร์ด', mins: 1.35, start: 96, menu: [
      { id: 'kapraog', name: 'กะเพราไก่ไข่ดาว',   price: 50, cat: 'ตามสั่ง', hot: true },
      { id: 'khimao',  name: 'ผัดขี้เมาหมู',      price: 55, cat: 'ตามสั่ง' },
      { id: 'promt',   name: 'ข้าวผัดอเมริกัน',   price: 60, cat: 'จานเดียว' },
      { id: 'prik',    name: 'ผัดพริกแกงหมู',     price: 50, cat: 'ตามสั่ง' }
    ]},
    { id: 'saeb',   name: 'ส้มตำแซ่บนัว',         mins: 1.7, start: 23, menu: [
      { id: 'tamthai', name: 'ส้มตำไทย',          price: 40, cat: 'ตำ', hot: true },
      { id: 'tampu',   name: 'ตำปูปลาร้า',        price: 45, cat: 'ตำ' },
      { id: 'gaiyang', name: 'ไก่ย่างครึ่งตัว',    price: 70, cat: 'ย่าง' }
    ]}
  ];

  /* คิวตั้งต้น เขียนไว้ให้เห็นการจับกลุ่มทันทีที่เปิดแอป
     ป้าน้อยจงใจให้ตรงกับดีไซน์: ผัดซีอิ๊ว x2, ออเดอร์พิเศษเดี่ยว, ข้าวหมูกรอบ x2 */
  var SEED = [
    { stall: 'panoi', dish: 'seeew',   mods: [] },
    { stall: 'panoi', dish: 'seeew',   mods: [] },
    { stall: 'panoi', dish: 'krob',    mods: ['ไม่ใส่ผัก', 'ข้าวเพิ่ม'] },
    { stall: 'panoi', dish: 'krob',    mods: [] },
    { stall: 'panoi', dish: 'krob',    mods: [] },
    { stall: 'panoi', dish: 'kaprao',  mods: [] },
    { stall: 'panoi', dish: 'kaprao',  mods: [] },
    { stall: 'panoi', dish: 'kaprao',  mods: ['ไม่เผ็ด'] },
    { stall: 'panoi', dish: 'gaeng',   mods: [] },
    { stall: 'panoi', dish: 'seeew',   mods: [], cash: true },

    { stall: 'yaay',  dish: 'kaijeaw', mods: [] },
    { stall: 'yaay',  dish: 'kaijeaw', mods: [] },
    { stall: 'yaay',  dish: 'tomyum',  mods: [] },
    { stall: 'yaay',  dish: 'pladuk',  mods: ['ไม่เผ็ด'] },
    { stall: 'yaay',  dish: 'kaijeaw', mods: [] },

    { stall: 'muay',  dish: 'kmg',     mods: [] },
    { stall: 'muay',  dish: 'kmg',     mods: [] },
    { stall: 'muay',  dish: 'kmgtod',  mods: [] },

    { stall: 'chan',  dish: 'tomyumn', mods: [] },
    { stall: 'chan',  dish: 'tomyumn', mods: [] },
    { stall: 'chan',  dish: 'yen',     mods: [] },
    { stall: 'chan',  dish: 'ntok',    mods: ['เผ็ดน้อย'] },
    { stall: 'chan',  dish: 'ntok',    mods: [] },
    { stall: 'chan',  dish: 'tomyumn', mods: [] },

    { stall: 'bird',  dish: 'kapraog', mods: [] },
    { stall: 'bird',  dish: 'kapraog', mods: [] },
    { stall: 'bird',  dish: 'kapraog', mods: [] },
    { stall: 'bird',  dish: 'khimao',  mods: [] },
    { stall: 'bird',  dish: 'khimao',  mods: ['ไม่เผ็ด'] },
    { stall: 'bird',  dish: 'promt',   mods: [] },
    { stall: 'bird',  dish: 'prik',    mods: [] },
    { stall: 'bird',  dish: 'prik',    mods: [] },
    { stall: 'bird',  dish: 'kapraog', mods: ['ข้าวเพิ่ม'] },
    { stall: 'bird',  dish: 'promt',   mods: [] },
    { stall: 'bird',  dish: 'khimao',  mods: [] },

    { stall: 'saeb',  dish: 'tamthai', mods: [] },
    { stall: 'saeb',  dish: 'tamthai', mods: ['เผ็ดน้อย'] },
    { stall: 'saeb',  dish: 'gaiyang', mods: [] },
    { stall: 'saeb',  dish: 'tampu',   mods: [] }
  ];

  /* ยอดขายรายชั่วโมงของหน้าสรุป 10:00-16:00 */
  var HOURS = [4, 9, 14, 11, 5, 3, 1];

  function stall(id) { return STALLS.filter(function (s) { return s.id === id })[0]; }
  function dish(stallId, dishId) {
    return stall(stallId).menu.filter(function (m) { return m.id === dishId })[0];
  }

  return { MODS: MODS, STALLS: STALLS, SEED: SEED, HOURS: HOURS, stall: stall, dish: dish };
})();

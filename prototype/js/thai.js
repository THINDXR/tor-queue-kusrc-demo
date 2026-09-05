/* แปลงตัวเลขเป็นคำอ่านภาษาไทย ใช้ตอนให้มือถือแม่ค้าประกาศเสียงเรียกคิว
   รองรับ 0-999 ซึ่งเกินพอสำหรับเลขคิวรายวัน */
window.Thai = (function () {
  var ONES = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

  function words(n) {
    n = Math.floor(Math.abs(n));
    if (n < 10) return ONES[n];

    if (n < 100) {
      var t = Math.floor(n / 10), o = n % 10;
      var tens = t === 1 ? 'สิบ' : t === 2 ? 'ยี่สิบ' : ONES[t] + 'สิบ';
      if (o === 0) return tens;
      // หลักหน่วยที่เป็น 1 อ่านว่า "เอ็ด" เช่น 21 = ยี่สิบเอ็ด
      return tens + (o === 1 ? 'เอ็ด' : ONES[o]);
    }

    var h = Math.floor(n / 100), rest = n % 100;
    if (rest === 0) return ONES[h] + 'ร้อย';
    // 101 อ่านว่า "หนึ่งร้อยเอ็ด" ไม่ใช่ "หนึ่งร้อยหนึ่ง"
    if (rest === 1) return ONES[h] + 'ร้อยเอ็ด';
    return ONES[h] + 'ร้อย' + words(rest);
  }

  /** เลขคิวแบบ 3 หลักสำหรับแสดงผล: 34 -> "034" */
  function pad(n) { return String(n).padStart(3, '0'); }

  /** ราคา: 90 -> "฿90" */
  function baht(n) { return '฿' + n.toLocaleString('th-TH'); }

  return { words: words, pad: pad, baht: baht };
})();

const ONES = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'] as const;

function one(n: number): string {
  return ONES[n] ?? '';
}

/**
 * แปลงตัวเลขเป็นคำอ่านภาษาไทย ใช้ให้มือถือแม่ค้าประกาศเสียงเรียกคิว
 * รองรับ 0-999 ซึ่งเกินพอสำหรับเลขคิวรายวัน
 */
export function thaiWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n < 10) return one(n);

  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    const tens = t === 1 ? 'สิบ' : t === 2 ? 'ยี่สิบ' : one(t) + 'สิบ';
    if (o === 0) return tens;
    // หลักหน่วยที่เป็น 1 อ่านว่า "เอ็ด" เช่น 21 = ยี่สิบเอ็ด
    return tens + (o === 1 ? 'เอ็ด' : one(o));
  }

  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return one(h) + 'ร้อย';
  if (rest === 1) return one(h) + 'ร้อยเอ็ด';
  return one(h) + 'ร้อย' + thaiWords(rest);
}

/** เลขคิวแบบ 3 หลักสำหรับแสดงผล: 34 → "034" */
export function padQueueNo(no: number): string {
  return String(no).padStart(3, '0');
}

/** ราคา: 90 → "฿90" */
export function baht(amount: number): string {
  return '฿' + amount.toLocaleString('th-TH');
}

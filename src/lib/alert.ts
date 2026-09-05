/**
 * เสียงเตือนแม่ค้า
 *
 * แม่ค้ามือไม่ว่าง สายตาอยู่ที่กระทะ ไม่ได้จ้องหน้าจอ การเตือนจึงต้องเข้าหู
 * ไม่ใช่รอให้มองเห็น และต้องทำได้ด้วยมือถือเครื่องเดียวที่ร้านมีอยู่แล้ว
 *
 * บี๊บก่อนแล้วค่อยพูด เพราะเสียงบี๊บแหลมตัดผ่านเสียงพัดลมกับเสียงผัดได้ดีกว่า
 * เสียงพูดที่ค่อย ๆ ขึ้นต้น พอหันมาแล้วประโยคที่ตามมาถึงจะมีความหมาย
 */

let ctx: AudioContext | null = null;

function beep(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    // บี๊บสองครั้งสั้น ๆ จำง่ายกว่าเสียงยาวครั้งเดียว และไม่รบกวนเท่าเสียงกริ่ง
    for (const offset of [0, 0.22]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.28, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    }
  } catch {
    // เบราว์เซอร์บล็อกเสียงจนกว่าจะมีการแตะหน้าจอครั้งแรก ปล่อยผ่าน
  }
}

function say(message: string): void {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(message);
    u.lang = 'th-TH';
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch {
    // ไม่รองรับเสียงพูดก็ยังมีเสียงบี๊บกับแบนเนอร์บนจอ
  }
}

export function alertVendor(message: string): void {
  beep();
  setTimeout(() => say(message), 420);
}

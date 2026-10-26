/**
 * แถบสถานะจำลองของ iPhone — โผล่เฉพาะตอนเปิดบนจอคอม (ตอนพรีเซนต์)
 * บนมือถือจริงซ่อนไว้ เพราะเครื่องมีแถบสถานะของตัวเองอยู่แล้ว
 */
export function StatusBar() {
  return (
    <div className="statusbar" aria-hidden="true">
      <span className="sb-time">9:41</span>
      <span className="sb-island" />
      <span className="sb-icons">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" /><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .8 10.4 10.4 0 0 0 .8 3.7L2 5a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 0 0 8 4.4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3A4.8 4.8 0 0 1 8 6.2Zm0 3.4-1.9 2 1.9 2 1.9-2-1.9-2Z" fill="currentColor" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

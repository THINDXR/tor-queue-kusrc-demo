import type { NotifyPermission } from '../lib/notify';
import { actions } from '../lib/store';

/**
 * ชวนเปิดแจ้งเตือน ณ จังหวะที่เพิ่งได้บัตรคิวมา
 *
 * วางไว้ตรงนี้เพราะเป็นวินาทีที่ลูกค้าเข้าใจเองว่าทำไมต้องเปิด — เขากำลังจะ
 * ต้องรออีกหลายนาที ถ้าไม่เปิดก็ต้องยืนจ้องหน้าจอ ซึ่งคือปัญหาที่แอปนี้จะแก้พอดี
 */
export function NotifyPrompt({ permission }: { permission: NotifyPermission }) {
  if (permission === 'granted' || permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <div className="notifycard denied">
        การแจ้งเตือนถูกปิดไว้ — เปิดใหม่ได้ที่ตั้งค่าเบราว์เซอร์ ระหว่างนี้ต้องเปิดหน้านี้ค้างไว้
      </div>
    );
  }

  return (
    <div className="notifycard">
      <div className="ntop">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
          <path d="M10.5 20a1.9 1.9 0 0 0 3 0" />
        </svg>
        <b>เปิดแจ้งเตือนไว้</b>
      </div>
      <p>จะได้ไปนั่งรอที่โต๊ะหรือเล่นแอปอื่นได้ เราจะเตือนตอนใกล้ถึงคิวคุณ</p>
      <button className="btn" onClick={() => actions.askNotify()}>เปิดแจ้งเตือน</button>
    </div>
  );
}

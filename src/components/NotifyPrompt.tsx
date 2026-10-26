import type { NotifyPermission } from '../lib/notify';
import { actions } from '../lib/store';
import { Icon } from './Icon';

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
        <span className="ntop-badge"><Icon name="bell" size={20} weight={2.1} /></span>
        <b>เปิดแจ้งเตือนไว้</b>
      </div>
      <p>จะได้ไปนั่งรอที่โต๊ะหรือเล่นแอปอื่นได้ เราจะเตือนตอนใกล้ถึงคิวคุณ</p>
      <button className="btn" onClick={() => actions.askNotify()}>
        <Icon name="bell" size={20} weight={2.1} />
        เปิดแจ้งเตือน
      </button>
    </div>
  );
}

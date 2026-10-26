import { myOrders } from '../lib/queue';
import { actions, useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { PHOTO_CREDITS } from '../lib/credits';

const NOTIFY_LABEL = {
  granted: 'เปิดอยู่',
  denied: 'ถูกปิดในเบราว์เซอร์',
  default: 'ยังไม่ได้เปิด',
  unsupported: 'เครื่องนี้ไม่รองรับ',
} as const;

export function Account() {
  const { session, orders, notifyPermission } = useStore();
  if (session?.kind !== 'customer') return null;

  const mine = myOrders(orders);
  const done = mine.filter((o) => o.status === 'done').length;

  return (
    <>
      <div className="head">
        <div className="eyebrow">บัญชีของฉัน</div>
        <h1>โปรไฟล์</h1>
      </div>

      <div className="scroll">
        <div className="card profile">
          <div className="avatar"><Icon name="user" size={28} weight={2.1} /></div>
          <div className="grow">
            <div className="title">{session.name}</div>
            <div className="sub">
              {session.guest ? 'บุคคลทั่วไป' : 'บัญชีนนทรี · ' + session.account}
            </div>
          </div>
        </div>

        <div className="stat">
          <div className="card"><div className="k">สั่งไปแล้ว</div><div className="v">{mine.length}</div></div>
          <div className="card"><div className="k">รับอาหารแล้ว</div><div className="v">{done}</div></div>
        </div>

        <div className="card menu-list">
          <div className="mrow">
            <Icon name="bell" size={21} />
            <div className="grow">การแจ้งเตือน</div>
            <div className="sub">{NOTIFY_LABEL[notifyPermission]}</div>
          </div>
          {notifyPermission === 'default' && (
            <button className="mrow tap" onClick={() => actions.askNotify()}>
              <Icon name="spark" size={21} />
              <div className="grow">เปิดการแจ้งเตือนตอนใกล้ถึงคิว</div>
              <Icon name="next" size={19} weight={2.4} />
            </button>
          )}
          <div className="mrow">
            <Icon name="pin" size={21} />
            <div className="grow">โรงอาหาร มก. ศรีราชา</div>
          </div>
        </div>

        {/* รูป CC BY / CC BY-SA ต้องให้เครดิตผู้ถ่าย */}
        <details className="card credits">
          <summary>เครดิตรูปภาพอาหาร</summary>
          <p className="sub">รูปจาก Wikimedia Commons ใช้ตามสัญญาอนุญาตที่ระบุ</p>
          <ul>
            {PHOTO_CREDITS.map((c) => (
              <li key={c.dish}>
                <a href={c.page} target="_blank" rel="noreferrer">{c.title}</a> — {c.artist} · {c.license}
              </li>
            ))}
          </ul>
        </details>

        <button className="btn danger-outline" onClick={() => actions.logout()}>
          <Icon name="logout" size={20} weight={2.2} />
          ออกจากระบบ
        </button>
      </div>
    </>
  );
}

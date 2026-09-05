import { useEffect } from 'react';
import { myActive } from './lib/queue';
import { setupNotifications } from './lib/notify';
import { actions, startClock, useStore } from './lib/store';
import { padQueueNo } from './lib/thai';
import { RoleSwitch } from './components/RoleSwitch';
import { Toast } from './components/Toast';
import { CustomerApp } from './customer/CustomerApp';
import { VendorApp } from './vendor/VendorApp';

const BASE_TITLE = 'ต่อคิว — โรงอาหาร ม.เกษตร ศรีราชา';

export function App() {
  const { role, toast, orders } = useStore();

  // นาฬิกาเดินวินาทีละครั้ง คอยยกเลิกคิวเงินสดที่ค้างและยิงแจ้งเตือนเตรียมตัว
  useEffect(() => startClock(), []);

  useEffect(() => {
    actions.syncNotifyPermission();
    // แตะการแจ้งเตือนแล้วเด้งกลับมาที่บัตรคิวใบนั้นเลย
    void setupNotifications((orderId) => {
      actions.setRole('customer');
      actions.openTicket(orderId);
    });
  }, []);

  // ชื่อแท็บเป็นตัวสำรองสำหรับคนที่ไม่ได้เปิดแจ้งเตือน หรือเปิดหลายแท็บบนคอม
  const ready = myActive(orders).find((o) => o.status === 'ready');
  const readyLabel = ready ? padQueueNo(ready.no) : '';
  useEffect(() => {
    document.title = readyLabel ? `🔔 คิว ${readyLabel} รับได้แล้ว` : BASE_TITLE;
  }, [readyLabel]);

  return (
    <>
      <div id="root">
        <RoleSwitch role={role} />
        {role === 'vendor' ? <VendorApp /> : <CustomerApp />}
      </div>
      <Toast message={toast} />
    </>
  );
}

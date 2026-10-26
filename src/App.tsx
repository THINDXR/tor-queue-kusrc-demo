import { useEffect } from 'react';
import { myActive } from './lib/queue';
import { setupNotifications } from './lib/notify';
import { actions, getState, listenOtherTabs, startClock, useStore } from './lib/store';
import { startSync } from './lib/sync';
import { padQueueNo } from './lib/thai';
import { StatusBar } from './components/StatusBar';
import { Toast } from './components/Toast';
import { Login } from './auth/Login';
import { CustomerApp } from './customer/CustomerApp';
import { VendorApp } from './vendor/VendorApp';

const BASE_TITLE = 'ต่อคิว — โรงอาหาร มก. ศรีราชา';

export function App() {
  const { session, role, toast, orders } = useStore();

  // นาฬิกาเดินวินาทีละครั้ง คอยยกเลิกคิวเงินสดที่ค้างและยิงแจ้งเตือนเตรียมตัว
  useEffect(() => startClock(), []);

  // ลูกค้ากับร้านเปิดคนละแท็บในเครื่องเดียวกัน — ออเดอร์ที่สั่งจะโผล่อีกฝั่งทันที
  useEffect(() => listenOtherTabs(), []);

  // คนละเครื่อง (มือถือลูกค้า ↔ เครื่องร้าน) เชื่อมผ่านที่เก็บกลางบน Vercel
  useEffect(() => startSync(), []);

  useEffect(() => {
    actions.syncNotifyPermission();
    // แตะการแจ้งเตือนแล้วเด้งกลับมาที่บัตรคิวใบนั้นเลย
    void setupNotifications((orderId) => {
      // เครื่องร้านค้าไม่ควรเด้งไปหน้าบัตรคิวของลูกค้า
      if (getState().session?.kind !== 'customer') return;
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

  // บนจอคอม ย่อกรอบ iPhone ให้พอดีความสูงจอ ปุ่มล่างสุดจะได้ไม่ตกขอบ
  useEffect(() => {
    const fit = () => {
      const scale = window.innerWidth >= 460 ? Math.min(1, (window.innerHeight - 48) / 852) : 1;
      document.documentElement.style.setProperty('--zoom', String(Math.max(0.6, scale)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // toast อยู่ในกรอบเครื่องด้วย ไม่ลอยออกไปนอกจอมือถือตอนพรีเซนต์บนคอม
  return (
    <div id="root">
      <StatusBar />
      {!session ? <Login /> : role === 'vendor' ? <VendorApp /> : <CustomerApp />}
      <Toast message={toast} />
    </div>
  );
}

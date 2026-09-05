/*
 * Service Worker ของต่อคิว
 *
 * มีหน้าที่เดียวตอนนี้: ทำให้การแจ้งเตือนทำงานได้ตอนลูกค้าไม่ได้เปิดหน้าแอปค้างไว้
 *
 * ทำไมต้องมี: บน Android Chrome การเรียก new Notification() จากหน้าเว็บตรง ๆ
 * ถูกบล็อก ต้องยิงผ่าน registration.showNotification() ของ service worker เท่านั้น
 * และบน iOS การแจ้งเตือนจะทำงานก็ต่อเมื่อผู้ใช้กด "เพิ่มไปยังหน้าโฮม" แล้วเท่านั้น
 * ซึ่งต้องมี service worker กับ manifest ครบถึงจะทำได้
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/** แตะการแจ้งเตือนแล้วให้เด้งกลับเข้าแอปที่บัตรคิวใบนั้นเลย */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const orderId = event.notification.data && event.notification.data.orderId;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({ type: 'open-ticket', orderId });
          return;
        }
      }
      await self.clients.openWindow('/');
    })(),
  );
});

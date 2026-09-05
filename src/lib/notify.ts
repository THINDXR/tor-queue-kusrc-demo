/**
 * การแจ้งเตือนฝั่งลูกค้า
 *
 * เป้าหมายคือลูกค้าต้องไปนั่งโต๊ะ เล่นแอปอื่น หรือปิดหน้าจอได้ โดยไม่พลาดคิว
 * ถ้ายังต้องคอยจ้องหน้าจอ แอปนี้ก็ไม่ได้แก้ปัญหาการยืนรออะไรเลย
 *
 * ยิงผ่าน service worker เป็นหลัก เพราะบน Android Chrome การเรียก
 * new Notification() จากหน้าเว็บตรง ๆ ถูกบล็อก และบน iOS ต้องเป็น PWA
 * ที่ติดตั้งไว้แล้วเท่านั้นถึงจะแจ้งเตือนได้
 */

export type NotifyPermission = 'unsupported' | 'default' | 'granted' | 'denied';

let registration: ServiceWorkerRegistration | null = null;

function hasNotificationApi(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function currentPermission(): NotifyPermission {
  if (!hasNotificationApi()) return 'unsupported';
  return Notification.permission;
}

/** ลงทะเบียน service worker และรับข้อความตอนผู้ใช้แตะการแจ้งเตือน */
export async function setupNotifications(onOpenTicket: (orderId: string) => void): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    registration = await navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as { type?: string; orderId?: string } | null;
      if (data?.type === 'open-ticket' && data.orderId) onOpenTicket(data.orderId);
    });
  } catch {
    // ไม่มี service worker ก็ยังแจ้งเตือนแบบธรรมดาได้บนเดสก์ท็อป
  }
}

export async function requestPermission(): Promise<NotifyPermission> {
  if (!hasNotificationApi()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return currentPermission();
  }
}

interface NotifyOptions {
  orderId?: string;
  /** true = ค้างไว้จนกว่าจะแตะ ใช้กับ "รับได้แล้ว" ที่พลาดไม่ได้ */
  sticky?: boolean;
}

export function notify(title: string, body: string, options: NotifyOptions = {}): void {
  if (currentPermission() !== 'granted') return;

  try {
    navigator.vibrate?.(options.sticky ? [220, 110, 220, 110, 220] : [180, 90, 180]);
  } catch {
    // เครื่องที่สั่นไม่ได้ก็ข้ามไป
  }

  // tag เดียวกันทำให้การแจ้งเตือนใบใหม่ทับใบเก่าของออเดอร์เดียวกัน
  // ลูกค้าจะไม่เจอ "อีก 2 คิว" ค้างอยู่ข้าง ๆ "รับได้แล้ว"
  const payload: NotificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'torqueue-' + (options.orderId ?? 'general'),
    data: { orderId: options.orderId },
    requireInteraction: options.sticky ?? false,
  };

  try {
    if (registration) void registration.showNotification(title, payload);
    else new Notification(title, payload);
  } catch {
    // Android Chrome จะโยน error ถ้าไม่มี service worker ปล่อยผ่าน
    // เพราะยังมีแบนเนอร์ในแอปกับชื่อแท็บที่เปลี่ยนเป็นตัวสำรองอยู่
  }
}

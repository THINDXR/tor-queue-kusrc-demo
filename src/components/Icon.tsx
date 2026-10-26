import type { JSX } from 'react';

export type IconName =
  | 'home' | 'ticket' | 'clock' | 'bell' | 'back' | 'next'
  | 'repeat' | 'warn' | 'info' | 'speaker' | 'cart' | 'spark'
  | 'user' | 'logout' | 'store' | 'lock' | 'pin' | 'shield'
  | 'search' | 'bolt' | 'qr' | 'cash' | 'plus' | 'minus' | 'heart' | 'edit' | 'trash';

/**
 * ไอคอนทั้งแอปอยู่ที่นี่ที่เดียว
 *
 * ของเดิมมีทั้ง emoji (🔔 ⚠ ℹ) และ SVG ที่ strokeWidth ไม่เท่ากัน (2 / 2.2 / 2.4)
 * พอวางเรียงกันแล้วน้ำหนักเส้นไม่เท่า และ emoji ก็ขึ้นกับฟอนต์ของเครื่อง
 * รวมมาเป็นชุดเดียว กริด 24 เส้นหนา 2 ปลายมน จะได้ดูเป็นชุดเดียวกันทุกจอ
 */
const PATHS: Record<IconName, JSX.Element> = {
  home: (
    <>
      <path d="M3.8 10.3 12 3.7l8.2 6.6v8.1a1.8 1.8 0 0 1-1.8 1.8H5.6a1.8 1.8 0 0 1-1.8-1.8Z" />
      <path d="M9.6 20.2v-5.6h4.8v5.6" />
    </>
  ),
  ticket: (
    <>
      <rect x="3.2" y="4.4" width="17.6" height="15.2" rx="3.2" />
      <path d="M7.4 9.4h9.2M7.4 14.6h5.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2v5.2l3.4 2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.2a6 6 0 1 0-12 0c0 5.6-2 6.8-2 6.8h16s-2-1.2-2-6.8" />
      <path d="M10.3 19.6a2 2 0 0 0 3.4 0" />
    </>
  ),
  back: <path d="M14.8 5.4 8.2 12l6.6 6.6" />,
  next: <path d="M9.2 5.4 15.8 12l-6.6 6.6" />,
  repeat: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 5v6h-6" />
    </>
  ),
  warn: (
    <>
      <path d="M10.6 4.3 3.2 17.4a1.6 1.6 0 0 0 1.4 2.4h14.8a1.6 1.6 0 0 0 1.4-2.4L13.4 4.3a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M12 9.6v4M12 16.6h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11.4v5M12 7.8h.01" />
    </>
  ),
  speaker: (
    <>
      <path d="M4.2 9.2h3.6l5-4v13.6l-5-4H4.2Z" />
      <path d="M16.6 8.6a5 5 0 0 1 0 6.8" />
    </>
  ),
  cart: (
    <>
      <path d="M3.4 5h2.3l2.2 9.6a1.8 1.8 0 0 0 1.8 1.4h7.4a1.8 1.8 0 0 0 1.7-1.3L20.6 8H6.4" />
      <circle cx="10" cy="19.4" r="1.3" />
      <circle cx="17.2" cy="19.4" r="1.3" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.4 13.7 9 19.4 10.7 13.7 12.4 12 18 10.3 12.4 4.6 10.7 10.3 9Z" />
      <path d="M18.4 16.2 19 18.2l2 .6-2 .6-.6 2-.6-2-2-.6 2-.6Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.4" r="4" />
      <path d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0" />
    </>
  ),
  logout: (
    <>
      <path d="M14.2 4.2H6.6a1.8 1.8 0 0 0-1.8 1.8v12a1.8 1.8 0 0 0 1.8 1.8h7.6" />
      <path d="M16.4 8.2 20.2 12l-3.8 3.8M20 12H10" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.4 5.4 4.6h13.2L20 9.4a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 9.4Z" />
      <path d="M5.4 12v7.4h13.2V12M10 19.4v-4.6h4v4.6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2.4" />
      <path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.6-5.6-6.6-11a6.6 6.6 0 0 1 13.2 0c0 5.4-6.6 11-6.6 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.4 19 6v5.6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  bolt: <path d="M13.2 3 5.6 13.4h5.6L10.8 21l7.6-10.4h-5.6Z" />,
  qr: (
    <>
      <rect x="3.8" y="3.8" width="6.4" height="6.4" rx="1.4" />
      <rect x="13.8" y="3.8" width="6.4" height="6.4" rx="1.4" />
      <rect x="3.8" y="13.8" width="6.4" height="6.4" rx="1.4" />
      <path d="M13.8 13.8h2.6v2.6M20.2 13.8v.01M13.8 20.2h.01M17 20.2h3.2V17" />
    </>
  ),
  cash: (
    <>
      <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="2.2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.2 9.4v.01M17.8 14.6v.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.8 11.4A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.6L17.5 7M10 11v5M14 11v5" />
    </>
  ),
  edit: (
    <>
      <path d="M4.5 19.5h4l10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16.5Z" />
      <path d="m14.2 7.8 3 3" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  heart: <path d="M12 20s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.6C19.6 15.4 12 20 12 20Z" />,
};

interface Props {
  name: IconName;
  size?: number;
  /** เส้นหนาขึ้นสำหรับไอคอนตัวเล็ก จะได้ไม่จางหายตอนย่อ */
  weight?: number;
  className?: string;
}

export function Icon({ name, size = 24, weight = 2, className }: Props) {
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

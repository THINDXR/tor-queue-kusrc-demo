import type { Stall } from '../lib/types';

interface Props {
  stall: Stall;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ป้ายเลขร้าน — ในโรงอาหารคนเรียกร้านด้วยเลข ("ไปร้าน 3 กัน")
 * จึงให้เลขเป็นตัวเด่นที่สุดของร้านทุกจุดในแอป ชื่อร้านเป็นแค่ตัวรอง
 */
export function StallBadge({ stall, size = 'md' }: Props) {
  return (
    <span className={'stallbadge ' + size} aria-label={'ร้าน ' + stall.no}>
      <small>ร้าน</small>
      <b className="num">{stall.no}</b>
    </span>
  );
}

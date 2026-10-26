import { identityOf } from '../lib/identity';
import { padQueueNo } from '../lib/thai';
import { Shape } from './Shape';

interface Props {
  no: number;
  /** คิวที่จบไปแล้วแสดงเป็นสีเทา */
  muted?: boolean;
}

/** ชิปเลขคิว — สี + รูปทรง + ตัวเลข ครบสามอย่างเสมอ ไม่ใช้สีอย่างเดียว */
export function QueueChip({ no, muted = false }: Props) {
  const id = identityOf(no);
  const bg = muted ? '#9CA3AF' : id.color;
  const fg = muted ? '#ffffff' : id.chipFg;

  return (
    <span className="qchip" style={{ background: bg, color: fg }}>
      <Shape shape={id.shape} size={13} color={fg} filled />
      {padQueueNo(no)}
    </span>
  );
}

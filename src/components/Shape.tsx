import type { ShapeName } from '../lib/identity';
import { SHAPE_PATHS } from '../lib/identity';

interface Props {
  shape: ShapeName;
  size: number;
  color: string;
  /** true = ทึบ, false = เส้นขอบ */
  filled?: boolean;
}

/** รูปทรงประจำบัตรคิว วาดเป็น SVG จึงคมทุกขนาดและเปลี่ยนสีได้ */
export function Shape({ shape, size, color, filled = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={2}
      strokeLinejoin="round"
    >
      <path d={SHAPE_PATHS[shape]} />
    </svg>
  );
}

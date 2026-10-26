import { useState, type CSSProperties } from 'react';

interface Props {
  emoji: string;
  /** รูปถ่ายจริง ถ้ามี — ถ้าโหลดไม่ขึ้นจะถอยไปใช้ภาพประกอบเอง ไม่ปล่อยเป็นกรอบแตก */
  img?: string;
  tint?: string;
  size?: number | string;
  radius?: number;
  className?: string;
  /** ชื่อเมนู ใช้เป็น alt ของรูปจริง */
  alt?: string;
}

/**
 * รูปอาหาร — ใช้รูปถ่ายจริงเมื่อร้านส่งมา ไม่งั้นเป็นภาพประกอบบนพื้นสีประจำร้าน
 * คนสแกนหาเมนูจากรูปได้เร็วกว่าอ่านชื่อ โดยเฉพาะตอนยืนหิวอยู่หน้าโรงอาหาร
 */
export function FoodArt({ emoji, img, tint = '#E3B23C', size = 72, radius = 16, className, alt = '' }: Props) {
  const [broken, setBroken] = useState(false);
  const style = {
    '--tint': tint,
    width: size,
    height: size,
    borderRadius: radius,
    fontSize: typeof size === 'number' ? Math.round(size * 0.52) : undefined,
  } as CSSProperties;

  return (
    <span className={className ? 'foodart ' + className : 'foodart'} style={style}>
      {img && !broken ? (
        <img src={img} alt={alt} loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <span className="fa-emoji" aria-hidden="true">{emoji}</span>
      )}
    </span>
  );
}

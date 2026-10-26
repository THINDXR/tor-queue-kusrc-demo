/** โลโก้มหาวิทยาลัยเกษตรศาสตร์ — ไฟล์จากผู้ใช้ อยู่ที่ public/ku-logo.png */
export function KuLogo({ height = 44 }: { height?: number }) {
  return <img className="kulogo" src="/ku-logo.png" alt="มหาวิทยาลัยเกษตรศาสตร์" height={height} width={Math.round(height * 267 / 360)} />;
}

/** ดอกนนทรี — ต้นไม้ประจำมหาวิทยาลัยเกษตรศาสตร์ ใช้เป็นลายตกแต่งเท่านั้น */
export function Nontri({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="12" cy="6.2" rx="3.4" ry="4.6" fill="#F5C518" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.8" fill="#E08A00" />
    </svg>
  );
}

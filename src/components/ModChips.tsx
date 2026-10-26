/** ระดับความเผ็ดมีสีและไอคอนของตัวเอง เหลือบดูก็รู้ว่าจานไหนเผ็ดแค่ไหน */
const SPICE: Record<string, { icon: string; tone: string }> = {
  'ไม่เผ็ด': { icon: '🍃', tone: 'mild' },
  'เผ็ดน้อย': { icon: '🌶️', tone: 'hot1' },
  'เผ็ดมาก': { icon: '🌶️🌶️', tone: 'hot2' },
};

export function spiceIcon(mod: string): string | undefined {
  return SPICE[mod]?.icon;
}

export function spiceTone(mod: string): string | undefined {
  return SPICE[mod]?.tone;
}

export function ModChips({ mods }: { mods: string[] }) {
  if (!mods.length) return <span className="mchips"><span className="mchip plain">😋 ปกติ</span></span>;
  return (
    <span className="mchips">
      {mods.map((m) => {
        const spice = SPICE[m];
        return (
          <span key={m} className={spice ? 'mchip ' + spice.tone : 'mchip'}>
            {spice && <span aria-hidden="true">{spice.icon}</span>}
            {m}
          </span>
        );
      })}
    </span>
  );
}

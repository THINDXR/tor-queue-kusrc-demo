import type { Role } from '../lib/types';
import { actions } from '../lib/store';

/** ปุ่มสลับบทบาทสำหรับเดโม วางมุมขวาบนเพื่อไม่ให้ทับแถบล่าง */
export function RoleSwitch({ role }: { role: Role }) {
  return (
    <div className="roleswitch">
      <button onClick={() => actions.setRole('customer')} aria-pressed={role === 'customer'}>
        ลูกค้า
      </button>
      <button onClick={() => actions.setRole('vendor')} aria-pressed={role === 'vendor'}>
        ร้านค้า
      </button>
    </div>
  );
}

import { actions } from '../lib/store';
import type { CustomerTab } from '../lib/types';
import { Icon, type IconName } from '../components/Icon';

const TABS: { key: CustomerTab; label: string; icon: IconName }[] = [
  { key: 'home', label: 'หน้าแรก', icon: 'home' },
  { key: 'mine', label: 'คิวของฉัน', icon: 'ticket' },
  { key: 'history', label: 'ประวัติ', icon: 'clock' },
  { key: 'account', label: 'บัญชี', icon: 'user' },
];

export function TabBar({ tab, activeCount }: { tab: CustomerTab; activeCount: number }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button key={t.key} onClick={() => actions.customerTab(t.key)} aria-current={tab === t.key}>
          {/* กล่องนี้เป็นหลักอ้างอิงของทั้งไฮไลต์และ badge จะได้ไม่ต้องเดาระยะเอง */}
          <span className="ticon">
            <Icon name={t.icon} size={23} />
            {t.key === 'mine' && activeCount > 0 && (
              <span className="badge num">{activeCount}</span>
            )}
          </span>
          <span className="tlabel">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

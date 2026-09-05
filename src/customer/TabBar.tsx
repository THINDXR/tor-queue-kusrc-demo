import { actions } from '../lib/store';
import type { CustomerTab } from '../lib/types';

const HOME = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5V21H3Z" />
  </svg>
);
const QUEUE = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 9h10M7 14h6" />
  </svg>
);
const HISTORY = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5.5l3.5 2" />
  </svg>
);

const TABS: { key: CustomerTab; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'หน้าแรก', icon: HOME },
  { key: 'mine', label: 'คิวของฉัน', icon: QUEUE },
  { key: 'history', label: 'ประวัติ', icon: HISTORY },
];

export function TabBar({ tab, activeCount }: { tab: CustomerTab; activeCount: number }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button key={t.key} onClick={() => actions.customerTab(t.key)} aria-current={tab === t.key}>
          {t.icon}
          <span>{t.label}</span>
          {t.key === 'mine' && activeCount > 0 && <span className="badge num">{activeCount}</span>}
        </button>
      ))}
    </nav>
  );
}

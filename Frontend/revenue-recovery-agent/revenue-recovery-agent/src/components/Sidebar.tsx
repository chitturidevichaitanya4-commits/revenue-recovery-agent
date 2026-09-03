import { useEffect, useState } from 'react';
import type { BackendStatus } from '../types';
import { ConnectionStatus } from './ConnectionStatus';

const NAV_ITEMS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Recovery Cases', href: '#recovery-cases' },
  { label: 'Transactions', href: '#transactions' },
  { label: 'AI Decisions', href: '#ai-engine' },
  { label: 'Recovery History', href: '#activity' },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function Sidebar({ status }: { status: BackendStatus }) {
  const active = useActiveSection(NAV_ITEMS.map((i) => i.href.slice(1)));

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-line-800 bg-ink-900 z-20">
      <div className="px-6 py-6 border-b border-line-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-sm border border-gold-500/40 bg-gold-500/10">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-400" fill="none">
              <path
                d="M4 16l4-8 4 5 4-9 4 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="font-display font-semibold text-sm leading-tight text-paper-100">
              Revenue Recovery
            </p>
            <p className="font-display font-semibold text-sm leading-tight text-paper-100">
              Agent
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href.slice(1);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'true' : undefined}
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'text-paper-100 bg-ink-800'
                  : 'text-paper-400 hover:text-paper-100 hover:bg-ink-800'
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full transition-colors ${
                  isActive ? 'bg-indigo-400' : 'bg-transparent'
                }`}
              />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-line-800">
        <p className="text-[11px] uppercase tracking-wider text-paper-600 mb-2 font-mono">
          Backend Status
        </p>
        <ConnectionStatus status={status} />
      </div>
    </aside>
  );
}

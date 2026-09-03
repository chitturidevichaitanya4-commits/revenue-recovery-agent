import type { BackendStatus } from '../types';

const COPY: Record<BackendStatus, { label: string; dot: string; text: string }> = {
  connected: { label: 'API Connected', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  connecting: { label: 'Connecting…', dot: 'bg-gold-400 animate-pulse', text: 'text-gold-400' },
  unreachable: { label: 'API Unreachable', dot: 'bg-rust-400', text: 'text-rust-400' },
};

export function ConnectionStatus({ status }: { status: BackendStatus }) {
  const c = COPY[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-mono ${c.text}`}>{c.label}</span>
    </div>
  );
}

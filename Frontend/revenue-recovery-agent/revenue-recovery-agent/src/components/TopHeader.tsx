import type { BackendStatus } from '../types';
import { ConnectionStatus } from './ConnectionStatus';

export function TopHeader({ status }: { status: BackendStatus }) {
  return (
    <header className="flex items-start justify-between gap-6 pb-8 border-b border-line-800">
      <div>
        <h1 className="font-display text-3xl md:text-[2.25rem] font-semibold text-paper-100 leading-tight">
          Revenue Recovery Intelligence
        </h1>
        <p className="mt-2 text-paper-400 max-w-xl">
          AI-powered detection, prioritization and recovery of failed payment revenue.
        </p>
      </div>
      <div className="hidden md:block rounded border border-line-800 bg-ink-900 px-4 py-3">
        <ConnectionStatus status={status} />
      </div>
    </header>
  );
}

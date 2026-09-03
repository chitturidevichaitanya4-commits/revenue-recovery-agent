import type { RecoveryCase } from '../types';
import { formatCurrency, formatLabel } from '../lib/format';
import { CaseStatusBadge, PlainBadge, PriorityBadge } from './StatusBadge';

interface Props {
  cases: RecoveryCase[];
  loading: boolean;
  onSelect: (c: RecoveryCase) => void;
}

const COLUMNS = [
  'Case ID',
  'Customer',
  'Amount',
  'Failure Reason',
  'AI Priority',
  'Decision',
  'Strategy',
  'Status',
];

export function RecoveryCasesTable({ cases, loading, onSelect }: Props) {
  return (
    <section id="recovery-cases" className="rounded border border-line-800 bg-ink-900 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line-800">
        <div>
          <h2 className="font-display text-lg font-semibold text-paper-100">Recovery Cases</h2>
          <p className="text-sm text-paper-400 mt-0.5">
            Every failed payment the agent is actively working, or has resolved.
          </p>
        </div>
        <span className="text-xs font-mono text-paper-600">{cases.length} cases</span>
      </div>

      {cases.some((c) => c.derived) && (
        <div className="px-6 py-2 border-b border-line-800 bg-ink-800/30">
          <p className="text-[11px] text-paper-600">
            <span className="font-mono border border-line-700 rounded-sm px-1 mr-1.5">est.</span>
            marks a value the dashboard estimated for display because the backend record didn't
            include it directly — not a genuine model prediction.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-800 text-left">
              {COLUMNS.map((col) => (
                <th key={col} className="px-6 py-3 text-xs font-medium text-paper-600 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.caseId}
                onClick={() => onSelect(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(c);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View recovery case ${c.caseId}`}
                className="border-b border-line-800 last:border-b-0 cursor-pointer hover:bg-ink-800/60 focus:bg-ink-800/60 focus:outline-none transition-colors"
              >
                <td className="px-6 py-3 font-mono text-xs text-indigo-300">{c.caseId}</td>
                <td className="px-6 py-3 text-paper-300">{c.customerId}</td>
                <td className="px-6 py-3 font-mono tabular text-paper-100">
                  {formatCurrency(c.amount)}
                </td>
                <td className="px-6 py-3">
                  <PlainBadge label={c.failureReason} />
                </td>
                <td className="px-6 py-3">
                  <PriorityBadge priority={c.priority} derived={c.derived} />
                </td>
                <td className="px-6 py-3 text-paper-400 whitespace-nowrap">
                  {formatLabel(c.decision)}
                </td>
                <td className="px-6 py-3 text-paper-400 whitespace-nowrap">
                  {formatLabel(c.strategy)}
                </td>
                <td className="px-6 py-3">
                  <CaseStatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {!loading && cases.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-10 text-center text-sm text-paper-600">
                  No recovery cases yet. They will appear here once /transactions returns data.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-10 text-center text-sm text-paper-600">
                  Loading transactions…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

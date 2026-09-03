import type { RecoveryCase } from '../types';
import { formatCurrency, formatLabel } from '../lib/format';

export function TransactionsTable({ cases, loading }: { cases: RecoveryCase[]; loading: boolean }) {
  const attempts = cases.flatMap((c) =>
    c.attempts.map((a) => ({ case: c, attempt: a }))
  );

  return (
    <section id="transactions" className="rounded border border-line-800 bg-ink-900 overflow-hidden">
      <div className="px-6 py-5 border-b border-line-800">
        <h2 className="font-display text-lg font-semibold text-paper-100">Payment Attempts</h2>
        <p className="text-sm text-paper-400 mt-0.5">
          Every attempt recorded by the backend, successful or failed.
        </p>
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-800 text-left sticky top-0 bg-ink-900">
              {['Case ID', 'Customer', 'Attempt', 'Amount', 'Outcome', 'Failure Reason'].map((h) => (
                <th key={h} className="px-6 py-3 text-xs font-medium text-paper-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attempts.map(({ case: c, attempt: a }) => (
              <tr key={`${c.caseId}-${a.attemptNumber}`} className="border-b border-line-800 last:border-b-0">
                <td className="px-6 py-3 font-mono text-xs text-indigo-300">{c.caseId}</td>
                <td className="px-6 py-3 text-paper-300">{c.customerId}</td>
                <td className="px-6 py-3 font-mono tabular text-paper-400">{a.attemptNumber}</td>
                <td className="px-6 py-3 font-mono tabular text-paper-100">{formatCurrency(c.amount)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs font-mono font-medium ${
                      a.outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rust-400'
                    }`}
                  >
                    {a.outcome}
                  </span>
                </td>
                <td className="px-6 py-3 text-paper-400">
                  {a.failureReason ? formatLabel(a.failureReason) : '—'}
                </td>
              </tr>
            ))}
            {!loading && attempts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-paper-600">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

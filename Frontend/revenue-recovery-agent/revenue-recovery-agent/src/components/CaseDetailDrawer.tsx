import { useEffect, type ReactNode } from 'react';
import type { RecoveryCase } from '../types';
import { formatCurrency, formatLabel } from '../lib/format';
import { CaseStatusBadge, ExecutionBadge, PriorityBadge } from './StatusBadge';

const DECISION_REASON: Record<string, string> = {
  WAIT_FOR_FUNDS: 'The customer has insufficient balance right now; retrying immediately would fail again.',
  CUSTOMER_ACTION_REQUIRED: 'OTP verification failed and needs the customer to re-authenticate.',
  RETRY_LATER: 'The bank timed out; a scheduled retry is likely to succeed without customer input.',
  UPDATE_PAYMENT_METHOD: 'The card has expired and cannot be charged until it is replaced.',
  PAYMENT_SUCCESS: 'The payment completed successfully on this attempt.',
};

const RECOMMENDED_ACTION: Record<string, string> = {
  WAIT_FOR_FUNDS: 'Re-attempt once balance signals improve.',
  CUSTOMER_ACTION_REQUIRED: 'Prompt the customer to complete OTP verification.',
  RETRY_LATER: 'Schedule an automatic retry.',
  UPDATE_PAYMENT_METHOD: 'Ask the customer to update their payment method.',
  PAYMENT_SUCCESS: 'None — case is closed.',
};

const NEXT_STEP: Record<string, string> = {
  WAITING: 'Monitor balance and retry automatically.',
  ACTION_REQUIRED: 'Awaiting customer input.',
  SCHEDULED: 'Retry queued for the next attempt window.',
  COMPLETED: 'No further action needed.',
};

const URGENCY_LABEL: Record<string, string> = {
  HIGH: 'IMMEDIATE',
  MEDIUM: 'SOON',
  LOW: 'WHEN CONVENIENT',
};

// The factors the model was documented to take as input. Shown as "what the
// model considered" rather than per-case feature importances, since the
// dashboard has no access to the model's internal weighting.
const MODEL_FACTORS = [
  'Payment amount',
  'Available balance',
  'Failure reason',
  'Payment method',
  'Attempt number',
];

interface Props {
  recoveryCase: RecoveryCase | null;
  onClose: () => void;
}

export function CaseDetailDrawer({ recoveryCase: c, onClose }: Props) {
  useEffect(() => {
    if (!c) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [c, onClose]);

  if (!c) return null;

  const recovered = c.status === 'RECOVERED';
  const successAttempt = c.attempts.find((a) => a.outcome === 'SUCCESS');

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label={`Recovery case ${c.caseId}`}>
      <button
        aria-label="Close case detail"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
      />
      <div className="relative w-full max-w-lg h-full bg-ink-900 border-l border-line-800 overflow-y-auto shadow-2xl animate-[slideIn_220ms_ease-out]">
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn { from { transform: translateX(24px); opacity: 0.6 } to { transform: translateX(0); opacity: 1 } }
        `}</style>

        <div className="sticky top-0 bg-ink-900 border-b border-line-800 px-6 py-5 z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-mono tracking-wide text-paper-600 mb-1">RECOVERY CASE</p>
              <p className="font-mono text-base text-indigo-300 mb-2">{c.caseId}</p>
            </div>
            <button onClick={onClose} className="text-paper-500 hover:text-paper-100 transition-colors" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <span className="text-paper-400">{c.customerId}</span>
            <span className="font-mono tabular text-paper-100">{formatCurrency(c.amount)}</span>
            {c.paymentMethod && <span className="text-paper-400">{c.paymentMethod}</span>}
            <CaseStatusBadge status={c.status} />
          </div>
        </div>

        <div className="px-6 py-6 space-y-7">
          <section>
            <SectionHeader dot="bg-indigo-400" title="AI Decision" caption="The model" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-3">
              <Field label="Priority" value={<PriorityBadge priority={c.priority} derived={c.derived} />} />
              <Field label="Urgency" value={URGENCY_LABEL[c.priority] ?? formatLabel(c.priority)} />
            </div>
            <p className="text-xs text-paper-600 mt-4 mb-2">Why this case was scored this way</p>
            <ul className="space-y-1.5">
              {MODEL_FACTORS.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-paper-400">
                  <span className="h-1 w-1 rounded-full bg-indigo-400/70 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {c.derived && (
              <p className="mt-3 text-[11px] text-paper-600 leading-relaxed border-t border-line-800 pt-3">
                This case's priority wasn't included directly in the backend record — it's
                estimated here for display, not a genuine model output.
              </p>
            )}
          </section>

          <section>
            <SectionHeader dot="bg-gold-400" title="Recovery Agent" caption="The decision-maker" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-3">
              <Field label="Decision" value={formatLabel(c.decision)} />
              <Field label="Strategy" value={formatLabel(c.strategy)} />
              <Field label="Reason" value={DECISION_REASON[c.decision] ?? '—'} full />
            </div>
          </section>

          <section>
            <SectionHeader dot="bg-emerald-400" title="Recovery Executor" caption="The workflow runner" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-3">
              <Field label="Execution Status" value={<ExecutionBadge status={c.executionStatus} />} />
              <Field label="Execution Action" value={formatLabel(c.decision)} />
              <Field label="Next Step" value={NEXT_STEP[c.executionStatus] ?? RECOMMENDED_ACTION[c.decision] ?? '—'} full />
            </div>
          </section>

          <section>
            <SectionHeader dot="bg-paper-500" title="Attempt History" />
            <ol className="mt-3">
              {c.attempts.map((a, i) => (
                <li key={a.attemptNumber}>
                  <div
                    className={`rounded-sm border px-4 py-3 ${
                      a.outcome === 'SUCCESS'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-line-800 bg-ink-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-paper-500">Attempt {a.attemptNumber}</span>
                      <span
                        className={`text-xs font-mono font-medium ${
                          a.outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rust-400'
                        }`}
                      >
                        {a.outcome}
                      </span>
                    </div>
                    {a.outcome === 'SUCCESS' ? (
                      <p className="text-sm text-paper-300">
                        Revenue recovered{a.amountRecovered ? `: ${formatCurrency(a.amountRecovered)}` : ''}.
                      </p>
                    ) : (
                      <p className="text-sm text-paper-300">
                        {formatLabel(a.failureReason ?? 'UNKNOWN')}
                        {a.decision ? ` → ${formatLabel(a.decision)}` : ''}
                        {a.executionStatus ? ` → ${formatLabel(a.executionStatus)}` : ''}
                      </p>
                    )}
                  </div>
                  {i < c.attempts.length - 1 && (
                    <div className="flex justify-center py-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-line-700">
                        <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section>
            {recovered ? (
              <div className="rounded border border-emerald-500/30 bg-emerald-500/[0.06] px-5 py-4 text-center">
                <p className="text-[11px] font-mono tracking-wide text-emerald-400 mb-1">REVENUE IMPACT</p>
                <p className="font-mono tabular text-2xl font-semibold text-emerald-400">
                  {formatCurrency(successAttempt?.amountRecovered ?? c.amount)} recovered
                </p>
              </div>
            ) : (
              <div className="rounded border border-gold-500/30 bg-gold-500/[0.06] px-5 py-4">
                <p className="text-[11px] font-mono tracking-wide text-gold-400 mb-1">STILL AT RISK</p>
                <p className="text-sm text-paper-200">
                  <span className="font-mono tabular font-semibold text-gold-400">
                    {formatCurrency(c.amount)}
                  </span>{' '}
                  pending — next step: {NEXT_STEP[c.executionStatus] ?? 'awaiting recovery workflow'}.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ dot, title, caption }: { dot: string; title: string; caption?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <h3 className="text-sm font-display font-semibold text-paper-100">{title}</h3>
      {caption && <span className="text-[11px] text-paper-600">— {caption}</span>}
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <dt className="text-xs text-paper-600 mb-0.5">{label}</dt>
      <dd className="text-sm text-paper-100">{value}</dd>
    </div>
  );
}

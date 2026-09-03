import type { RecoveryCase } from '../types';
import { formatLabel } from '../lib/format';

interface Event {
  id: string;
  label: string;
  detail: string;
  tone: 'rust' | 'indigo' | 'gold' | 'emerald' | 'neutral';
  createdAt?: string;
}

const TONE_DOT: Record<Event['tone'], string> = {
  rust: 'bg-rust-400',
  indigo: 'bg-indigo-400',
  gold: 'bg-gold-400',
  emerald: 'bg-emerald-400',
  neutral: 'bg-paper-500',
};

function formatTimestamp(value?: string) {
  if (!value) return 'Time unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function eventsForCase(c: RecoveryCase): Event[] {
  const firstAttempt = c.attempts[0];

  const successAttempt = c.attempts.find(
    (attempt) => attempt.outcome === 'SUCCESS'
  );

  const events: Event[] = [
    {
      id: `${c.caseId}-failed`,
      label: 'Payment failed',
      detail: formatLabel(c.failureReason),
      tone: 'rust',
      createdAt: firstAttempt?.createdAt ?? c.createdAt,
    },
    {
      id: `${c.caseId}-priority`,
      label: 'AI priority assigned',
      detail: `${c.priority}${c.derived ? ' (estimated)' : ''}`,
      tone: 'indigo',
      createdAt: firstAttempt?.createdAt ?? c.createdAt,
    },
    {
      id: `${c.caseId}-decision`,
      label: 'Recovery decision selected',
      detail: formatLabel(c.decision),
      tone: 'gold',
      createdAt: firstAttempt?.createdAt ?? c.createdAt,
    },
    {
      id: `${c.caseId}-executed`,
      label: 'Recovery action executed',
      detail: formatLabel(
        firstAttempt?.executionStatus ?? c.executionStatus
      ),
      tone: 'gold',
      createdAt: firstAttempt?.createdAt ?? c.createdAt,
    },
  ];

  if (c.status === 'RECOVERED') {
    events.push(
      {
        id: `${c.caseId}-retry`,
        label: 'Payment retry succeeded',
        detail: 'Recovery workflow completed',
        tone: 'emerald',
        createdAt: successAttempt?.createdAt ?? c.createdAt,
      },
      {
        id: `${c.caseId}-recovered`,
        label: 'Revenue recovered',
        detail: c.caseId,
        tone: 'emerald',
        createdAt: successAttempt?.createdAt ?? c.createdAt,
      }
    );
  }

  return events;
}

export function ActivityFeed({ cases }: { cases: RecoveryCase[] }) {
  // Newest recovery cases first.
  const ordered = [...cases].sort((a, b) => {
    const aTime = a.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;

    const bTime = b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return bTime - aTime;
  });

  const items = ordered
    .slice(0, 5)
    .flatMap((c) =>
      eventsForCase(c).map((e) => ({
        ...e,
        caseId: c.caseId,
      }))
    );

  return (
    <section
      id="activity"
      className="rounded border border-line-800 bg-ink-900 p-6"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-lg font-semibold text-paper-100">
          Recent Recovery Activity
        </h2>

        <span className="text-[11px] text-paper-600">
          Backend event timeline
        </span>
      </div>

      <p className="text-sm text-paper-400 mb-5">
        The full event chain the agent walked through for each case,
        most recent cases first.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-paper-600">
          No recovery activity yet.
        </p>
      ) : (
        <ol className="relative border-l border-line-800 ml-2 space-y-4">
          {items.map((e) => (
            <li key={e.id} className="pl-5 relative">
              <span
                className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-ink-900 ${TONE_DOT[e.tone]}`}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-paper-100">
                  {e.label}
                </p>

                <span className="text-[11px] font-mono text-indigo-300">
                  {e.caseId}
                </span>

                <span className="text-[11px] text-paper-600">
                  {formatTimestamp(e.createdAt)}
                </span>
              </div>

              <p className="text-sm text-paper-400 mt-0.5">
                {e.detail}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}


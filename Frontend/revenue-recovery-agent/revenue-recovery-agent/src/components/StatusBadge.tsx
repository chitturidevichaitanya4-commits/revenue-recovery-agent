import { formatLabel } from '../lib/format';

type Tone = 'gold' | 'emerald' | 'indigo' | 'rust' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  gold: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  rust: 'bg-rust-500/10 text-rust-400 border-rust-500/30',
  neutral: 'bg-paper-100/5 text-paper-400 border-line-700',
};

const PRIORITY_TONE: Record<string, Tone> = {
  HIGH: 'rust',
  MEDIUM: 'gold',
  LOW: 'neutral',
};

const CASE_STATUS_TONE: Record<string, Tone> = {
  RECOVERED: 'emerald',
  OPEN: 'gold',
};

const EXECUTION_TONE: Record<string, Tone> = {
  COMPLETED: 'emerald',
  WAITING: 'gold',
  SCHEDULED: 'indigo',
  ACTION_REQUIRED: 'rust',
};

function badge(label: string, tone: Tone) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide font-mono ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({
  priority,
  derived,
}: {
  priority: string;
  derived?: boolean;
}) {
  // Successful payments do not need an AI recovery priority.
  // Display a neutral dash instead of showing LOW or LOW est.
  if (priority === 'NONE') {
    return (
      <span className="text-paper-600 font-mono text-xs">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {badge(priority, PRIORITY_TONE[priority] ?? 'neutral')}

      {derived && (
        <span
          title="Not directly supplied by the backend for this record — estimated by the dashboard's display layer for readability."
          className="text-[10px] font-mono text-paper-600 border border-line-700 rounded-sm px-1 leading-4 cursor-help"
        >
          est.
        </span>
      )}
    </span>
  );
}

export function CaseStatusBadge({ status }: { status: string }) {
  return badge(status, CASE_STATUS_TONE[status] ?? 'neutral');
}

export function ExecutionBadge({ status }: { status: string }) {
  return badge(formatLabel(status), EXECUTION_TONE[status] ?? 'neutral');
}

export function PlainBadge({ label }: { label: string }) {
  return badge(formatLabel(label), 'neutral');
}
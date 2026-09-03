import { useEffect, useRef, useState } from 'react';

const STAGES = [
  {
    key: 'failed',
    title: 'Failed Payment',
    detail: 'A payment attempt fails and is captured with its failure reason.',
    icon: <path d="M6 6l12 12M18 6L6 18" />,
    color: 'text-rust-400 border-rust-500/40 bg-rust-500/10',
  },
  {
    key: 'priority',
    title: 'AI Priority',
    detail: 'The Random Forest model scores the case as HIGH, MEDIUM, or LOW priority.',
    icon: (
      <path d="M12 3v6m0 12v-6m9-3h-6M9 12H3m14.5-6.5l-4.2 4.2m-4.6 4.6l-4.2 4.2m0-13l4.2 4.2m4.6 4.6l4.2 4.2" />
    ),
    color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
  },
  {
    key: 'decision',
    title: 'Recovery Decision',
    detail: 'The recovery agent turns priority and failure reason into a decision.',
    icon: <path d="M4 12l5 5L20 6" />,
    color: 'text-gold-400 border-gold-500/40 bg-gold-500/10',
  },
  {
    key: 'executor',
    title: 'Recovery Executor',
    detail: 'The executor sequences and carries out the chosen recovery workflow.',
    icon: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
  {
    key: 'action',
    title: 'Recovery Action',
    detail: 'The system retries automatically, waits, or asks the customer to act.',
    icon: (
      <path d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5.3M20 14a8 8 0 01-14 5.3" />
    ),
    color: 'text-gold-400 border-gold-500/40 bg-gold-500/10',
  },
  {
    key: 'recovered',
    title: 'Revenue Recovered',
    detail: 'On success, the payment completes and revenue is marked recovered.',
    icon: <path d="M5 13l4 4L19 7" />,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
];

const AUTO_ADVANCE_MS = 2400;

export function RecoveryPipeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const activeStage = STAGES[active];

  return (
    <section className="rounded border border-line-800 bg-ink-900 p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-lg font-semibold text-paper-100">Recovery Pipeline</h2>
        <span className="text-[11px] font-mono text-paper-600">
          {String(active + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
        </span>
      </div>
      <p className="text-sm text-paper-400 mb-6">
        How a failed payment moves from detection to recovered revenue.
      </p>

      <div
        className="flex flex-wrap items-center gap-1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center">
            <button
              onMouseEnter={() => setActive(i)}
              onFocus={() => {
                setPaused(true);
                setActive(i);
              }}
              onBlur={() => setPaused(false)}
              className={`group flex flex-col items-center gap-2 rounded-sm px-3 py-3 w-[104px] border transition-all duration-300 ${
                active === i
                  ? `${stage.color} scale-[1.03]`
                  : 'border-line-800 bg-ink-800/60 text-paper-500 hover:border-line-700'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                {stage.icon}
              </svg>
              <span className="text-[11px] leading-tight text-center font-medium">
                {stage.title}
              </span>
            </button>
            {i < STAGES.length - 1 && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className={`h-4 w-4 mx-1 shrink-0 transition-colors duration-300 ${
                  active > i ? 'text-line-700' : 'text-line-800'
                }`}>
                <path d="M9 6l6 6-6 6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 pt-4 border-t border-line-800 text-sm text-paper-400" aria-live="polite">
        <span className="text-paper-100 font-medium">{activeStage.title}.</span>{' '}
        {activeStage.detail}
      </p>
    </section>
  );
}

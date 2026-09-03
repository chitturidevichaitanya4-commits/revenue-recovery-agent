import type { Analytics } from '../types';

const INPUTS = [
  'Payment Amount',
  'Available Balance',
  'Failure Reason',
  'Payment Method',
  'Attempt Number',
];

const LAYERS = [
  {
    key: 'model',
    tag: 'AI MODEL',
    question: '"What should be prioritized?"',
    detail: 'Random Forest Classifier scores each failed payment HIGH, MEDIUM, or LOW.',
    color: 'text-indigo-300',
    ring: 'border-indigo-500/40',
    icon: (
      <path d="M12 3v6m0 12v-6m9-3h-6M9 12H3m14.5-6.5l-4.2 4.2m-4.6 4.6l-4.2 4.2m0-13l4.2 4.2m4.6 4.6l4.2 4.2" />
    ),
  },
  {
    key: 'agent',
    tag: 'RECOVERY AGENT',
    question: '"What should we do?"',
    detail: 'Priority and failure reason are turned into a concrete recovery decision.',
    color: 'text-gold-400',
    ring: 'border-gold-500/40',
    icon: <path d="M4 12l5 5L20 6" />,
  },
  {
    key: 'executor',
    tag: 'RECOVERY EXECUTOR',
    question: '"Execute the selected recovery workflow."',
    detail: 'The decision is carried out: retry, wait, or ask the customer to act.',
    color: 'text-emerald-400',
    ring: 'border-emerald-500/40',
    icon: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  },
];

export function AiEngineSection({ data }: { data: Analytics | null }) {
  const total = data ? data.high_priority + data.medium_priority + data.low_priority : 0;
  const priorities = data
    ? [
        { label: 'HIGH', value: data.high_priority, color: 'bg-rust-500', text: 'text-rust-400' },
        { label: 'MEDIUM', value: data.medium_priority, color: 'bg-gold-500', text: 'text-gold-400' },
        { label: 'LOW', value: data.low_priority, color: 'bg-paper-500', text: 'text-paper-400' },
      ]
    : [];

  return (
    <section id="ai-engine" className="rounded border border-indigo-500/25 bg-ink-900 overflow-hidden">
      {/* Hero strip: the three-layer architecture */}
      <div className="px-6 pt-6 pb-2 md:px-8 md:pt-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <p className="text-xs font-mono tracking-wide text-indigo-300">AI RECOVERY ENGINE</p>
        </div>
        <h2 className="font-display text-2xl font-semibold text-paper-100 mb-1">
          Three systems, one recovery decision
        </h2>
        <p className="text-sm text-paper-400 max-w-2xl mb-6">
          The model, the agent, and the executor are separate systems with separate jobs — the
          model never decides what to do, and the executor never decides what matters.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          {LAYERS.map((layer, i) => (
            <div key={layer.key} className="flex items-center flex-1 gap-2">
              <div
                className={`flex-1 rounded border ${layer.ring} bg-ink-800/60 px-4 py-4 min-w-0 transition-colors hover:bg-ink-800`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 shrink-0 ${layer.color}`}>
                    {layer.icon}
                  </svg>
                  <p className={`text-[11px] font-mono font-semibold tracking-wide ${layer.color}`}>
                    {layer.tag}
                  </p>
                </div>
                <p className="text-sm text-paper-100 font-medium mb-1">{layer.question}</p>
                <p className="text-xs text-paper-500 leading-relaxed">{layer.detail}</p>
              </div>
              {i < LAYERS.length - 1 && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="hidden md:block h-4 w-4 text-line-700 shrink-0">
                  <path d="M9 6l6 6-6 6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Model detail + priority distribution */}
      <div className="grid md:grid-cols-5 border-t border-line-800">
        <div className="md:col-span-3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-line-800">
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <p className="text-xs text-paper-600 mb-1">Model</p>
              <p className="text-sm font-medium text-paper-100">Random Forest Classifier</p>
            </div>
            <div>
              <p className="text-xs text-paper-600 mb-1">Purpose</p>
              <p className="text-sm font-medium text-paper-100">Recovery Priority Prediction</p>
            </div>
          </div>

          <p className="text-xs text-paper-600 mb-2">Inputs</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {INPUTS.map((f) => (
              <span
                key={f}
                className="rounded-sm border border-line-700 bg-ink-800 px-2.5 py-1 text-[11px] font-mono text-paper-400"
              >
                {f}
              </span>
            ))}
          </div>

          <p className="text-xs text-paper-600 mb-1">Output</p>
          <p className="text-sm font-medium text-paper-100 mb-6">HIGH / MEDIUM / LOW</p>

          <div className="rounded-sm border border-line-800 bg-ink-800/40 px-4 py-3">
            <p className="text-xs text-paper-500 leading-relaxed">
              <span className="text-indigo-300 font-mono font-medium">100% accuracy</span> on the
              current 60-example test split, evaluated on a synthetic 300-example training
              dataset. This reflects the current test split, not a production-grade
              generalization claim.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 p-6 md:p-8">
          <p className="text-xs text-paper-600 mb-4">Priority Distribution</p>
          <div className="space-y-4">
            {priorities.map((p) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={`text-xs font-mono font-medium ${p.text}`}>{p.label}</span>
                  <span className="text-sm font-mono tabular text-paper-100">{p.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.color} transition-all duration-500`}
                    style={{ width: total > 0 ? `${(p.value / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            {!data && (
              <div className="space-y-3" aria-live="polite">
                <div className="h-2 w-full rounded-full bg-ink-700 animate-pulse" />
                <div className="h-2 w-2/3 rounded-full bg-ink-700 animate-pulse" />
                <div className="h-2 w-1/3 rounded-full bg-ink-700 animate-pulse" />
              </div>
            )}
          </div>
          <p className="mt-5 text-[11px] text-paper-600 leading-relaxed">
            Reflects live counts from <span className="font-mono">/analytics</span>. Zero values
            are shown as reported — never adjusted for appearance.
          </p>
        </div>
      </div>
    </section>
  );
}

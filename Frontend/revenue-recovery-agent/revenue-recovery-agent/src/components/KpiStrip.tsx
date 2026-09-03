import type { Analytics } from '../types';
import { formatCurrency, formatPercent } from '../lib/format';

export function KpiStrip({ data }: { data: Analytics | null }) {
  const secondary = [
    { label: 'Failed Payments', value: data ? String(data.failed_payments) : '—', sub: data ? `of ${data.total_attempts} attempts` : undefined },
    { label: 'Recovered Cases', value: data ? String(data.recovered_cases) : '—', sub: data ? `of ${data.total_recovery_cases} cases` : undefined },
    { label: 'Open Cases', value: data ? String(data.open_cases) : '—', sub: data ? `${data.total_customers} customers` : undefined },
  ];

  return (
    <section className="rounded border border-line-800 bg-ink-900 overflow-hidden">
      {/* Featured: business impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line-800">
        <div className="px-6 py-6">
          <p className="text-xs text-paper-500 mb-2">Revenue at Risk</p>
          <p className="font-mono tabular text-3xl md:text-[2.15rem] font-semibold text-gold-400 leading-none">
            {data ? formatCurrency(data.revenue_at_risk) : '—'}
          </p>
          <p className="mt-2 text-xs text-paper-600">
  {data
    ? `${formatCurrency(data.revenue_recovered)} recovered of ${formatCurrency(
        data.revenue_recovered + data.revenue_at_risk
      )} opportunity`
    : 'Waiting on backend…'}
</p>
        </div>
        <div className="px-6 py-6">
          <p className="text-xs text-paper-500 mb-2">Revenue Recovered</p>
          <p className="font-mono tabular text-3xl md:text-[2.15rem] font-semibold text-emerald-400 leading-none">
            {data ? formatCurrency(data.revenue_recovered) : '—'}
          </p>
          <p className="mt-2 text-xs text-paper-600">
            {data ? `${data.recovered_cases} of ${data.total_recovery_cases} cases` : 'Waiting on backend…'}
          </p>
        </div>
        <div className="px-6 py-6">
          <p className="text-xs text-paper-500 mb-2">Recovery Rate</p>
          <div className="flex items-end gap-4">
            <p className="font-mono tabular text-3xl md:text-[2.15rem] font-semibold text-paper-100 leading-none">
              {data ? formatPercent(data.recovery_rate) : '—'}
            </p>
            <div className="flex-1 pb-1.5">
              <div className="h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(data?.recovery_rate ?? 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary: operational counts */}
      <div className="grid grid-cols-3 border-t border-line-800 bg-ink-800/40">
        {secondary.map((m, i) => (
          <div
            key={m.label}
            className={`px-6 py-4 ${i < secondary.length - 1 ? 'border-r border-line-800' : ''}`}
          >
            <p className="text-[11px] text-paper-600 mb-1">{m.label}</p>
            <p className="font-mono tabular text-lg font-medium text-paper-100">{m.value}</p>
            {m.sub && <p className="text-[11px] text-paper-600 mt-0.5">{m.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

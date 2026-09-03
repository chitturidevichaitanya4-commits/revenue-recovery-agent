import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Analytics } from '../types';
import { formatCurrency } from '../lib/format';

export function RevenueChart({ data }: { data: Analytics | null }) {
  const rows = data
    ? [
        { name: 'Revenue Recovered', value: data.revenue_recovered, color: '#37B478' },
        { name: 'Revenue at Risk', value: data.revenue_at_risk, color: '#E8A33D' },
      ]
    : [];

  return (
    <div className="rounded border border-line-800 bg-ink-900 p-6">
      <h3 className="font-display text-base font-semibold text-paper-100 mb-1">
        Recovered vs. At Risk
      </h3>
      <p className="text-sm text-paper-400 mb-4">Live totals from the analytics endpoint.</p>
      <div className="h-56">
        {data ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#232D38" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                stroke="#6B7686"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#232D38' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9BA5B4"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  background: '#141B22',
                  border: '1px solid #232D38',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#E9ECF1',
                }}
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={28}>
                {rows.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-paper-600">
            Waiting on backend…
          </div>
        )}
      </div>
    </div>
  );
}

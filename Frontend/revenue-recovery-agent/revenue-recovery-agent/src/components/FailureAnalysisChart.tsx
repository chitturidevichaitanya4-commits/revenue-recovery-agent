import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RecoveryCase } from '../types';
import { formatLabel } from '../lib/format';

export function FailureAnalysisChart({ cases }: { cases: RecoveryCase[] }) {
  const counts = new Map<string, number>();
  cases.forEach((c) => {
    if (c.failureReason.toUpperCase() === 'SUCCESS') return;
    const key = c.failureReason.toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const rows = Array.from(counts.entries())
    .map(([reason, count]) => ({ reason: formatLabel(reason), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded border border-line-800 bg-ink-900 p-6">
      <h3 className="font-display text-base font-semibold text-paper-100 mb-1">
        Failure Reason Distribution
      </h3>
      <p className="text-sm text-paper-400 mb-4">
        What kinds of payment failures the agent is handling.
      </p>
      <div className="h-56">
        {rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#232D38" />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke="#6B7686"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#232D38' }}
              />
              <YAxis
                type="category"
                dataKey="reason"
                stroke="#9BA5B4"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  background: '#141B22',
                  border: '1px solid #232D38',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#E9ECF1',
                }}
              />
              <Bar dataKey="count" fill="#7B8CF4" radius={[0, 3, 3, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-paper-600">
            Waiting on transaction data…
          </div>
        )}
      </div>
    </div>
  );
}

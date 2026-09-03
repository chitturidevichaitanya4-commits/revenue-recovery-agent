import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { KpiStrip } from './components/KpiStrip';
import { AiEngineSection } from './components/AiEngineSection';
import { RecoveryPipeline } from './components/RecoveryPipeline';
import { RecoveryCasesTable } from './components/RecoveryCasesTable';
import { CaseDetailDrawer } from './components/CaseDetailDrawer';
import { RevenueChart } from './components/RevenueChart';
import { FailureAnalysisChart } from './components/FailureAnalysisChart';
import { ActivityFeed } from './components/ActivityFeed';
import { TransactionsTable } from './components/TransactionsTable';
import { useAnalytics } from './hooks/useAnalytics';
import { useRecoveryCases } from './hooks/useTransactions';
import type { RecoveryCase } from './types';

export default function App() {
  const { data: analytics, status, error: analyticsError } = useAnalytics();
  const { cases, loading, error: casesError } = useRecoveryCases();
  const [selected, setSelected] = useState<RecoveryCase | null>(null);

  return (
    <div className="min-h-screen bg-ink-950 grain-grid">
      <Sidebar status={status} />

      <main className="lg:pl-60">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-10">
          <TopHeader status={status} />

          {status === 'unreachable' && (
            <div
              role="alert"
              className="rounded border border-rust-500/30 bg-rust-500/[0.06] px-5 py-3.5 flex items-start gap-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rust-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-rust-400">Backend unreachable</p>
                <p className="text-xs text-paper-500 mt-0.5">
                  Live figures can't be shown right now
                  {analyticsError ? ` (${analyticsError})` : ''}. Retrying automatically — start
                  the FastAPI backend on <span className="font-mono">127.0.0.1:8000</span> if it
                  isn't running.
                </p>
              </div>
            </div>
          )}

          {casesError && status !== 'unreachable' && (
            <div
              role="alert"
              className="rounded border border-gold-500/30 bg-gold-500/[0.06] px-5 py-3.5 text-xs text-paper-500"
            >
              Couldn't load transactions ({casesError}). Retrying automatically.
            </div>
          )}

          <section id="overview" className="space-y-10">
            <KpiStrip data={analytics} />
            <AiEngineSection data={analytics} />
            <RecoveryPipeline />
          </section>

          <RecoveryCasesTable cases={cases} loading={loading} onSelect={setSelected} />

          <div className="grid md:grid-cols-2 gap-6">
            <RevenueChart data={analytics} />
            <FailureAnalysisChart cases={cases} />
          </div>

          <TransactionsTable cases={cases} loading={loading} />

          <ActivityFeed cases={cases} />

          <footer className="pt-4 pb-10 text-xs text-paper-600 border-t border-line-800">
            Revenue Recovery Agent — data sourced live from the FastAPI backend at{' '}
            <span className="font-mono">/analytics</span> and{' '}
            <span className="font-mono">/transactions</span>.
          </footer>
        </div>
      </main>

      <CaseDetailDrawer recoveryCase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

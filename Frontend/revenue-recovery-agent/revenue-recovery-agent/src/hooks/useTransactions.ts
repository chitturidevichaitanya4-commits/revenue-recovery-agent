import { useEffect, useState } from 'react';
import { fetchTransactions } from '../lib/api';
import { groupIntoCases } from '../lib/normalize';
import type { RecoveryCase } from '../types';

const POLL_MS = 15_000;

export function useRecoveryCases() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await fetchTransactions();
        if (cancelled) return;
        setCases(groupIntoCases(rows));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { cases, loading, error };
}

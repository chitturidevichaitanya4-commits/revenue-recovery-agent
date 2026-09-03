import { useEffect, useState } from 'react';
import { fetchAnalytics } from '../lib/api';
import type { Analytics, BackendStatus } from '../types';

const POLL_MS = 15_000;

export function useAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [status, setStatus] = useState<BackendStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchAnalytics();
        if (cancelled) return;
        setData(result);
        setStatus('connected');
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setStatus('unreachable');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, status, error };
}

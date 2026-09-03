import type { Analytics, RawTransaction } from '../types';

// In dev, vite.config.ts proxies /api -> http://127.0.0.1:8000, which
// avoids CORS entirely. In a production build, set VITE_API_BASE_URL to
// point straight at the deployed FastAPI backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`${path} responded with ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<unknown> {
  return request('/health');
}

export async function fetchRoot(): Promise<unknown> {
  return request('/');
}

export async function fetchAnalytics(): Promise<Analytics> {
  return request<Analytics>('/analytics');
}

export async function fetchTransactions(): Promise<RawTransaction[]> {
  const data = await request<unknown>('/transactions');
  if (Array.isArray(data)) return data as RawTransaction[];
  // Some FastAPI setups wrap list responses in an envelope, e.g. { transactions: [...] }.
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const nested = Object.values(record).find((v) => Array.isArray(v));
    if (Array.isArray(nested)) return nested as RawTransaction[];
  }
  return [];
}

import type { AssetConfig, PushSubscriptionPayload, Quote } from '@repo/shared';

export const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface QuotesResponse {
  quotes: Quote[];
  lastRefresh: string | null;
}

export function fetchQuotes(refresh = false): Promise<QuotesResponse> {
  return request<QuotesResponse>(`/api/quotes${refresh ? '?refresh=true' : ''}`);
}

export function fetchConfig(): Promise<{ config: AssetConfig[] }> {
  return request<{ config: AssetConfig[] }>('/api/config');
}

export function saveConfig(
  ticker: string,
  patch: Partial<AssetConfig>,
): Promise<{ config: AssetConfig }> {
  return request<{ config: AssetConfig }>(`/api/config/${ticker}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
}

export function fetchVapidKey(): Promise<{ publicKey: string; configured: boolean }> {
  return request<{ publicKey: string; configured: boolean }>('/api/push/public-key');
}

export function subscribePush(payload: PushSubscriptionPayload): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function unsubscribePush(endpoint: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/push/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}

export function sendTestPush(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/push/test', { method: 'POST' });
}

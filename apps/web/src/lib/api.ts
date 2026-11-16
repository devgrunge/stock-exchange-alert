import type { AssetConfig, PushSubscriptionPayload, Quote } from '@repo/shared';
import { getToken, handleUnauthorized } from './auth';

export const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { body, headers, ...rest } = init;
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: {
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
  }

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

export interface LoginResponse {
  token: string;
  username: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) {
    throw new Error('Usuário ou senha inválidos');
  }
  if (!res.ok) {
    throw new Error('Falha ao entrar. Tente novamente.');
  }
  return res.json() as Promise<LoginResponse>;
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

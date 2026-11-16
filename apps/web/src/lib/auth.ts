const STORAGE_KEY = 'stock-alert-auth';

export interface AuthData {
  token: string;
  username: string;
}

export function getStoredAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthData) : null;
  } catch {
    return null;
  }
}

export function storeAuth(auth: AuthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

let onUnauthorized: (() => void) | null = null;

/** Register a callback invoked when a request returns 401 (e.g. expired token). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function handleUnauthorized(): void {
  clearAuth();
  onUnauthorized?.();
}

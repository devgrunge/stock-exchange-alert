import { useCallback, useEffect, useState } from 'react';
import { clearAuth, getStoredAuth, setUnauthorizedHandler, storeAuth } from '../lib/auth';
import { login as apiLogin } from '../lib/api';

export interface AuthState {
  username: string;
}

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState | null>(() => {
    const stored = getStoredAuth();
    return stored ? { username: stored.username } : null;
  });

  const logout = useCallback(() => {
    clearAuth();
    setAuthState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    storeAuth(result);
    setAuthState({ username: result.username });
  }, []);

  return { auth, login, logout };
}

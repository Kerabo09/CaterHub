import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type SignUpInput } from './api';
import { supabase } from './supabase';
import type { Role, User } from '../types';

interface AuthState {
  user: User | null;
  /** True while we check a saved login when the page first opens. */
  loading: boolean;
  logIn: (email: string, password: string, role: Role, remember: boolean) => Promise<User>;
  signUp: (input: SignUpInput, remember?: boolean) => Promise<User>;
  logOut: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.me().then(r => { if (alive) setUser(r.user); }).finally(() => { if (alive) setLoading(false); });
    // Signed out elsewhere, or the saved login expired.
    const { data: sub } = supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') setUser(null); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const logIn = useCallback(async (email: string, password: string, role: Role, remember: boolean) => {
    const r = await api.logIn(email, password, role, remember);
    setUser(r.user);
    return r.user;
  }, []);

  const signUp = useCallback(async (input: SignUpInput, remember = true) => {
    const r = await api.signUp(input, remember);
    setUser(r.user);
    return r.user;
  }, []);

  const logOut = useCallback(() => { setUser(null); void api.logOut(); }, []);

  const value = useMemo(() => ({ user, loading, logIn, signUp, logOut }), [user, loading, logIn, signUp, logOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}

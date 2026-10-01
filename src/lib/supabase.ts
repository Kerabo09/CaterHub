import { createClient } from '@supabase/supabase-js';

// These two values are PUBLIC by design (they ship to every browser); the database is
// protected by Row Level Security, not by hiding the key. The fallbacks mean the site still
// works if the host (Vercel) forgets to define the environment variables.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://djjvoqdwcaybpnrdepru.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_h8ARWsI6Ym34NeZg07VbhQ_TXOZzpsz';

// "Remember me": keep the login across browser restarts (localStorage) or only for this tab (sessionStorage).
let rememberNext = true;
export const setRemember = (v: boolean) => { rememberNext = v; };

const safe = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

const storage = {
  getItem: (k: string) => safe(() => localStorage.getItem(k) ?? sessionStorage.getItem(k), null),
  setItem: (k: string, v: string) => safe(() => {
    const useLocal = localStorage.getItem(k) !== null ? true : sessionStorage.getItem(k) !== null ? false : rememberNext;
    (useLocal ? localStorage : sessionStorage).setItem(k, v);
  }, undefined),
  removeItem: (k: string) => safe(() => { localStorage.removeItem(k); sessionStorage.removeItem(k); }, undefined),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storage },
});

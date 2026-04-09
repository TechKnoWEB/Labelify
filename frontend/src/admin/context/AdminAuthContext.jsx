import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const AdminAuthContext = createContext(null);

// Edge Function URL — set VITE_SUPABASE_URL in frontend .env
function getEdgeFunctionUrl() {
  const base = import.meta.env.VITE_SUPABASE_URL;
  return `${base}/functions/v1/admin-auth`;
}

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser]   = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading]       = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('peelify-admin-session');
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        // Basic expiry check — decode JWT payload without verifying (backend verifies)
        const [, payloadB64] = token.split('.');
        const payload = JSON.parse(atob(payloadB64));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setAdminUser(user);
          setAdminToken(token);
        } else {
          sessionStorage.removeItem('peelify-admin-session');
        }
      } catch {
        sessionStorage.removeItem('peelify-admin-session');
      }
    }
    setLoading(false);
  }, []);

  const adminSignIn = useCallback(async (email, password, onStep) => {
    // ── Step 1: Supabase password auth ────────────────────────
    onStep?.('supabase');
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      // Surface a clear message based on the Supabase error code
      const code = signInErr.code ?? signInErr.message ?? '';
      let message = signInErr.message;

      if (code.includes('invalid_credentials') || code.includes('Invalid login')) {
        message = 'Incorrect email or password. Check your credentials and try again.';
      } else if (code.includes('email_not_confirmed')) {
        message = 'Email not confirmed. Check your inbox and confirm your account first.';
      } else if (code.includes('too_many_requests') || code.includes('rate')) {
        message = 'Too many attempts. Wait a few minutes and try again.';
      }

      return { error: { message, step: 'supabase' } };
    }

    const supabaseToken = data.session.access_token;

    // ── Step 2: Exchange for admin JWT via Edge Function ──────
    onStep?.('edge_function');
    let res, json;
    try {
      res  = await fetch(getEdgeFunctionUrl(), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${supabaseToken}`,
        },
        body:    JSON.stringify({ supabaseToken }),
      });
      json = await res.json();
    } catch (fetchErr) {
      await supabase.auth.signOut();
      return { error: { message: 'Could not reach the admin-auth service. Is the Edge Function deployed?', step: 'network' } };
    }

    if (!res.ok) {
      await supabase.auth.signOut();
      const serverMsg = json?.error ?? 'Access denied.';
      // Distinguish allowlist rejection from other errors
      const message = res.status === 403
        ? `Access denied — ${email} is not in the SuperAdmin allowlist (SUPERADMIN_EMAILS).`
        : serverMsg;
      return { error: { message, step: 'edge_function', status: res.status } };
    }

    const { adminToken } = json;
    if (!adminToken) {
      await supabase.auth.signOut();
      return { error: { message: 'Edge Function returned no token. Check Edge Function logs.', step: 'edge_function' } };
    }

    const user = {
      id:       data.user.id,
      email:    data.user.email,
      fullName: data.user.user_metadata?.full_name ?? data.user.email,
    };

    setAdminUser(user);
    setAdminToken(adminToken);
    sessionStorage.setItem('peelify-admin-session', JSON.stringify({ user, token: adminToken }));

    return { error: null };
  }, []);

  const adminSignOut = useCallback(() => {
    sessionStorage.removeItem('peelify-admin-session');
    setAdminUser(null);
    setAdminToken(null);
    // Don't sign out of main Supabase session — admin may also be a regular app user
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminToken, loading, adminSignIn, adminSignOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}

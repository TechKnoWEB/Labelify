import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * Fetch data from an admin API endpoint with auth token injected automatically.
 * @param {string} url  - e.g. '/api/admin/users'
 * @param {object} opts - optional: { method, body, skip }
 */
export function useAdminFetch(url, opts = {}) {
  const { adminToken, adminSignOut } = useAdminAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(!opts.skip);
  const [error, setError]   = useState(null);
  const abortRef            = useRef(null);

  const run = useCallback(async (overrideUrl, overrideOpts) => {
    const fetchUrl  = overrideUrl  ?? url;
    const fetchOpts = overrideOpts ?? opts;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(fetchUrl, {
        method:  fetchOpts.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body:    fetchOpts.body ? JSON.stringify(fetchOpts.body) : undefined,
        signal:  controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        adminSignOut();
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Request failed');
      setData(json);
      return json;
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, adminToken, adminSignOut]); // eslint-disable-line

  useEffect(() => {
    if (!opts.skip && adminToken) run();
    return () => abortRef.current?.abort();
  }, [url, adminToken]); // eslint-disable-line

  return { data, loading, error, refetch: run };
}

/**
 * One-shot admin API call (not auto-fired on mount).
 * Returns { call, loading, error }.
 */
export function useAdminAction() {
  const { adminToken, adminSignOut } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const call = useCallback(async (url, method = 'POST', body = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401 || res.status === 403) { adminSignOut(); return { ok: false }; }
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Request failed'); return { ok: false, error: json.error }; }
      return { ok: true, data: json };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [adminToken, adminSignOut]);

  return { call, loading, error };
}

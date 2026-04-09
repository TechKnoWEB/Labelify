import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { credits, subscription_tier }
  const [loading, setLoading] = useState(true);

  function getFavoritesStorageKey(userId) {
    return `peelify-favorites:${userId}`;
  }

  function readLocalFavorites(userId) {
    if (typeof window === 'undefined' || !userId) return [];
    try {
      const raw = window.localStorage.getItem(getFavoritesStorageKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeLocalFavorites(userId, favorites) {
    if (typeof window === 'undefined' || !userId) return;
    try {
      window.localStorage.setItem(getFavoritesStorageKey(userId), JSON.stringify(favorites));
    } catch {
      // Ignore storage errors and keep the in-memory state usable.
    }
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    // Select only columns that exist in the current schema.
    // favorites is not yet in the DB — selecting it would fail the whole query.
    let { data, error } = await supabase
      .from('profiles')
      .select('credits, subscription_tier, created_at, favorites')
      .eq('id', userId)
      .single();

    if (error && error.message?.includes('favorites')) {
      const fallback = await supabase
        .from('profiles')
        .select('credits, subscription_tier, created_at')
        .eq('id', userId)
        .single();

      data = fallback.data ? { ...fallback.data, favorites: [] } : null;
      error = fallback.error;
    }

    if (!error && data) {
      const localFavorites = readLocalFavorites(userId);
      setProfile({
        ...data,
        favorites: Array.isArray(data.favorites) && data.favorites.length > 0
          ? data.favorites
          : localFavorites,
      });
    } else if (error) console.error('[fetchProfile]', error.message);
    setLoading(false);
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    // Supabase silently succeeds when email already exists (to prevent enumeration).
    // Detect it: existing email returns a user with an empty identities array.
    if (!error && data?.user?.identities?.length === 0) {
      return {
        data,
        error: { message: 'An account with this email already exists. Please sign in instead.' },
      };
    }
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  // Toggle a template id in the user's favorites list.
  // Requires this migration first:
  //   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorites text[] NOT NULL DEFAULT '{}';
  async function toggleFavorite(templateId) {
    if (!user) return;
    const current = profile?.favorites ?? [];
    const next = current.includes(templateId)
      ? current.filter((id) => id !== templateId)
      : [...current, templateId];
    // Optimistically update local state so UI reacts immediately
    setProfile((prev) => ({ ...prev, favorites: next }));
    writeLocalFavorites(user.id, next);
    const { error } = await supabase
      .from('profiles')
      .update({ favorites: next })
      .eq('id', user.id);
    // If the column doesn't exist or the update fails, keep the local fallback
    // so the favorites UI still works in the editor.
    if (error) {
      console.error('[toggleFavorite]', error.message);
    }
  }

  // Save a completed job to the job_history table.
  // Requires this Supabase migration (run once):
  //
  //   create table job_history (
  //     id           uuid primary key default gen_random_uuid(),
  //     user_id      uuid references auth.users(id) on delete cascade not null,
  //     template_id  text,
  //     template_name text,
  //     label_count  int  not null,
  //     credits_used int  not null,
  //     created_at   timestamptz default now()
  //   );
  //   alter table job_history enable row level security;
  //   create policy "Users can insert own jobs"
  //     on job_history for insert with check (auth.uid() = user_id);
  //   create policy "Users can read own jobs"
  //     on job_history for select using (auth.uid() = user_id);
  //
  async function saveJobHistory({ templateId, templateName, labelCount, creditsUsed }) {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('job_history').insert({
      user_id:       user.id,
      template_id:   templateId   ?? null,
      template_name: templateName ?? null,
      label_count:   labelCount,
      credits_used:  creditsUsed,
    });
    return { error: error ?? null };
  }

  // Deduct credits after a successful PDF generation.
  // 1 credit = 30 labels (ceil division).
  // Returns { error, newBalance } — null error means success.
  //
  // Safety: re-fetches the live balance from Supabase right before writing so
  // stale local state can never cause an incorrect deduction (e.g. two tabs open).
  async function deductCredits(labelCount) {
    if (!user) return { error: new Error('Not authenticated') };

    const creditsRequired = Math.ceil(labelCount / 30);

    // 1. Read the current balance fresh from the DB (not from local state)
    const { data: fresh, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (fetchError || !fresh) {
      return { error: new Error('Could not verify your credit balance. Please try again.') };
    }

    const liveCredits = fresh.credits;

    // 2. Guard against insufficient balance using the live value
    if (liveCredits < creditsRequired) {
      // Sync local state in case it was stale
      setProfile((prev) => ({ ...prev, credits: liveCredits }));
      return { error: new Error(`Insufficient credits. Need ${creditsRequired}, have ${liveCredits}.`) };
    }

    const newBalance = liveCredits - creditsRequired;

    // 3. Write the new balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('id', user.id);

    if (updateError) {
      return { error: updateError };
    }

    // 4. Sync local state with what was actually written
    setProfile((prev) => ({ ...prev, credits: newBalance }));

    return { error: null, newBalance };
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      deductCredits,
      saveJobHistory,
      toggleFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

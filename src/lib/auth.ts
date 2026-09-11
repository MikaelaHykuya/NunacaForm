import { supabase } from './supabase';

export interface Session {
  role: string;
  name: string | null;
}

export async function loginWithPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase belum dikonfigurasi (set NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY).' };
  }
  try {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: String(pin).trim() }),
    });
    const data = (await res.json()) as { session?: { access_token: string; refresh_token: string }; error?: string };
    if (!res.ok || !data.session) {
      return { ok: false, error: data.error || 'PIN salah!' };
    }
    const { error } = await supabase.auth.setSession(data.session);
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch {
    return { ok: false, error: 'Tidak dapat terhubung ke server auth.' };
  }
}

export async function getSession(): Promise<Session | null> {
  if (!supabase || typeof window === 'undefined') return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const adminId = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_USER_ID;
  if (adminId && data.session.user.id !== adminId) return null;
  return { role: 'admin', name: data.session.user.email || 'Admin Pusat' };
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/admin-logout', { method: 'POST' });
  } catch {
    // abaikan — cookie tetap dibersihkan oleh sessionSignout bila jalan
  }
  if (supabase && typeof window !== 'undefined') {
    await supabase.auth.signOut();
  }
}
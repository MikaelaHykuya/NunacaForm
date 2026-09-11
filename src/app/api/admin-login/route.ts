import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { signJwt } from '@/lib/jwt';

export const runtime = 'nodejs';

async function getAdminUserId(
  baseUrl: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const configured = process.env.ADMIN_SUPABASE_USER_ID?.trim();
  if (configured) return { ok: true, id: configured };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const email = (process.env.ADMIN_SUPABASE_EMAIL || 'admin@nunacagroupindonesia.com').toLowerCase();
  if (!serviceKey) {
    return {
      ok: false,
      error:
        'Konfigurasi admin belum lengkap. Isi ADMIN_SUPABASE_USER_ID (UUID user admin) atau SUPABASE_SERVICE_ROLE_KEY agar user dibuat otomatis.',
    };
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
  const endpoint = `${baseUrl}/auth/v1/admin/users`;

  const search = await fetch(`${endpoint}?filter=email&query=${encodeURIComponent(email)}`, { headers });
  if (search.ok) {
    const data = (await search.json()) as { users?: { id: string }[] };
    if (data.users?.length) return { ok: true, id: data.users[0].id };
  }

  const create = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      email_confirm: true,
      password: `${randomBytes(12).toString('hex')}Aa1!`,
    }),
  });
  const created = (await create.json()) as { id?: string };
  if ((create.ok || create.status === 201) && created.id) return { ok: true, id: created.id };

  return {
    ok: false,
    error: `Gagal menyiapkan user admin otomatis (status ${create.status}). Buat user admin di Supabase → Authentication lalu isi ADMIN_SUPABASE_USER_ID.`,
  };
}

export async function POST(request: Request) {
  let pin = '';
  try {
    const body = (await request.json()) as { pin?: string };
    pin = String(body?.pin ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin || pin !== adminPin) {
    return NextResponse.json({ error: 'PIN salah!' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!url || !anonKey || !jwtSecret) {
    return NextResponse.json(
      { error: 'Konfigurasi server belum lengkap. Isi SUPABASE_JWT_SECRET (Supabase Dashboard → Settings → API → JWT Secret).' },
      { status: 500 }
    );
  }

  const admin = await getAdminUserId(url);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 500 });
  }

  const accessToken = signJwt(jwtSecret, {
    role: 'authenticated',
    sub: admin.id,
    email: process.env.ADMIN_SUPABASE_EMAIL || 'admin@nunacagroupindonesia.com',
  });

  const response = NextResponse.json({
    session: { access_token: accessToken, refresh_token: accessToken },
  });
  response.cookies.set('nbs_admin', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 86400,
  });
  return response;
}
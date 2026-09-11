import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt, isUuid } from '@/lib/verify-jwt';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('nbs_admin')?.value;
  const claims = await verifyJwt(token, process.env.SUPABASE_JWT_SECRET || '');

  const adminId = process.env.ADMIN_SUPABASE_USER_ID?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  let allowed = false;
  if (claims && typeof claims.sub === 'string') {
    if (adminId) {
      allowed = claims.sub === adminId;
    } else if (serviceKey) {
      allowed = isUuid(claims.sub);
    }
  }

  if (!allowed) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.pathname;
    url.pathname = '/admin/login';
    url.search = `next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/builder'],
};
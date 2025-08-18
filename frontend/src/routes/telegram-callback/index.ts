import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async (event) => {
  const { url, cookie, redirect, env } = event;

  const token = url.searchParams.get('token');
  if (!token) {
    throw redirect(302, '/auth?error=no_token');
  }

  const apiBase = (process.env.API_BASE_URL || env.get('API_BASE_URL') || 'http://localhost:5000')
    .replace(/\/+$/, '');

  let res: Response;

  try {
    res = await fetch(`${apiBase}/api/auth/met`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client': 'web',
      },
      body: JSON.stringify({token}),
    });
  } catch {
    throw redirect(302, '/auth?error=network');
  }

  if (!res.ok) {
    if (res.status === 404) {
      // One-time token likely already used or expired
      throw redirect(302, '/auth?error=token_used_or_expired');
    }
    if (res.status === 401) {
      throw redirect(302, '/auth?error=unauthorized');
    }
    if (res.status === 405) {
      throw redirect(302, '/auth?error=wrong_method');
    }
    throw redirect(302, `/auth?error=complete_auth_failed&status=${res.status}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw redirect(302, '/auth?error=invalid_json');
  }

  const sessionToken =
    data?.sessionToken ?? data?.token ?? data?.accessToken ?? data?.jwt;

  if (!sessionToken) {
    throw redirect(302, '/auth?error=invalid_response_no_token');
  }

  cookie.set('session', sessionToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  throw redirect(302, '/');
};
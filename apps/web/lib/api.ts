const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getBaseUrl(): string {
  return API_BASE_URL;
}

export function getApiUrl(): string {
  return getBaseUrl();
}

export function getOAuthUrl(): string {
  return `${getBaseUrl()}/auth/github`;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (token) {
      headers.Cookie = `token=${token.value}`;
    }
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    credentials: typeof window !== 'undefined' ? 'include' : undefined,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const message =
      (typeof err.error === 'string' && err.error) ||
      (typeof err.message === 'string' && err.message) ||
      res.statusText ||
      'Request failed';

    if (
      typeof window !== 'undefined' &&
      res.status === 403 &&
      (message === 'Account suspended' || message === 'User not found')
    ) {
      window.location.href = '/login?error=suspended';
    }

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

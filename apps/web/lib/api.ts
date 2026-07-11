function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
    throw new Error(err.error || 'Request failed');
  }

  return res.json() as Promise<T>;
}

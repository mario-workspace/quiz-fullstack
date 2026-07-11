import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config, getEnv } from '../config';
import type { JwtPayload } from '../types';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export type { JwtPayload };

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  try {
    const hashBuffer = Buffer.from(hash, 'hex');
    const derived = scryptSync(password, salt, KEY_LENGTH);
    if (hashBuffer.length !== derived.length) return false;
    return timingSafeEqual(hashBuffer, derived);
  } catch {
    return false;
  }
}

export function signToken(payload: JwtPayload): string {
  const { JWT_SECRET } = getEnv();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const { JWT_SECRET } = getEnv();
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCookieOptions() {
  const { NODE_ENV } = getEnv();
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  };
}

export function getGitHubAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID!,
    redirect_uri: config.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: config.GITHUB_CALLBACK_URL,
    }),
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    throw new Error(tokenData.error ?? 'OAuth failed');
  }
  return tokenData.access_token;
}

export async function fetchGitHubUser(accessToken: string): Promise<{
  id: number;
  login: string;
  name?: string;
  email?: string;
}> {
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
  return userRes.json() as Promise<{ id: number; login: string; name?: string; email?: string }>;
}

export async function fetchGitHubPrimaryEmail(accessToken: string): Promise<string | null> {
  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
  const emails = (await emailRes.json()) as { email: string; primary: boolean }[];
  return emails.find((e) => e.primary)?.email ?? emails[0]?.email ?? null;
}

export async function resolveGitHubProfile(code: string) {
  const accessToken = await exchangeGitHubCode(code);
  const ghUser = await fetchGitHubUser(accessToken);

  let email = ghUser.email;
  if (!email) {
    email = (await fetchGitHubPrimaryEmail(accessToken)) ?? undefined;
  }
  if (!email) {
    throw new Error('Unable to retrieve GitHub email');
  }

  return {
    oauthId: String(ghUser.id),
    email,
    name: ghUser.name ?? ghUser.login,
  };
}

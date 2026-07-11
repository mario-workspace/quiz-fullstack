import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, getApiUrl } from './api';

describe('api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', { location: { href: '' } });
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1' } }),
    });

    const result = await api<{ user: { id: string } }>('/auth/me');
    expect(result).toEqual({ user: { id: '1' } });
    expect(fetchMock).toHaveBeenCalledWith(
      `${getApiUrl()}/auth/me`,
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    const callHeaders = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(callHeaders['Content-Type']).toBeUndefined();
  });

  it('throws with server error message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    await expect(api('/auth/me')).rejects.toThrow('Unauthorized');
  });

  it('throws fallback message when response is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('invalid json')),
    });

    await expect(api('/auth/me')).rejects.toThrow('Bad Gateway');
  });

  it('sets Content-Type when body is provided', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1' } }),
    });

    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'x' }),
    });

    const callHeaders = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(callHeaders['Content-Type']).toBe('application/json');
  });

  it('passes custom fetch options', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await api('/auth/logout', { method: 'POST', headers: { 'X-Test': '1' } });

    expect(fetchMock).toHaveBeenCalledWith(
      `${getApiUrl()}/auth/logout`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Test': '1' }),
      }),
    );
  });
});

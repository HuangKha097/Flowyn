const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

let refreshRequest: Promise<boolean> | null = null;

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    }).then((response) => response.ok).finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    if (await refreshSession()) return apiFetch<T>(path, init, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

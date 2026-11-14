const SESSION_STORAGE_KEY = 'grid_session_token';

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionToken && sessionToken.trim() !== '') return sessionToken.trim();
    const storedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedToken && storedToken.trim() !== '') return storedToken.trim();
  } catch {
    return null;
  }
  return null;
}

export function authorizedHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

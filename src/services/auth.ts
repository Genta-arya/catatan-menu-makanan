// Authentication Service for Dapur Radha

const AUTH_KEY = 'dapur_radha_auth';

export interface AuthSession {
  username: string;
  loggedInAt: number;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const session: AuthSession = JSON.parse(raw);
    return session.username === 'radha';
  } catch {
    return false;
  }
}

export function login(username: string, password: string): { success: boolean; message?: string } {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  if (cleanUser === 'radha' && cleanPass === 'radhacy') {
    const session: AuthSession = {
      username: 'radha',
      loggedInAt: Date.now(),
    };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      // Set cookie for quick header checking if needed
      document.cookie = `dapur_radha_session=radha; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    return { success: true };
  }

  return { success: false, message: 'Username atau password salah! Silakan coba lagi.' };
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_KEY);
    document.cookie = 'dapur_radha_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {
    /* ignore */
  }
  window.location.href = '/login';
}

export function getCurrentUser(): string | null {
  if (!isAuthenticated()) return null;
  return 'radha';
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'dtm_token';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

const request = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1${path}`, { ...options, headers });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error || res.statusText || 'Permintaan gagal diproses.';
    throw new ApiError(res.status, message);
  }

  return data as T;
};

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' })
};

import { API_BASE_URL } from '@/services/config';
import { log } from '@/services/logger';

const API_BASE: string = API_BASE_URL;

const TOKEN_KEY = 'soroco_access_token';
const USER_KEY = 'soroco_user';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getSavedUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  code?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  log.info('apiClient', `${method} ${path}`);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
    });
  } catch {
    log.error('apiClient', `${method} ${path} — server unreachable`);
    throw new ApiError(0, 'Unable to reach the server. Is it running?');
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response — leave body null
  }

  if (!res.ok) {
    log.warn('apiClient', `${method} ${path} → ${res.status}`, body?.message);
    if (res.status === 401) clearSession();
    throw new ApiError(
      res.status,
      body?.message ?? `Request failed (${res.status})`,
      body?.code,
    );
  }

  if (body && body.success === false) {
    log.warn('apiClient', `${method} ${path} → success:false`, body);
    throw new ApiError(res.status, body.message ?? 'Request failed', body.code);
  }

  log.debug('apiClient', `${method} ${path} → ok`);
  return (body?.data as T | undefined) ?? ({} as T);
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
      method: 'POST',
      body: body == null ? undefined : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
      method: 'PATCH',
      body: body == null ? undefined : JSON.stringify(body),
    }),

  delete: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData): Promise<T> =>
    request<T>(path, { method: 'POST', body: formData }),
};
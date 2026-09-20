export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

export const WS_BASE_URL: string =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined) ?? 'ws://localhost:8000/api/v1';

export const IMAGE_BASE_URL: string =
  (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) ?? '';

export const ADMIN_EMAIL: string =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? '';

export const ADMIN_PASSWORD: string =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? '';

export const EMPLOYEE_EMAIL: string =
  (import.meta.env.VITE_EMPLOYEE_EMAIL as string | undefined) ?? '';
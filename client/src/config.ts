/**
 * API origin (no trailing slash). Empty string = same-origin `/api` and `/uploads`
 * (Vite dev proxy + nginx in Docker). Set `VITE_API_URL` when the API is on another host.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

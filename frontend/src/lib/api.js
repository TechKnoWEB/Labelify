// In production (Vercel), frontend and backend share the same domain,
// so API calls use relative paths. In local dev, point to the local backend.
export const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

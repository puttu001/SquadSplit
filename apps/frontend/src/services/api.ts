import axios from 'axios';
import { useAuthStore } from '@store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh serialization ──────────────────────────────────────────────────
// If multiple requests 401 simultaneously, we only send ONE refresh request.
// All others wait for that same promise instead of each sending their own,
// which would rotate the refresh token out from under each other.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefresh } = data.data;
      useAuthStore.getState().setTokens(accessToken, newRefresh);
      return accessToken;
    } finally {
      // Always clear the shared promise so the next expiry triggers a fresh refresh
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Automatically refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

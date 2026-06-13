import { api } from '@services/api';

export const authApi = {
  register: (body: { name: string; email: string; username: string; password: string }) =>
    api.post('/auth/register', body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post('/auth/login', body).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),

  verifyEmail: (email: string, otp: string) =>
    api.post('/auth/verify-email', { email, otp }).then((r) => r.data),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }).then((r) => r.data),
};

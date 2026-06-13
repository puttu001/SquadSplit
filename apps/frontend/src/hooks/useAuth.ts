import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@services/api';
import { useAuthStore } from '@store/auth.store';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials).then((r) => ({ ...r.data.data, email: credentials.email })),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      const redirect = sessionStorage.getItem('redirectAfterLogin');
      if (redirect) { sessionStorage.removeItem('redirectAfterLogin'); navigate(redirect); }
      else navigate('/');
    },
    onError: (err: { response?: { data?: { message?: string }; status?: number } }, vars) => {
      const msg    = err.response?.data?.message ?? '';
      const status = err.response?.status;
      if (status === 403 && msg.toLowerCase().includes('verify')) {
        toast.error('Please verify your email first');
        navigate(`/verify-email?email=${encodeURIComponent(vars.email)}`);
      } else {
        toast.error('Invalid email or password');
      }
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: { name: string; email: string; username: string; password: string }) =>
      api.post('/auth/register', input).then((r) => ({ ...r.data, email: input.email })),
    onSuccess: (data: { email: string }) => {
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Registration failed'),
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const navigate                 = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/auth/logout', { refreshToken }),
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}

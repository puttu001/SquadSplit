import { api } from '@services/api';

export const profileApi = {
  getMe: () =>
    api.get('/users/me').then((r) => r.data.data),

  update: (body: { name?: string; phoneNumber?: string; upiId?: string }) =>
    api.patch('/users/me', body).then((r) => r.data.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/users/me/avatar', form, {
      headers: { 'Content-Type': undefined },
    }).then((r) => r.data.data as { avatarUrl: string });
  },

  searchUsers: (q: string) =>
    api.get('/users/search', { params: { q } }).then((r) => r.data.data),

  sendFriendRequest: (usernameOrEmail: string) =>
    api.post('/users/friends/request', { usernameOrEmail }).then((r) => r.data),

  getFriends: () =>
    api.get('/users/friends').then((r) => r.data.data),
};

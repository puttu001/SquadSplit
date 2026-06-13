import { api } from '@services/api';

export interface Friend {
  id:        string;
  name:      string;
  username:  string | null;
  avatarUrl: string | null;
}

export interface SearchUser {
  id:        string;
  name:      string;
  username:  string | null;
  avatarUrl: string | null;
}

export interface FriendRequest {
  id:        string;
  createdAt: string;
  sender: {
    id:        string;
    name:      string;
    username:  string | null;
    avatarUrl: string | null;
  };
}

export const friendsApi = {
  list:            ()                               => api.get('/users/friends').then(r => r.data.data as Friend[]),
  listRequests:    ()                               => api.get('/users/friends/requests').then(r => r.data.data as FriendRequest[]),
  search:          (q: string)                      => api.get('/users/search', { params: { q } }).then(r => r.data.data as SearchUser[]),
  sendRequest:     (usernameOrEmail: string)        => api.post('/users/friends/request', { usernameOrEmail }).then(r => r.data),
  respondRequest:  (requestId: string, action: 'accept' | 'reject') =>
                     api.patch(`/users/friends/request/${requestId}`, { action }).then(r => r.data),
  remove:          (friendId: string)               => api.delete(`/users/friends/${friendId}`).then(r => r.data),
};

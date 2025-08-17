import apiClient from './api';

export const accountApi = {
  getAccount: async (token: string) =>
    apiClient.get('/account', undefined, token),

  updateProfile: async (data: { name?: string; email?: string }, token: string) =>
    apiClient.put('/account', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  changePassword: async (data: { currentPassword: string; newPassword: string }, token: string) =>
    apiClient.post('/account/change-password', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

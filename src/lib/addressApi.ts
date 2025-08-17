
import apiClient from "./api";

// Helper for DELETE with Authorization header
async function deleteWithAuth(endpoint: string, token: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const addressApi = {
  getAddresses: async (token: string) =>
    apiClient.get('/settings/addresses', undefined, token),

  addAddress: async (data: any, token: string) =>
    apiClient.post('/settings/addresses', data, { headers: { Authorization: `Bearer ${token}` } }),

  updateAddress: async (id: number, data: any, token: string) =>
    apiClient.put(`/settings/addresses/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),

  deleteAddress: async (id: number, token: string) =>
    deleteWithAuth(`/settings/addresses/${id}`, token),

  getDefaultShipping: async (token: string) =>
    apiClient.get('/settings/addresses/default?type=shipping', undefined, token),
};

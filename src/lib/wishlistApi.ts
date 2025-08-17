
import apiClient from '@/lib/api';

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
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const wishlistApi = {
  getWishlist: async (token: string) =>
    apiClient.get('/wishlist', undefined, token),
  addToWishlist: async (productId: number, token: string) =>
    apiClient.post('/wishlist', { productId }, { headers: { Authorization: `Bearer ${token}` } }),
  removeFromWishlist: async (productId: number, token: string) =>
    deleteWithAuth(`/wishlist/${productId}`, token),
};

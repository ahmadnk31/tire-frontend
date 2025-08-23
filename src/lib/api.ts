// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string; language?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string; resendVerification?: boolean; language?: string }) =>
    apiClient.post('/auth/login', data),

  verify: (email: string, token: string) =>
    apiClient.get('/auth/verify', { email, token }),

  logout: () =>
    apiClient.post('/auth/logout', {}),

  socialLogin: (provider: string, token: string) =>
    apiClient.post('/auth/social-login', { provider, token }),

  forgotPassword: (email: string, language?: string) =>
    apiClient.post('/auth/forgot-password', { email, language }),

  resetPassword: (data: { email: string; token: string; password: string; language?: string }) =>
    apiClient.post('/auth/reset-password', data),

  resendVerification: (email: string, language?: string) =>
    apiClient.post('/auth/resend-verification', { email, language }),
};
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('token');
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
};

// Generic API client
const apiClient = {
  async get(endpoint: string, params?: Record<string, any>, token?: string) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    const headers: Record<string, string> = {
      ...getAuthHeaders(token)
    };

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Dispatch custom event to trigger re-auth modal
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Authentication required. Please log in again.');
      }
      
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ');
          errorMessage = `Validation Error: ${validationErrors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async post(endpoint: string, data: any, options?: { headers?: Record<string, string>; token?: string }) {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      ...getAuthHeaders(options?.token),
      ...(options?.headers || {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    let json;
    try {
      json = await response.json();
    } catch {
      json = { error: `API Error: ${response.status} ${response.statusText}` };
    }
    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Dispatch custom event to trigger re-auth modal
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Return the error body so the UI can handle unverified, etc.
      throw json;
    }
    return json;
  },

  async put(endpoint: string, data: any, options?: { headers?: Record<string, string>; token?: string }) {
    const headers: Record<string, string> = {
      ...getAuthHeaders(options?.token),
      ...(options?.headers || {}),
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Dispatch custom event to trigger re-auth modal
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Authentication required. Please log in again.');
      }
      
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ');
          errorMessage = `Validation Error: ${validationErrors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async delete(endpoint: string, token?: string) {
    const headers: Record<string, string> = {
      ...getAuthHeaders(token)
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Dispatch custom event to trigger re-auth modal
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Authentication required. Please log in again.');
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  },
};

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    brand?: string;
    model?: string;
    size?: string;
    category?: string;
    featured?: boolean;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => apiClient.get('/products', params),

  getById: (id: string) => apiClient.get(`/products/${id}`),

  create: (product: any) => apiClient.post('/products', product),

  update: (id: string, product: any) => apiClient.put(`/products/${id}`, product),

  delete: (id: string) => apiClient.delete(`/products/${id}`),

  getFeatured: () => apiClient.get('/products/featured/list'),

  getRelated: (id: string | number) => apiClient.get(`/products/${id}/related`),

  search: (q: string, brand?: string) => {
    const params: any = { q };
    if (brand && brand !== 'all') params.brand = brand;
    return apiClient.get('/products/search', params);
  },

  // Category management
  getCategories: () => apiClient.get('/categories'),
  createCategory: (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
    sortOrder?: number;
    parentId?: number | null;
  }) => apiClient.post('/categories', data),
  updateCategory: (id: number, data: any) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id: number) => apiClient.delete(`/categories/${id}`),

  // Specialized endpoints for different pages
  getOnSale: () => apiClient.get('/products/on-sale'),
  getNewArrivals: () => apiClient.get('/products/new-arrivals'),
  getBrands: () => apiClient.get('/products/brands'),
  getBrandProducts: (brand: string) => apiClient.get(`/products/brands/${brand}`),
  getCategoryProducts: (category: string) => apiClient.get(`/products/categories/${category}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => apiClient.get('/orders', params),

  getById: (id: string) => apiClient.get(`/orders/${id}`),

  create: (order: any) => apiClient.post('/orders', order),

  update: (id: string, order: any) => apiClient.put(`/orders/${id}`, order),

  getStats: () => apiClient.get('/orders/stats/summary'),
};

// Dashboard API
export const dashboardApi = {
  getOverview: (token?: string) => apiClient.get('/dashboard/overview', undefined, token),

  getRecentOrders: (token?: string) => apiClient.get('/dashboard/recent-orders', undefined, token),

  getLowStock: (token?: string) => apiClient.get('/dashboard/low-stock', undefined, token),

  getSalesData: (period?: 'daily' | 'monthly', token?: string) => 
    apiClient.get('/dashboard/sales-data', { period }, token),

  getTopProducts: (token?: string) => apiClient.get('/dashboard/top-products', undefined, token),

  getAlerts: (token?: string) => apiClient.get('/dashboard/alerts', undefined, token),

  getAnalytics: (token?: string) => apiClient.get('/dashboard/analytics', undefined, token),
};

// Users API
export const usersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: string;
    search?: string;
  }) => apiClient.get('/users', params),

  getById: (id: string) => apiClient.get(`/users/${id}`),

  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  getStats: () => apiClient.get('/users/stats/summary'),
};

// Upload API
export const uploadApi = {
  single: (file: File, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return apiClient.post('/upload/single', formData);
  },

  multiple: (files: File[], folder = 'products') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    return apiClient.post('/upload/multiple', formData);
  },

  delete: (imageUrl: string) => apiClient.delete(`/upload/delete?imageUrl=${encodeURIComponent(imageUrl)}`),

  getPresignedUrl: (fileName: string, folder = 'products') => 
    apiClient.get('/upload/presigned-url', { fileName, folder }),
};

// Stripe API
export const stripeApi = {
  createPaymentIntent: (data: {
    cart: any[];
    userId?: string;
    userEmail?: string;
    userName?: string;
    shipping?: any;
  }) => apiClient.post('/stripe/create-payment-intent', data),
};

export default apiClient;

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

// Helper function to decode JWT token
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Helper function to get current user ID from token
export const getCurrentUserId = (): number | undefined => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    
    const decoded = decodeToken(token);
    return decoded?.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return undefined;
  }
};

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
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      ...getAuthHeaders(options?.token),
      ...(options?.headers || {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
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
  single: async (file: File, folder = 'products') => {
    try {
      console.log('📤 Starting single file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder,
        apiUrl: `${API_BASE_URL}/upload/single`
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      
      const response = await apiClient.post('/upload/single', formData);
      
      console.log('✅ Single upload successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Single upload failed:', error);
      
      // Try fallback method for deployment issues
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('🔄 Trying fallback upload method...');
        return await uploadApi.fallbackSingle(file, folder);
      }
      
      throw error;
    }
  },

  multiple: async (files: File[], folder = 'products') => {
    try {
      console.log('📤 Starting multiple file upload:', {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        folder,
        apiUrl: `${API_BASE_URL}/upload/multiple`
      });

      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      formData.append('folder', folder);
      
      const response = await apiClient.post('/upload/multiple', formData);
      
      console.log('✅ Multiple upload successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Multiple upload failed:', error);
      
      // Try fallback method for deployment issues
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('🔄 Trying fallback upload method...');
        return await uploadApi.fallbackMultiple(files, folder);
      }
      
      throw error;
    }
  },

  // Fallback method using presigned URLs for deployment issues
  fallbackSingle: async (file: File, folder = 'products') => {
    try {
      console.log('🔄 Using fallback single upload method');
      
      // Get presigned URL
      const presignedResponse = await apiClient.get('/upload/presigned-url', { 
        fileName: file.name, 
        folder 
      });
      
      if (!presignedResponse.presignedUrl) {
        throw new Error('Failed to get presigned URL');
      }
      
      // Upload directly to S3
      const uploadResponse = await fetch(presignedResponse.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }
      
      const imageUrl = `https://${process.env.VITE_S3_BUCKET || 'tire-store-images'}.s3.${process.env.VITE_AWS_REGION || 'us-east-1'}.amazonaws.com/${presignedResponse.key}`;
      
      return {
        success: true,
        message: 'File uploaded successfully (fallback method)',
        imageUrl,
        originalName: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('❌ Fallback upload failed:', error);
      throw new Error(`Fallback upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  fallbackMultiple: async (files: File[], folder = 'products') => {
    try {
      console.log('🔄 Using fallback multiple upload method');
      
      const results = [];
      for (const file of files) {
        const result = await uploadApi.fallbackSingle(file, folder);
        results.push(result);
      }
      
      return {
        success: true,
        message: 'Files uploaded successfully (fallback method)',
        files: results
      };
    } catch (error) {
      console.error('❌ Fallback multiple upload failed:', error);
      throw new Error(`Fallback multiple upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Video upload methods
  video: async (file: File, folder = 'videos') => {
    try {
      console.log('📤 Starting video upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder,
        apiUrl: `${API_BASE_URL}/upload/video`
      });

      const formData = new FormData();
      formData.append('video', file);
      formData.append('folder', folder);
      
      const response = await apiClient.post('/upload/video', formData);
      
      console.log('✅ Video upload successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Video upload failed:', error);
      
      // Try fallback method for deployment issues
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('🔄 Trying fallback video upload method...');
        return await uploadApi.fallbackVideo(file, folder);
      }
      
      throw error;
    }
  },

  fallbackVideo: async (file: File, folder = 'videos') => {
    try {
      console.log('🔄 Using fallback video upload method');
      
      // Get presigned URL for video
      const presignedResponse = await apiClient.get('/upload/presigned-url', { 
        fileName: file.name, 
        folder,
        fileType: 'video'
      });
      
      if (!presignedResponse.presignedUrl) {
        throw new Error('Failed to get presigned URL for video');
      }
      
      // Upload directly to S3
      const uploadResponse = await fetch(presignedResponse.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`S3 video upload failed: ${uploadResponse.statusText}`);
      }
      
      const videoUrl = `https://${process.env.VITE_S3_BUCKET || 'tire-store-images'}.s3.${process.env.VITE_AWS_REGION || 'us-east-1'}.amazonaws.com/${presignedResponse.key}`;
      
      return {
        success: true,
        message: 'Video uploaded successfully (fallback method)',
        videoUrl,
        originalName: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('❌ Fallback video upload failed:', error);
      throw new Error(`Fallback video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  delete: (imageUrl: string) => apiClient.delete(`/upload/delete?imageUrl=${encodeURIComponent(imageUrl)}`),

  getPresignedUrl: (fileName: string, folder = 'products') => 
    apiClient.get('/upload/presigned-url', { fileName, folder }),

  // Test upload functionality
  testConnection: async () => {
    try {
      const response = await apiClient.get('/upload/test-s3');
      console.log('✅ Upload connection test successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Upload connection test failed:', error);
      throw error;
    }
  }
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

// Reviews API
export const reviewsApi = {
  getProductReviews: (productId: number, params?: any) => apiClient.get(`/reviews/product/${productId}`, params),
  getReviewStats: (productId: number) => apiClient.get(`/reviews/stats/${productId}`),
  createReview: (data: any, token?: string) => apiClient.post('/reviews', data, { token }),
  updateReview: (reviewId: number, data: any, token?: string) => apiClient.put(`/reviews/${reviewId}`, data, { token }),
  deleteReview: (reviewId: number, token?: string) => apiClient.delete(`/reviews/${reviewId}`, token),
  markHelpful: (reviewId: number, token?: string) => apiClient.post(`/reviews/${reviewId}/helpful`, {}, { token }),
  unmarkHelpful: (reviewId: number, token?: string) => apiClient.delete(`/reviews/${reviewId}/helpful`, token),
  checkHelpful: (reviewId: number, token?: string) => apiClient.get(`/reviews/${reviewId}/helpful/check`, undefined, token),
  // Admin routes
  getPendingReviews: (token?: string, params?: any) => apiClient.get('/reviews/admin/pending', params, token),
  getAllReviews: (token?: string, params?: any) => apiClient.get('/reviews/admin/all', params, token),
  updateReviewStatus: (reviewId: number, status: string, token?: string) => apiClient.put(`/reviews/admin/${reviewId}/status`, { status }, { token }),
};

// Blog API
export const blogApi = {
  // Get all blog posts
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
  }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.featured) searchParams.append('featured', 'true');
      
      const response = await apiClient.get(`/blog?${searchParams.toString()}`);
      return response.data || { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    } catch (error) {
      console.error('Blog API error:', error);
      return { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  },

  // Get featured posts
  getFeatured: async () => {
    try {
      const response = await apiClient.get('/blog/featured');
      return response.data || { posts: [] };
    } catch (error) {
      console.error('Featured posts API error:', error);
      return { posts: [] };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/blog/categories');
      return response.data || { categories: [] };
    } catch (error) {
      console.error('Categories API error:', error);
      return { categories: [] };
    }
  },

  // Get single post by slug
  getBySlug: async (slug: string) => {
    try {
      const response = await apiClient.get(`/blog/${slug}`);
      return response.data || { post: null };
    } catch (error) {
      console.error('Blog post API error:', error);
      return { post: null };
    }
  },

  // Add comment
  addComment: async (postId: number, data: {
    content: string;
    authorName: string;
    authorEmail: string;
  }) => {
    try {
      const response = await apiClient.post(`/blog/${postId}/comments`, data);
      return response.data;
    } catch (error) {
      console.error('Add comment API error:', error);
      throw error;
    }
  },

  // Subscribe to newsletter
  subscribe: async (data: { email: string; name?: string }) => {
    try {
      const response = await apiClient.post('/blog/subscribe', data);
      return response.data;
    } catch (error) {
      console.error('Subscribe API error:', error);
      throw error;
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (data: { email: string }) => {
    try {
      const response = await apiClient.post('/blog/unsubscribe', data);
      return response.data;
    } catch (error) {
      console.error('Unsubscribe API error:', error);
      throw error;
    }
  },

  // Admin functions
  admin: {
    // Get all posts (admin)
    getAllPosts: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);
        
        const response = await apiClient.get(`/blog/admin/posts?${searchParams.toString()}`);
        return response.data || { posts: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      } catch (error) {
        console.error('Admin posts API error:', error);
        return { posts: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }
    },

    // Create new post
    createPost: async (data: FormData) => {
      try {
        const response = await apiClient.post('/blog/admin/posts', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Create post API error:', error);
        throw error;
      }
    },

    // Update post
    updatePost: async (id: number, data: FormData) => {
      try {
        const response = await apiClient.put(`/blog/admin/posts/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Update post API error:', error);
        throw error;
      }
    },

    // Delete post
    deletePost: async (id: number) => {
      try {
        const response = await apiClient.delete(`/blog/admin/posts/${id}`);
        return response.data;
      } catch (error) {
        console.error('Delete post API error:', error);
        throw error;
      }
    },

    // Get all comments (admin)
    getAllComments: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);
        
        const response = await apiClient.get(`/blog/admin/comments?${searchParams.toString()}`);
        return response.data || { comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      } catch (error) {
        console.error('Admin comments API error:', error);
        return { comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }
    },

    // Update comment status
    updateCommentStatus: async (id: number, status: 'pending' | 'approved' | 'spam') => {
      try {
        const response = await apiClient.put(`/blog/admin/comments/${id}`, { status });
        return response.data;
      } catch (error) {
        console.error('Update comment status API error:', error);
        throw error;
      }
    },

    // Delete comment
    deleteComment: async (id: number) => {
      try {
        const response = await apiClient.delete(`/blog/admin/comments/${id}`);
        return response.data;
      } catch (error) {
        console.error('Delete comment API error:', error);
        throw error;
      }
    },
  },
};

export default apiClient;

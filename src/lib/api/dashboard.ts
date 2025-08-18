const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DashboardOverview {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalContacts: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  newUsers: number;
  newOrders: number;
  newRevenue: number;
  newContacts: number;
  newSubscriptions: number;
  pendingContacts: number;
  contactsByType: Record<string, number>;
  bestSellingProducts: Array<{
    id: number;
    name: string;
    sold: number;
  }>;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: string;
  adminResponse?: string;
  clientIP?: string;
  userAgent?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  name?: string;
  status: string;
  source: string;
  tags?: any;
  metadata?: any;
  subscribedAt: string;
  unsubscribedAt?: string;
  lastEmailSent?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    messages?: T[];
    subscriptions?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}

// Dashboard Overview
export const getDashboardOverview = async (token: string): Promise<DashboardOverview> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard overview');
  }

  return response.json();
};

// Contact Messages
export const getContactMessages = async (
  token: string,
  page = 1,
  limit = 20,
  status?: string,
  inquiryType?: string
): Promise<PaginatedResponse<ContactMessage>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (inquiryType) params.append('inquiryType', inquiryType);

  const response = await fetch(`${API_BASE_URL}/dashboard/contacts?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contact messages');
  }

  return response.json();
};

export const updateContactMessage = async (
  token: string,
  messageId: number,
  data: { status?: string; response?: string }
): Promise<ApiResponse<ContactMessage>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/contacts/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update contact message');
  }

  return response.json();
};

export const replyToContact = async (
  token: string,
  messageId: number,
  data: { subject: string; message: string; markAsResolved?: boolean }
): Promise<ApiResponse<ContactMessage>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/contacts/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send reply');
  }

  return response.json();
};

export const deleteContactMessage = async (
  token: string,
  messageId: number
): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/contacts/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete contact message');
  }

  return response.json();
};

// Newsletter Subscriptions
export const getNewsletterSubscriptions = async (
  token: string,
  page = 1,
  limit = 20,
  status?: string,
  source?: string
): Promise<PaginatedResponse<NewsletterSubscription>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (source) params.append('source', source);

  const response = await fetch(`${API_BASE_URL}/dashboard/subscriptions?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch newsletter subscriptions');
  }

  return response.json();
};

export const updateNewsletterSubscription = async (
  token: string,
  subscriptionId: number,
  data: { status?: string; tags?: any; metadata?: any }
): Promise<ApiResponse<NewsletterSubscription>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update newsletter subscription');
  }

  return response.json();
};

export const sendNewsletterEmail = async (
  token: string,
  data: {
    subject: string;
    message: string;
    recipients: 'all' | 'active' | 'specific';
    tags?: string[];
  }
): Promise<ApiResponse<{ totalRecipients: number; successCount: number; failureCount: number; subject: string }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/subscriptions/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send newsletter email');
  }

  return response.json();
};

export const deleteNewsletterSubscription = async (
  token: string,
  subscriptionId: number
): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete newsletter subscription');
  }

  return response.json();
};

// Additional dashboard endpoints
export const getRecentOrders = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/recent-orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }

  return response.json();
};

export const getLowStockProducts = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/low-stock`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch low stock products');
  }

  return response.json();
};

// Email Actions
export const resendContactConfirmation = async (
  token: string,
  messageId: number
): Promise<ApiResponse<{ emailSent: boolean; recipient: string; subject: string }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/contacts/${messageId}/resend-confirmation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend contact confirmation');
  }

  return response.json();
};

export const sendAdminNotification = async (
  token: string,
  messageId: number,
  adminEmail: string
): Promise<ApiResponse<{ emailSent: boolean; recipient: string; contactId: number }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/contacts/${messageId}/notify-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ adminEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send admin notification');
  }

  return response.json();
};

export const resendNewsletterWelcome = async (
  token: string,
  subscriptionId: number
): Promise<ApiResponse<{ emailSent: boolean; recipient: string }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/subscriptions/${subscriptionId}/resend-welcome`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend newsletter welcome');
  }

  return response.json();
};

export const resendPasswordReset = async (
  token: string,
  userId: number
): Promise<ApiResponse<{ emailSent: boolean; recipient: string; userId: number }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/users/${userId}/resend-password-reset`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend password reset');
  }

  return response.json();
};

export const resendOrderConfirmation = async (
  token: string,
  orderId: number
): Promise<ApiResponse<{ emailSent: boolean; recipient: string; orderNumber: string; orderId: number }>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/resend-confirmation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend order confirmation');
  }

  return response.json();
};

// Newsletter Campaign Types
export interface NewsletterCampaign {
  id: number;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  type: 'general' | 'product_catalog' | 'promotional';
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  products?: Array<{
    id: number;
    name: string;
    brand: string;
    model: string;
    size: string;
    price: string;
    comparePrice?: string;
    images?: string[];
    rating?: string;
    stock: number;
    description?: string;
  }>;
}

export interface CreateCampaignData {
  title: string;
  subject: string;
  content: string;
  type: 'general' | 'product_catalog' | 'promotional';
  productIds?: number[];
  scheduledAt?: string;
}

// Newsletter Campaign API Functions

// Fetch campaigns
export const fetchCampaigns = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  statusFilter?: string,
  typeFilter?: string
): Promise<{
  success: boolean;
  data: NewsletterCampaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (statusFilter && statusFilter !== 'all') {
    params.append('status', statusFilter);
  }
  if (typeFilter && typeFilter !== 'all') {
    params.append('type', typeFilter);
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/campaigns?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  return response.json();
};

// Create campaign
export const createCampaign = async (token: string, data: CreateCampaignData): Promise<ApiResponse<NewsletterCampaign>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create campaign');
  }

  return response.json();
};

// Get single campaign with products
export const getCampaign = async (token: string, id: number): Promise<ApiResponse<NewsletterCampaign>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/campaigns/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }

  return response.json();
};

// Send campaign
export const sendCampaign = async (token: string, id: number, subscriberFilter: string = 'all'): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/campaigns/${id}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ subscriberFilter }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send campaign');
  }

  return response.json();
};

// Delete campaign
export const deleteCampaign = async (token: string, id: number): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/campaigns/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete campaign');
  }

  return response.json();
};

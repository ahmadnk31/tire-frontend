const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = `${API_BASE_URL}/contact`;

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: 'general' | 'quote' | 'appointment' | 'warranty' | 'complaint' | 'support';
}

export interface NewsletterData {
  email: string;
  name?: string;
  source?: string;
}

export interface ContactInfo {
  store: {
    name: string;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    emergency: string;
  };
  businessHours: {
    [key: string]: { open: string; close: string } | { closed: boolean };
  };
  services: string[];
  languages: string[];
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// Submit contact form
export const submitContactForm = async (data: ContactFormData): Promise<ApiResponse<{ id: number; submittedAt: string; estimatedResponseTime: string }>> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit contact form');
  }

  return response.json();
};

// Subscribe to newsletter
export const subscribeToNewsletter = async (data: NewsletterData): Promise<ApiResponse<{ id: number; email: string; subscribedAt: string }>> => {
  const response = await fetch(`${BASE_URL}/newsletter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to subscribe to newsletter');
  }

  return response.json();
};

// Get contact information
export const getContactInfo = async (): Promise<ApiResponse<ContactInfo>> => {
  const response = await fetch(`${BASE_URL}/info`);

  if (!response.ok) {
    throw new Error('Failed to fetch contact information');
  }

  return response.json();
};

// Get FAQs
export const getFAQs = async (): Promise<ApiResponse<FAQ[]>> => {
  const response = await fetch(`${BASE_URL}/faqs`);

  if (!response.ok) {
    throw new Error('Failed to fetch FAQs');
  }

  return response.json();
};

// Admin endpoints (require authentication)
export const getContactMessages = async (token: string): Promise<ApiResponse<any[]>> => {
  const response = await fetch(`${BASE_URL}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch contact messages');
  }

  return response.json();
};

export const updateContactMessage = async (
  id: number, 
  data: { status?: string; response?: string }, 
  token: string
): Promise<ApiResponse<{ id: number; status: string; updatedAt: string }>> => {
  const response = await fetch(`${BASE_URL}/messages/${id}`, {
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

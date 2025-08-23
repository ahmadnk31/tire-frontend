export interface Notification {
  id: string;
  type: 'sale' | 'new-arrival' | 'general';
  title: string;
  message: string;
  timestamp: number;
  productId?: number;
  productName?: string;
}

// Track which products have already been notified about
const getNotifiedProducts = (): { sale: number[], newArrival: number[] } => {
  if (typeof window === 'undefined') return { sale: [], newArrival: [] };
  
  const stored = localStorage.getItem('notifiedProducts');
  return stored ? JSON.parse(stored) : { sale: [], newArrival: [] };
};

const addNotifiedProduct = (type: 'sale' | 'newArrival', productId: number) => {
  const notified = getNotifiedProducts();
  if (type === 'sale') {
    if (!notified.sale.includes(productId)) {
      notified.sale.push(productId);
    }
  } else {
    if (!notified.newArrival.includes(productId)) {
      notified.newArrival.push(productId);
    }
  }
  
  localStorage.setItem('notifiedProducts', JSON.stringify(notified));
};

const isProductNotified = (type: 'sale' | 'newArrival', productId: number): boolean => {
  const notified = getNotifiedProducts();
  return type === 'sale' ? notified.sale.includes(productId) : notified.newArrival.includes(productId);
};

export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const existingNotifications = getNotifications();
  const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 50); // Keep only last 50 notifications
  
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  
  // Dispatch event to update UI
  window.dispatchEvent(new Event('notifications-updated'));
  
  return newNotification;
};

export const getNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : [];
};

export const clearNotifications = () => {
  localStorage.removeItem('notifications');
  window.dispatchEvent(new Event('notifications-updated'));
};

export const removeNotification = (id: string) => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter(n => n.id !== id);
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  window.dispatchEvent(new Event('notifications-updated'));
};

// Specific notification functions
export const addSaleNotification = (productName: string, discount: number, productId?: number) => {
  // Only create notification if product hasn't been notified about before
  if (productId && isProductNotified('sale', productId)) {
    return null;
  }
  
  const notification = addNotification({
    type: 'sale',
    title: 'Sale Alert! 🎉',
    message: `${productName} is now ${discount}% off! Don't miss this great deal.`,
    productId,
    productName,
  });
  
  // Mark this product as notified
  if (productId) {
    addNotifiedProduct('sale', productId);
  }
  
  return notification;
};

export const addNewArrivalNotification = (productName: string, productId?: number) => {
  // Only create notification if product hasn't been notified about before
  if (productId && isProductNotified('newArrival', productId)) {
    return null;
  }
  
  const notification = addNotification({
    type: 'new-arrival',
    title: 'New Arrival! ✨',
    message: `${productName} is now available in our store. Check it out!`,
    productId,
    productName,
  });
  
  // Mark this product as notified
  if (productId) {
    addNotifiedProduct('newArrival', productId);
  }
  
  return notification;
};

export const addGeneralNotification = (title: string, message: string) => {
  return addNotification({
    type: 'general',
    title,
    message,
  });
};

// Utility function to clear notified products (useful for testing)
export const clearNotifiedProducts = () => {
  localStorage.removeItem('notifiedProducts');
};

// Utility function to reset notifications for new products (call this when new products are added)
export const resetNewArrivalNotifications = () => {
  const notified = getNotifiedProducts();
  notified.newArrival = [];
  localStorage.setItem('notifiedProducts', JSON.stringify(notified));
};

// Utility function to reset notifications for sale products (call this when new sales are added)
export const resetSaleNotifications = () => {
  const notified = getNotifiedProducts();
  notified.sale = [];
  localStorage.setItem('notifiedProducts', JSON.stringify(notified));
};

// Utility function to get notified products count
export const getNotifiedProductsCount = () => {
  const notified = getNotifiedProducts();
  return {
    sale: notified.sale.length,
    newArrival: notified.newArrival.length,
    total: notified.sale.length + notified.newArrival.length
  };
};

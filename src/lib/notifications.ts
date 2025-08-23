export interface Notification {
  id: string;
  type: 'sale' | 'new-arrival' | 'general';
  title: string;
  message: string;
  timestamp: number;
  productId?: number;
  productName?: string;
}

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
  return addNotification({
    type: 'sale',
    title: 'Sale Alert! 🎉',
    message: `${productName} is now ${discount}% off! Don't miss this great deal.`,
    productId,
    productName,
  });
};

export const addNewArrivalNotification = (productName: string, productId?: number) => {
  return addNotification({
    type: 'new-arrival',
    title: 'New Arrival! ✨',
    message: `${productName} is now available in our store. Check it out!`,
    productId,
    productName,
  });
};

export const addGeneralNotification = (title: string, message: string) => {
  return addNotification({
    type: 'general',
    title,
    message,
  });
};

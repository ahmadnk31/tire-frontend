import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReAuthModal } from '@/components/ui/re-auth-modal';
import { isAuthenticated, logout, setupTokenExpirationCheck, clearTokenExpirationCheck } from '@/lib/auth';

interface AuthContextType {
  isReAuthModalOpen: boolean;
  openReAuthModal: () => void;
  closeReAuthModal: () => void;
  handleReAuthSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isReAuthModalOpen, setIsReAuthModalOpen] = useState(false);

  const openReAuthModal = () => {
    setIsReAuthModalOpen(true);
  };

  const closeReAuthModal = () => {
    setIsReAuthModalOpen(false);
  };

  const handleReAuthSuccess = () => {
    // Refresh the page or update the app state as needed
    window.location.reload();
  };

  useEffect(() => {
    // Setup token expiration checking
    const setupAuth = async () => {
      await setupTokenExpirationCheck();
    };
    setupAuth();

    // Listen for logout events
    const handleLogout = () => {
      closeReAuthModal();
    };

    // Listen for token expiration events
    const handleTokenExpired = (event: CustomEvent) => {
      // If it's a warning (not expired yet), show a toast instead of modal
      if (event.detail?.warning) {
        // You can add a toast notification here if needed
        console.log(`Session will expire in ${event.detail.minutes} minutes`);
      } else {
        openReAuthModal();
      }
    };

    window.addEventListener('logout', handleLogout);
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      clearTokenExpirationCheck();
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const value = {
    isReAuthModalOpen,
    openReAuthModal,
    closeReAuthModal,
    handleReAuthSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ReAuthModal
        isOpen={isReAuthModalOpen}
        onClose={closeReAuthModal}
        onSuccess={handleReAuthSuccess}
      />
    </AuthContext.Provider>
  );
};

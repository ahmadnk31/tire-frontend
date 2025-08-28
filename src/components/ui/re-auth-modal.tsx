import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReAuthModal: React.FC<ReAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.user && response.token) {
        await setAuthToken(response.token, response.user);
        toast({
          title: t('auth.login.success'),
          description: t('auth.welcomeBack'),
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Re-authentication failed:', error);
      toast({
        title: t('auth.login.failed'),
        description: error.message || t('auth.invalidCredentials'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all auth data and redirect to login
    localStorage.clear();
    // Dispatch cart-updated event to update cart notification icons
    window.dispatchEvent(new Event('cart-updated'));
    window.location.href = '/login';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('auth.sessionExpired')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('auth.sessionExpiredMessage')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.signIn')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="flex-1 sm:flex-none"
              >
                {t('auth.logout')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

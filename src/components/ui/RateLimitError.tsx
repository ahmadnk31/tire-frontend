import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface RateLimitErrorProps {
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export const RateLimitError: React.FC<RateLimitErrorProps> = ({ 
  onRetry, 
  message,
  className = "" 
}) => {
  const { t } = useTranslation();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('errors.rateLimit.title', 'Too Many Requests')}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message || t('errors.rateLimit.message', 'You\'ve made too many requests from this IP address. Please wait a moment and try again.')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleRetry}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" />
          {t('common.retry', 'Retry')}
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/'}
          variant="default"
        >
          {t('common.goHome', 'Go Home')}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        {t('errors.rateLimit.help', 'If this problem persists, please contact support.')}
      </p>
    </div>
  );
};

import React from 'react';
import { FolderX, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface NoCategoryFoundProps {
  categoryName?: string;
  onGoBack?: () => void;
  className?: string;
}

export const NoCategoryFound: React.FC<NoCategoryFoundProps> = ({ 
  categoryName,
  onGoBack,
  className = "" 
}) => {
  const { t } = useTranslation();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <FolderX className="h-8 w-8 text-orange-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('errors.noCategory.title', 'Category Not Found')}
      </h3>
      
      <p className="text-gray-600 mb-2 max-w-md">
        {categoryName 
          ? t('errors.noCategory.messageWithName', 'The category "{{categoryName}}" could not be found.', { categoryName })
          : t('errors.noCategory.message', 'The requested category could not be found.')
        }
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        {t('errors.noCategory.suggestion', 'It may have been removed or renamed.')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleGoBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {t('common.goBack', 'Go Back')}
        </Button>
        
        <Link to="/categories">
          <Button 
            variant="default"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {t('categories.viewAll', 'View All Categories')}
          </Button>
        </Link>
      </div>
      
      <div className="mt-6">
        <Link to="/products">
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            {t('common.browseProducts', 'Browse All Products')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

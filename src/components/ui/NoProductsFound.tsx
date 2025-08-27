import React from 'react';
import { Search, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

/**
 * NoProductsFound Component
 * 
 * A reusable component for displaying when no products are found or when there are API errors.
 * 
 * Usage examples:
 * 
 * // Basic usage
 * <NoProductsFound type="no-results" />
 * 
 * // With custom title and description
 * <NoProductsFound 
 *   type="error" 
 *   title="Custom Error Title" 
 *   description="Custom error description"
 *   onRetry={() => refetch()}
 * />
 * 
 * // With clear filters action
 * <NoProductsFound 
 *   type="no-results" 
 *   onClearFilters={() => clearAllFilters()}
 * />
 * 
 * // Specialized variants
 * <NoSearchResults onClearFilters={() => clearSearch()} />
 * <ProductsError onRetry={() => refetch()} />
 * <ProductsLoading />
 * <EmptyProducts />
 */

interface NoProductsFoundProps {
  type?: 'no-results' | 'error' | 'loading' | 'empty';
  title?: string;
  description?: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
  showSearchIcon?: boolean;
  className?: string;
}

export function NoProductsFound({
  type = 'no-results',
  title,
  description,
  onRetry,
  onClearFilters,
  showSearchIcon = true,
  className = ''
}: NoProductsFoundProps) {
  const { t } = useTranslation();

  const getDefaultContent = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: title || t('common.error'),
          description: description || t('errors.failedToLoadProducts'),
          action: onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          )
        };
      
      case 'loading':
        return {
          icon: <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />,
          title: title || t('common.loading'),
          description: description || t('common.loadingProducts'),
          action: null
        };
      
      case 'empty':
        return {
          icon: <Package className="h-12 w-12 text-gray-400" />,
          title: title || t('products.noProducts'),
          description: description || t('products.noProductsAvailable'),
          action: null
        };
      
      case 'no-results':
      default:
        return {
          icon: showSearchIcon ? <Search className="h-12 w-12 text-gray-400" /> : <Package className="h-12 w-12 text-gray-400" />,
          title: title || t('searchBar.noResults'),
          description: description || t('searchBar.noResultsDescription'),
          action: onClearFilters && (
            <Button onClick={onClearFilters} variant="outline" className="mt-4">
              {t('searchBar.clearFilters')}
            </Button>
          )
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4">
        {content.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-600 max-w-md mb-6">
        {content.description}
      </p>
      
      {content.action && (
        <div className="flex flex-col sm:flex-row gap-3">
          {content.action}
        </div>
      )}
    </div>
  );
}

// Specialized variants for common use cases
export function NoSearchResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <NoProductsFound
      type="no-results"
      showSearchIcon={true}
      onClearFilters={onClearFilters}
    />
  );
}

export function ProductsError({ onRetry }: { onRetry?: () => void }) {
  return (
    <NoProductsFound
      type="error"
      onRetry={onRetry}
    />
  );
}

export function ProductsLoading() {
  return (
    <NoProductsFound
      type="loading"
    />
  );
}

export function EmptyProducts() {
  return (
    <NoProductsFound
      type="empty"
    />
  );
}

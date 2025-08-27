import React from 'react';
import { Search, AlertCircle, RefreshCw, Package, Filter, X, Info, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  suggestions?: string[];
}

export function NoProductsFound({
  type = 'no-results',
  title,
  description,
  onRetry,
  onClearFilters,
  showSearchIcon = true,
  className = '',
  suggestions = []
}: NoProductsFoundProps) {
  const { t } = useTranslation();

  const getDefaultContent = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-500 drop-shadow-lg" />,
          title: title || t('common.error'),
          description: description || t('errors.failedToLoadProducts'),
          bgGradient: 'from-red-50 to-orange-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          action: onRetry && (
            <Button onClick={onRetry} variant="default" className="mt-6 bg-red-600 hover:bg-red-700 text-white shadow-lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          ),
          suggestions: t('noResults.errorSuggestions', { returnObjects: true }) as string[]
        };
      
      case 'loading':
        return {
          icon: <RefreshCw className="h-16 w-16 text-blue-500 animate-spin drop-shadow-lg" />,
          title: title || t('common.loading'),
          description: description || t('common.loadingProducts'),
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          action: null,
          suggestions: []
        };
      
      case 'empty':
        return {
          icon: <Package className="h-16 w-16 text-gray-500 drop-shadow-lg" />,
          title: title || t('products.noProducts'),
          description: description || t('products.noProductsAvailable'),
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          action: null,
          suggestions: t('noResults.emptySuggestions', { returnObjects: true }) as string[]
        };
      
      case 'no-results':
      default:
        return {
          icon: showSearchIcon ? <Search className="h-16 w-16 text-purple-500 drop-shadow-lg" /> : <Package className="h-16 w-16 text-purple-500 drop-shadow-lg" />,
          title: title || t('searchBar.noResults'),
          description: description || t('searchBar.noResultsDescription'),
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100',
          action: onClearFilters && (
            <Button onClick={onClearFilters} variant="default" className="mt-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
              <Filter className="h-4 w-4 mr-2" />
              {t('searchBar.clearFilters')}
            </Button>
          ),
          suggestions: t('noResults.noResultsSuggestions', { returnObjects: true }) as string[]
        };
    }
  };

  const content = getDefaultContent();
  const finalSuggestions = suggestions.length > 0 ? suggestions : content.suggestions;

  return (
    <div className={`w-full ${className}`}>
      <Card className={`border-2 ${content.borderColor} shadow-lg overflow-hidden`}>
        <div className={`bg-gradient-to-br ${content.bgGradient} p-8`}>
          <div className="flex flex-col items-center justify-center text-center">
            {/* Icon with background */}
            <div className={`${content.iconBg} rounded-full p-4 mb-6 shadow-inner`}>
              {content.icon}
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {content.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 max-w-lg mb-6 leading-relaxed">
              {content.description}
            </p>
            
            {/* Action Button */}
            {content.action && (
              <div className="mb-6">
                {content.action}
              </div>
            )}
            
            {/* Suggestions */}
            {finalSuggestions.length > 0 && (
              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{t('noResults.suggestions')}</span>
                </div>
                <div className="space-y-2">
                  {finalSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Info Badge */}
            <div className="mt-6">
              <Badge variant="secondary" className="bg-white/80 text-gray-600 border border-gray-200">
                <Info className="h-3 w-3 mr-1" />
                {t('noResults.needHelp')}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
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

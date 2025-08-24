import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Star, StarHalf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    [key: number]: number;
  };
}

interface ReviewHoverCardProps {
  productId: number;
  children: React.ReactNode;
  stats?: ReviewStats;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rating, 
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const halfFilled = rating >= star - 0.5 && rating < star;
        
        return (
          <div key={star} className={sizeClasses[size]}>
            {halfFilled ? (
              <StarHalf className="text-yellow-400 fill-current" />
            ) : (
              <Star className={`${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ReviewHoverCard: React.FC<ReviewHoverCardProps> = ({ 
  productId, 
  children, 
  stats 
}) => {
  const { t } = useTranslation();

  if (!stats || stats.totalReviews === 0) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-6 sticky top-0 z-[1000]" 
        align="start" 
        sideOffset={5}
        side="top"
        avoidCollisions={true}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <StarRating rating={stats.averageRating} size="md" />
              </div>
              <span className="font-semibold text-xl leading-none">{stats.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600 text-sm">({stats.totalReviews} {t('products.reviews')})</span>
          </div>

          {/* Rating Distribution */}
          {stats.ratingDistribution && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Rating Distribution</h4>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution![star] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-center font-medium">{star}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-600 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Stats */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('reviews.averageRating')}</span>
                <span className="font-medium text-gray-900">{stats.averageRating.toFixed(1)} / 5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('reviews.totalReviews')}</span>
                <span className="font-medium text-gray-900">{stats.totalReviews}</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('reviews.hoverCardMessage')}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

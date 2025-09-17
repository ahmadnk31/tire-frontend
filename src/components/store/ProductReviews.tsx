import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reviewsApi, uploadApi, getCurrentUserId } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Star, StarHalf, Upload, X, ThumbsUp, MessageCircle, Image as ImageIcon, Camera } from 'lucide-react';
import { ImageDropzone } from '@/components/ui/image-dropzone';

interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  images: string[];
}

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onRatingChange?: (rating: number) => void }> = ({ 
  rating, 
  size = 'md', 
  interactive = false, 
  onRatingChange 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      setCurrentRating(value);
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || currentRating) : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayRating >= star;
        const halfFilled = displayRating >= star - 0.5 && displayRating < star;
        
        return (
          <button
            key={star}
            type="button"
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
              filled ? 'text-yellow-400' : halfFilled ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
          >
            {halfFilled ? (
              <StarHalf className={sizeClasses[size]} fill="currentColor" />
            ) : (
              <Star className={sizeClasses[size]} fill={filled ? 'currentColor' : 'none'} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const ReviewForm: React.FC<{ 
  productId: number; 
  productName: string; 
  onSuccess: () => void; 
  onCancel: () => void;
  existingReview?: Review;
}> = ({ productId, productName, onSuccess, onCancel, existingReview }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string; originalName: string }[]>(
    existingReview?.images?.map((image, index) => ({
      imageUrl: image,
      originalName: `Review image ${index + 1}`
    })) || []
  );

  // Handle image upload - upload to S3 first, then store URLs
  const handleImageUpload = async (files: File[]): Promise<{ imageUrl: string; originalName: string }[]> => {
    try {
      console.log('📤 Uploading images for review:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Show processing toast
      toast({
        title: t('reviews.uploadingImage'),
        description: t('reviews.uploadingImageDesc', { fileName: files[0].name }),
      });
      
      // Upload images to S3 first
      const response = await uploadApi.multiple(files, 'reviews');
      
      // Handle both response structures for backward compatibility
      const results = response.files || response.results || [];
      
      if (!Array.isArray(results)) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from upload server');
      }
      
      const uploadResults = results.map((result: any) => ({
        imageUrl: result.imageUrl,
        originalName: result.originalName
      }));
      
      console.log('✅ Images uploaded successfully:', uploadResults);
      
      // Show success toast
      toast({
        title: t('reviews.uploadSuccess'),
        description: t('reviews.uploadSuccessDesc', { fileName: files[0].name }),
      });
      
      setUploadedImages(prev => [...prev, ...uploadResults]);
      return uploadResults;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      
      // Show error toast
      toast({
        title: t('reviews.uploadFailed'),
        description: t('reviews.uploadFailedDesc', { 
          fileName: files[0]?.name || 'unknown', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }),
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('🚀 [FRONTEND] createReviewMutation called with:', { data, token: !!token });
      return reviewsApi.createReview(data, token);
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', productId] });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(['reviews', productId]);

      // Optimistically add the new review
      queryClient.setQueryData(['reviews', productId], (old: any) => {
        if (!old) return old;
        const newReview = {
          id: Date.now(), // Temporary ID
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          isVerifiedPurchase: false,
          helpfulCount: 0,
          createdAt: new Date().toISOString(),
          user: { id: 0, name: 'You' }, // Will be replaced with actual user data
          images: uploadedImages.map(img => img.imageUrl) || [],
          status: 'pending'
        };
        return {
          ...old,
          reviews: [newReview, ...old.reviews],
          stats: {
            ...old.stats,
            totalReviews: old.stats.totalReviews + 1
          }
        };
      });

      return { previousReviews };
    },
    onSuccess: () => {
      toast({
        title: t('reviews.submitted'),
        description: t('reviews.pendingApproval'),
      });
      // Invalidate all review queries for this product
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      onSuccess();
    },
    onError: (error: any, data, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(['reviews', productId], context.previousReviews);
      }

      toast({
        title: t('common.error'),
        description: error.message || t('reviews.submitError'),
        variant: 'destructive',
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: any) => reviewsApi.updateReview(existingReview!.id, data, token),
    onSuccess: () => {
      toast({
        title: t('reviews.updated'),
        description: t('reviews.pendingApproval'),
      });
      // Invalidate all review queries for this product
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('reviews.updateError'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [FRONTEND] Form submission started');
    console.log('📋 [FRONTEND] Form data:', { productId, rating, title, comment, imagesCount: uploadedImages.length, token: !!token });
    console.log('📋 [FRONTEND] Uploaded images:', uploadedImages.map(img => ({
      originalName: img.originalName,
      imageUrl: img.imageUrl.substring(0, 50) + '...'
    })));
    
    if (rating === 0) {
      toast({
        title: t('common.error'),
        description: t('reviews.ratingRequired'),
        variant: 'destructive',
      });
      return;
    }

    // Create review data with image URLs
    const reviewData = {
      productId: productId.toString(),
      rating: rating.toString(),
      title: title || undefined,
      comment: comment || undefined,
      images: uploadedImages.map(img => img.imageUrl) // Send image URLs instead of files
    };

    // Debug: Log review data
    console.log('📦 [FRONTEND] Review data:', reviewData);

    if (existingReview) {
      console.log('🔄 [FRONTEND] Updating existing review');
      updateReviewMutation.mutate({ ...reviewData, reviewId: existingReview.id });
    } else {
      console.log('✨ [FRONTEND] Creating new review');
      createReviewMutation.mutate(reviewData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {existingReview ? t('reviews.editReview') : t('reviews.writeReview')}
        </h3>
        <p className="text-sm text-gray-600">
          {existingReview 
            ? t('reviews.editReviewDesc') 
            : t('reviews.writeReviewDesc')
          }
        </p>
      </div>

      <div>
        <Label className="text-base font-medium">{t('reviews.rating')}</Label>
        <div className="mt-2">
          <StarRating 
            rating={rating} 
            size="lg" 
            interactive 
            onRatingChange={setRating}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="text-base font-medium">
          {t('reviews.reviewTitle')} ({t('common.optional')})
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('reviews.reviewTitlePlaceholder')}
          className="mt-2"
          maxLength={255}
        />
      </div>

      <div>
        <Label htmlFor="comment" className="text-base font-medium">
          {t('reviews.comment')} ({t('common.optional')})
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviews.commentPlaceholder')}
          className="mt-2 min-h-[120px]"
          maxLength={1000}
        />
      </div>

      <div>
        <Label className="text-base font-medium">
          {t('reviews.photos')} ({t('common.optional')})
        </Label>
        <ImageDropzone
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          maxFiles={5}
          maxSize={5 * 1024 * 1024} // 5MB
          multiple={true}
          folder="reviews"
          existingImages={existingReview?.images?.map((image, index) => ({
            imageUrl: image,
            altText: `Review image ${index + 1}`
          })) || []}
          className="mt-2"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
          className="flex-1"
        >
          {createReviewMutation.isPending || updateReviewMutation.isPending ? (
            t('common.loading')
          ) : existingReview ? (
            t('reviews.updateReview')
          ) : (
            t('reviews.submitReview')
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
};

const ReviewItem: React.FC<{ 
  review: Review; 
  onHelpful: (reviewId: number) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  currentUserId?: number;
}> = ({ review, onHelpful, onEdit, onDelete, currentUserId }) => {
  const { t } = useTranslation();
  const [showAllImages, setShowAllImages] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isCheckingVote, setIsCheckingVote] = useState(true);
  const token = localStorage.getItem('token');

  // Check if user has already voted for this review
  const { data: voteData } = useQuery({
    queryKey: ['review-helpful-check', review.id],
    queryFn: () => reviewsApi.checkHelpful(review.id, token),
    enabled: !!token,
  });

  // Update vote state when data changes
  useEffect(() => {
    if (voteData) {
      setHasVoted(voteData.hasVoted);
      setIsCheckingVote(false);
    }
  }, [voteData]);

  // Handle error case
  useEffect(() => {
    if (!token) {
      setIsCheckingVote(false);
    }
  }, [token]);

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold">
              {review.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.user.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <StarRating rating={review.rating} size="sm" />
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              {review.isVerifiedPurchase && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {t('reviews.verifiedPurchase')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
      )}

      {review.images.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-2 ${
            showAllImages ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
          }`}>
            {review.images.slice(0, showAllImages ? review.images.length : 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-32 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                onClick={() => window.open(image, '_blank')}
              />
            ))}
          </div>
          {review.images.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllImages(!showAllImages)}
              className="mt-2"
            >
              {showAllImages ? t('reviews.showLess') : t('reviews.showMore')}
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button
            onClick={() => onHelpful(review.id)}
            disabled={isCheckingVote}
            className={`flex items-center gap-1 transition-colors ${
              hasVoted 
                ? 'text-primary hover:text-primary/80' 
                : isCheckingVote 
                  ? 'text-gray-400 cursor-wait'
                  : 'text-gray-500 hover:text-primary'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
            {hasVoted ? t('reviews.unhelpful') : t('reviews.helpful')} ({review.helpfulCount})
            {hasVoted && <span className="text-xs">• {t('reviews.voted')}</span>}
          </button>
        </div>
        
        {/* Edit/Delete buttons for review owner */}
        {currentUserId && review.user.id === currentUserId && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
                
              >
                {t('common.edit')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(review.id)}
                
              >
                {t('common.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['reviews', productId, sortBy, selectedRating, page],
    queryFn: () => {
      console.log('🔍 Fetching reviews for product:', productId);
      return reviewsApi.getProductReviews(productId, {
        sort: sortBy,
        rating: selectedRating,
        page,
        limit: 10
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (reviewsData) {
      console.log('✅ Reviews fetched successfully:', reviewsData);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching reviews:', error);
    }
  }, [error]);

  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.markHelpful(reviewId, token || undefined),
    onMutate: async (reviewId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', productId, sortBy, selectedRating, page] });
      await queryClient.cancelQueries({ queryKey: ['review-helpful-check', reviewId] });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(['reviews', productId, sortBy, selectedRating, page]);
      const previousVoteCheck = queryClient.getQueryData(['review-helpful-check', reviewId]);

      // Optimistically update the reviews
      queryClient.setQueryData(['reviews', productId, sortBy, selectedRating, page], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.map((review: any) => 
            review.id === reviewId 
              ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
              : review
          )
        };
      });

      // Optimistically update the vote check
      queryClient.setQueryData(['review-helpful-check', reviewId], { hasVoted: true });

      return { previousReviews, previousVoteCheck };
    },
    onSuccess: () => {
      toast({
        title: t('reviews.thankYou'),
        description: t('reviews.helpfulRecorded'),
      });
    },
    onError: (error: any, reviewId, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(['reviews', productId, sortBy, selectedRating, page], context.previousReviews);
      }
      if (context?.previousVoteCheck) {
        queryClient.setQueryData(['review-helpful-check', reviewId], context.previousVoteCheck);
      }

      if (error?.message?.includes('already marked')) {
        toast({
          title: t('reviews.alreadyVoted'),
          description: t('reviews.helpfulAlreadyVoted'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('reviews.helpfulError'),
          variant: 'destructive',
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['reviews', productId, sortBy, selectedRating, page] });
      queryClient.invalidateQueries({ queryKey: ['review-helpful-check'] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId, token || undefined),
    onSuccess: () => {
      toast({
        title: t('reviews.deleted'),
        description: t('reviews.deleteSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', productId, sortBy, selectedRating, page] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('reviews.deleteError'),
        variant: 'destructive',
      });
    },
  });

  const unmarkHelpfulMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.unmarkHelpful(reviewId, token || undefined),
    onMutate: async (reviewId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', productId, sortBy, selectedRating, page] });
      await queryClient.cancelQueries({ queryKey: ['review-helpful-check', reviewId] });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(['reviews', productId, sortBy, selectedRating, page]);
      const previousVoteCheck = queryClient.getQueryData(['review-helpful-check', reviewId]);

      // Optimistically update the reviews
      queryClient.setQueryData(['reviews', productId, sortBy, selectedRating, page], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.map((review: any) => 
            review.id === reviewId 
              ? { ...review, helpfulCount: Math.max(0, (review.helpfulCount || 0) - 1) }
              : review
          )
        };
      });

      // Optimistically update the vote check
      queryClient.setQueryData(['review-helpful-check', reviewId], { hasVoted: false });

      return { previousReviews, previousVoteCheck };
    },
    onSuccess: () => {
      toast({
        title: t('reviews.voteRemoved'),
        description: t('reviews.helpfulVoteRemoved'),
      });
    },
    onError: (error: any, reviewId, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(['reviews', productId, sortBy, selectedRating, page], context.previousReviews);
      }
      if (context?.previousVoteCheck) {
        queryClient.setQueryData(['review-helpful-check', reviewId], context.previousVoteCheck);
      }

      toast({
        title: t('common.error'),
        description: t('reviews.helpfulError'),
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['reviews', productId, sortBy, selectedRating, page] });
      queryClient.invalidateQueries({ queryKey: ['review-helpful-check'] });
    },
  });

  const handleHelpful = (reviewId: number) => {
    // Check if user has already voted for this review
    const hasVoted = queryClient.getQueryData(['review-helpful-check', reviewId]) as any;
    
    if (hasVoted?.hasVoted) {
      // User has voted, so remove the vote
      unmarkHelpfulMutation.mutate(reviewId);
    } else {
      // User hasn't voted, so add the vote
      markHelpfulMutation.mutate(reviewId);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate(reviewToDelete);
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const clearFilters = () => {
    setSelectedRating(null);
    setSortBy('newest');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('reviews.loadError')}</p>
      </div>
    );
  }

  const { reviews, stats, pagination } = reviewsData || { reviews: [], stats: { averageRating: 0, totalReviews: 0 }, pagination: { totalPages: 0 } };
  
  // Count user's reviews for this product
  const userReviewsCount = token ? reviews.filter(review => review.user.id === getCurrentUserId()).length : 0;

  return (
    <div className="space-y-6">
      {/* Debug info */}

      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t('reviews.title')} ({stats.totalReviews})
          </h3>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Number(stats.averageRating) || 0} size="md" />
              <span className="text-gray-600 text-sm sm:text-base">
                {(Number(stats.averageRating) || 0).toFixed(1)} {t('reviews.outOf')} 5
              </span>
            </div>
          )}
        </div>
        
        {token ? (
          <div className="flex flex-col gap-2">
            <Dialog 
              open={showReviewForm} 
              onOpenChange={setShowReviewForm}
            >
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t('reviews.writeReview')}</span>
                  <span className="sm:hidden">Review</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('reviews.writeReviewFor')} {productName}</DialogTitle>
                </DialogHeader>
                <ReviewForm
                  productId={productId}
                  productName={productName}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                  existingReview={editingReview}
                />
              </DialogContent>
            </Dialog>
            <p className="text-xs text-gray-500 text-center sm:text-left">
              💡 {t('reviews.multipleReviewsHint')}
            </p>
            {userReviewsCount > 0 && (
              <p className="text-xs text-accent-600 text-center sm:text-left">
                📝 {t('reviews.yourReviewsCount', { count: userReviewsCount })}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center p-3 sm:p-4 bg-accent-50 border border-accent-200 rounded-lg w-full sm:w-auto">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600 mx-auto mb-2" />
            <p className="text-sm text-accent-800 font-medium mb-2">
              {t('reviews.loginToReview')}
            </p>
            <p className="text-xs text-accent-600 mb-3">
              {t('reviews.loginToReviewDesc')}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-accent-600 border-accent-300 hover:bg-accent-50 w-full sm:w-auto"
              onClick={() => navigate('/login')}
            >
              {t('common.login')}
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm font-medium">{t('reviews.sortBy')}:</Label>
          <Select onValueChange={(value) => setSortBy(value)} defaultValue={sortBy}>
            <SelectTrigger className="w-full sm:w-[180px] text-sm">
              <SelectValue placeholder={t('reviews.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('reviews.newest')}</SelectItem>
              <SelectItem value="oldest">{t('reviews.oldest')}</SelectItem>
              <SelectItem value="rating">{t('reviews.highestRating')}</SelectItem>
              <SelectItem value="helpful">{t('reviews.mostHelpful')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm font-medium">{t('reviews.filterBy')}:</Label>
          <div className="flex flex-wrap gap-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                className={`px-2 py-1 text-xs sm:text-sm rounded min-w-[2rem] ${
                  selectedRating === rating
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        {(selectedRating !== null || sortBy !== 'newest') && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
            {t('common.clear')}
          </Button>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onHelpful={() => handleHelpful(review.id)}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              currentUserId={getCurrentUserId()}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {stats.totalReviews === 0 ? t('reviews.noReviews') : t('reviews.noMatchingReviews')}
          </h3>
          <p className="text-gray-500 mb-4">
            {stats.totalReviews === 0 
              ? t('reviews.beFirstToReview')
              : t('reviews.tryDifferentFilters')
            }
          </p>
          {token ? (
            stats.totalReviews === 0 && (
              <Button onClick={() => setShowReviewForm(true)}>
                {t('reviews.writeFirstReview')}
              </Button>
            )
          ) : (
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md mx-auto">
              <MessageCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-800 font-medium mb-1">
                {t('reviews.loginToReview')}
              </p>
              <p className="text-xs text-orange-600 mb-3">
                {t('reviews.loginToReviewDesc')}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                onClick={() => navigate('/login')}
              >
                {t('common.login')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            {t('common.previous')}
          </Button>
          
          <span className="text-sm text-gray-600">
            {t('common.page')} {page} {t('common.of')} {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('reviews.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">{t('reviews.deleteConfirm')}</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={cancelDelete}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

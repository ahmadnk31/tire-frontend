

import React from 'react';
import { WishlistCard } from '@/components/store/WishlistCard';
import { WishlistSkeleton } from '@/components/ui/skeletons';
import { ReviewHoverCard } from '@/components/ui/review-hover-card';
import { productsApi, reviewsApi } from '@/lib/api';
import { wishlistApi } from '@/lib/wishlistApi';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Wishlist = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Wishlist query
  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return wishlistApi.getWishlist(token);
    },
    enabled: !!token,
  });

  // Products query (fetch all product details in parallel)
  const productIds = wishlistData?.wishlist?.map((item: any) => item.productId) || [];
  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      return Promise.all(productIds.map((id: number) => productsApi.getById(id.toString())));
    },
    enabled: productIds.length > 0,
  });

  // Fetch review stats for all products
  const {
    data: reviewStatsData,
  } = useQuery({
    queryKey: ['wishlist-review-stats', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      const stats = await Promise.all(
        productIds.map(async (id: number) => {
          try {
            const stats = await reviewsApi.getReviewStats(id);
            return { [id]: stats.stats };
          } catch (error) {
            return { [id]: null };
          }
        })
      );
      return stats.reduce((acc, stat) => ({ ...acc, ...stat }), {});
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Cart state (local only for now)
  const [cart, setCart] = React.useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!token) throw new Error('Not authenticated');
      await wishlistApi.removeFromWishlist(productId, token);
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      toast({ 
        title: t('wishlist.itemRemoved'), 
        description: t('wishlist.itemRemovedSuccessfully')
      });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('errors.wishlistError'), variant: 'destructive' });
    },
  });

  // Add to cart logic (local only)
  const addToCart = (product: any) => {
    const newCart = [...cart];
    const existingIdx = newCart.findIndex((item: any) => item.id === product.id && item.size === product.size);
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      let imageUrl = '';
      if (Array.isArray(product.images) && product.images.length > 0) {
        if (typeof product.images[0] === 'string') {
          imageUrl = product.images[0];
        } else if (product.images[0] && product.images[0].imageUrl) {
          imageUrl = product.images[0].imageUrl;
        }
      } else if (Array.isArray(product.productImages) && product.productImages.length > 0 && product.productImages[0].imageUrl) {
        imageUrl = product.productImages[0].imageUrl;
      }
      newCart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price),
        imageUrl: imageUrl || '/placeholder.svg',
        size: product.size,
        quantity: 1,
      });
    }
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event('cart-updated'));
    toast({
      title: t('products.addToCart'),
      description: t('products.productAdded'),
    });
  };

  // Update cart quantity logic (local only)
  const updateCartQuantity = (product: any, delta: number) => {
    const newCart = [...cart];
    const idx = newCart.findIndex((item: any) => item.id === product.id && item.size === product.size);
    if (idx > -1) {
      newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCart(newCart);
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  // Remove from wishlist handler
  const handleRemoveFromWishlist = (productId: number) => {
    removeMutation.mutate(productId);
  };

  // Show skeleton while loading
  if (isLoading || productsLoading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('wishlist.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('wishlist.description')}
          </p>
        </div>

        {/* Content */}
        {isError ? (
          <div className="text-center text-red-500 py-8">
            {(error as any)?.message || 'Failed to load wishlist'}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('wishlist.empty')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('wishlist.noItems')}
              </p>
              <button
                onClick={() => window.location.href = '/products'}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('wishlist.browseProducts')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const cartItem = cart.find((item: any) => item.id === product.id && item.size === product.size);
              const reviewStats = reviewStatsData?.[product.id];
              
              return (
                <div key={product.id} className="h-full">
                  <WishlistCard
                    product={product}
                    cartItem={cartItem}
                    addToCart={() => addToCart(product)}
                    updateCartQuantity={delta => updateCartQuantity(product, delta)}
                    onRemoveFromWishlist={() => handleRemoveFromWishlist(product.id)}
                    onClick={() => window.location.href = `/products/${product.id}`}
                    reviewStats={reviewStats}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

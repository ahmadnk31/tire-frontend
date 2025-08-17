

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductCard } from '@/components/store/ProductCard';
import { WishlistSkeleton } from '@/components/ui/skeletons';

import { productsApi } from '@/lib/api';
import { wishlistApi } from '@/lib/wishlistApi';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const Wishlist = () => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      toast({ title: 'Removed from Wishlist', description: 'Product removed from your wishlist.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' });
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
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12">
      <Card className="w-full max-w-5xl shadow-xl border border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Wishlist</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Your saved products</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || productsLoading ? (
            <div className="text-center py-8 text-primary animate-pulse">Loading...</div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8">{(error as any)?.message || 'Failed to load wishlist'}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No wishlist items found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any) => {
                const cartItem = cart.find((item: any) => item.id === product.id && item.size === product.size);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItem={cartItem}
                    addToCart={() => addToCart(product)}
                    updateCartQuantity={delta => updateCartQuantity(product, delta)}
                    isWishlisted={true}
                    onToggleWishlist={() => handleRemoveFromWishlist(product.id)}
                    onClick={() => window.location.href = `/products/${product.id}`}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wishlist;

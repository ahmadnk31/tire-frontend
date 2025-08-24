import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi, reviewsApi, getCurrentUserId } from '@/lib/api';
import { wishlistApi } from '@/lib/wishlistApi';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/store/ProductCard';
import { CategoriesSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  subcategories: string[];
}

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: string;
  comparePrice?: string;
  rating: string;
  reviews: number;
  stock: number;
  featured: boolean;
  images?: Array<string | { imageUrl: string }>;
  productImages?: Array<{ imageUrl: string }>;
  saleStartDate?: string;
  saleEndDate?: string;
  isOnSale?: boolean;
}

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // Initialize cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Fetch wishlist data
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: async () => {
      if (!token) return { wishlist: [] };
      const res = await wishlistApi.getWishlist(token);
      return res;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local wishlist state when data changes
  useEffect(() => {
    if (wishlistData?.wishlist) {
      setWishlist(wishlistData.wishlist.map((item: any) => item.productId));
    }
  }, [wishlistData]);

  // Fetch real categories data
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Helper function for category subcategories based on real data
  function getCategorySubcategories(categoryName: string): string[] {
    // Use real subcategories based on the category name
    const subcategoryMap: { [key: string]: string[] } = {
      'summer tires': ['Performance', 'Touring', 'High Performance'],
      'winter tires': ['Studded', 'Studless', 'Performance Winter'],
      'all-season tires': ['Touring', 'Performance', 'SUV'],
      'performance tires': ['Ultra High Performance', 'High Performance', 'Track'],
      'truck tires': ['Light Truck', 'Heavy Duty', 'Commercial'],
      'motorcycle tires': ['Sport', 'Touring', 'Cruiser', 'Off-Road']
    };
    return subcategoryMap[categoryName.toLowerCase()] || ['General'];
  }

  const categories: Category[] = (Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [])?.map((category: any) => ({
    id: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
    name: category.name,
    description: category.description || `${category.name} tires`,
    image: category.image || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center`,
    productCount: category.productCount || 0,
    subcategories: getCategorySubcategories(category.name)
  })) || [];

  // Fetch products for selected category
  const { data: categoryProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', selectedCategory],
    queryFn: () => selectedCategory ? productsApi.getCategoryProducts(selectedCategory) : Promise.resolve({ products: [] }),
    enabled: !!selectedCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch review stats for products
  const productIds = categoryProductsData?.products?.map((p: any) => p.id) || [];
  const { data: reviewStatsData } = useQuery({
    queryKey: ['category-review-stats', productIds],
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

  // Wishlist mutation with optimistic updates
  const wishlistMutation = useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: number, isWishlisted: boolean }) => {
      console.log('🔍 [Categories] Mutation function called with:', { productId, isWishlisted });
      if (!token) throw new Error('Not authenticated');
      
      try {
        if (isWishlisted) {
          console.log('🔍 [Categories] Removing from wishlist...');
          await wishlistApi.removeFromWishlist(productId, token);
          console.log('🔍 [Categories] Successfully removed from wishlist');
        } else {
          console.log('🔍 [Categories] Adding to wishlist...');
          await wishlistApi.addToWishlist(productId, token);
          console.log('🔍 [Categories] Successfully added to wishlist');
        }
        return { productId, isWishlisted };
      } catch (error) {
        console.error('🔍 [Categories] Error in mutation function:', error);
        throw error;
      }
    },
    onMutate: async ({ productId, isWishlisted }) => {
      console.log('🔍 [Categories] onMutate called with:', { productId, isWishlisted });
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', token] });
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist', token]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['wishlist', token], (old: any) => {
        if (!old?.wishlist) return old;
        
        if (isWishlisted) {
          // Remove from wishlist
          return {
            ...old,
            wishlist: old.wishlist.filter((item: any) => item.productId !== productId)
          };
        } else {
          // Add to wishlist
          return {
            ...old,
            wishlist: [...old.wishlist, { productId, userId: getCurrentUserId(), createdAt: new Date().toISOString() }]
          };
        }
      });
      
      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    onSuccess: (data) => {
      console.log('🔍 [Categories] onSuccess called with:', data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      
      // Show success toast
      if (data?.isWishlisted) {
        toast({ 
          title: t('wishlist.itemRemoved'), 
          description: t('wishlist.itemRemovedSuccessfully')
        });
      } else {
        toast({ 
          title: t('wishlist.itemAdded'), 
          description: t('wishlist.itemAddedSuccessfully')
        });
      }
    },
    onError: (err, variables, context) => {
      console.error('🔍 [Categories] onError called with:', err, variables, context);
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', token], context.previousWishlist);
      }
      toast({ 
        title: t('common.error'), 
        description: t('errors.wishlistError'), 
        variant: 'destructive' 
      });
    },
  });

  const handleToggleWishlist = (productId: number) => {
    console.log('🔍 [Categories] handleToggleWishlist called with productId:', productId);
    console.log('🔍 [Categories] Token exists:', !!token);
    console.log('🔍 [Categories] Current wishlist state:', wishlist);
    
    if (!token) {
      console.log('🔍 [Categories] No token, redirecting to login');
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToAddWishlist'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    const isWishlisted = wishlist.includes(productId);
    console.log('🔍 [Categories] Toggling wishlist for product', productId, 'isWishlisted:', isWishlisted);
    
    try {
      wishlistMutation.mutate({ productId, isWishlisted });
      console.log('🔍 [Categories] Mutation triggered successfully');
    } catch (error) {
      console.error('🔍 [Categories] Error triggering mutation:', error);
    }
  };

  // Add to cart function
  const addToCart = (product: Product) => {
    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Increment quantity if product already exists
      newCart[existingItemIndex].quantity += 1;
    } else {
      // Get product image
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
      
      // Add new product to cart
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
      title: t('cart.addedToCart'),
      description: t('cart.itemAddedSuccessfully'),
    });
  };

  // Update cart quantity function
  const updateCartQuantity = (product: Product, delta: number) => {
    const newCart = [...cart];
    const itemIndex = newCart.findIndex((item: any) => item.id === product.id);
    
    if (itemIndex !== -1) {
      newCart[itemIndex].quantity = Math.max(1, newCart[itemIndex].quantity + delta);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCart(newCart);
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const products: Product[] = categoryProductsData?.products?.map((product: any) => ({
    id: Number(product.id),
    name: product.name,
    brand: product.brand,
    model: product.model || '',
    size: product.size || '',
    price: product.price || '0',
    comparePrice: product.comparePrice,
    rating: product.rating || '0',
    reviews: product.reviews || 0,
    stock: product.stock || 0,
    featured: product.featured || false,
    images: product.images || product.productImages || [],
    productImages: product.productImages || [],
    saleStartDate: product.saleStartDate,
    saleEndDate: product.saleEndDate,
    isOnSale: product.comparePrice ? Number(product.comparePrice) > Number(product.price) : false
  })) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          <CategoriesSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {t('common.errorLoading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('categories.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('categories.description')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories.map(category => (
            <div
              key={category.id}
              className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
            >
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {category.productCount} {t('categories.products')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.subcategories.map(sub => (
                    <span key={sub} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {sub}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {t('categories.subcategories')}: {category.subcategories.length}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Section */}
        {selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('categories.productsIn')} {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsLoading ? (
                // Loading skeleton for products
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-4 space-y-2">
                      <div className="bg-gray-200 h-4 rounded"></div>
                      <div className="bg-gray-200 h-6 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {t('categories.noProducts')}
                  </p>
                </div>
              ) : (
                products.map(product => {
                  const isWishlisted = wishlist.includes(product.id);
                  const cartItem = cart.find((item: any) => item.id === product.id);
                  
                  console.log('🔍 [Categories] Rendering ProductCard for product:', product.id, 'isWishlisted:', isWishlisted);
                  
                  return (
                    <div key={product.id} className="h-full">
                      <ProductCard
                        product={product}
                        onClick={() => navigate(`/products/${product.id}`)}
                        isWishlisted={isWishlisted}
                        onToggleWishlist={() => handleToggleWishlist(product.id)}
                        cartItem={cartItem}
                        addToCart={() => addToCart(product)}
                        updateCartQuantity={(delta) => updateCartQuantity(product, delta)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {t('categories.browseAll')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-primary font-bold text-lg">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                <span className="text-xs text-gray-500">{category.productCount} {t('categories.products')}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

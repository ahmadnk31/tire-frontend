import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { productsApi } from "@/lib/api";
import { wishlistApi } from "@/lib/wishlistApi";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./ProductCard";


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
  status: string;
  featured: boolean;
  sku: string;
  slug?: string;
  tags: string[] | null;
  images?: Array<string | { imageUrl: string }>;
  productImages?: Array<{ imageUrl: string }>;
  showAllButton?: boolean; // Optional prop to show "View All" button
  // Sale fields
  saleStartDate?: string;
  saleEndDate?: string;
  isOnSale?: boolean;
}

export const ProductGrid = ({ sectionTitle = "Products", featuredOnly = false, showAllButton = false }: { sectionTitle?: string; featuredOnly?: boolean; showAllButton?: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cart, setCart] = React.useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 24; // Increased from 6 to 24 products per page
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Get query params from React Router
  const query: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  console.log('ProductGrid query params:', query); // Debug log


  // Products query
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ['products', query, featuredOnly],
    queryFn: async () => {
      let response;
      if (featuredOnly) {
        response = await productsApi.getFeatured();
      } else {
        // Remove invalid/empty query params
        const validQuery: Record<string, string> = {};
        Object.entries(query).forEach(([key, value]) => {
          if (value && value !== 'undefined' && value !== 'false' && value !== '') {
            validQuery[key] = value;
          }
        });
        const apiParams = { status: 'published', limit: 500, ...validQuery }; // Increased from 100 to 500 products
        response = await productsApi.getAll(apiParams);
      }
      return response.products || [];
    },
    staleTime: 0, // Force fresh data for testing images
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (was cacheTime in v4)
  });

  // Wishlist query
  const {
    data: wishlistData,
    isLoading: wishlistLoading,
  } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await wishlistApi.getWishlist(token);
      return res.wishlist ? res.wishlist.map((w: any) => w.productId) : [];
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // Wishlist stays fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: number, isWishlisted: boolean }) => {
      if (!token) return;
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId, token);
      } else {
        await wishlistApi.addToWishlist(productId, token);
      }
      return { productId, isWishlisted };
    },
    onSuccess: (data) => {
      // Invalidate both wishlist queries to ensure all wishlist pages update
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      
      // Show success toast
      if (data?.isWishlisted) {
        toast({ 
          title: t('wishlist.itemRemoved'), 
          description: t('wishlist.itemRemoved') 
        });
      } else {
        toast({ 
          title: t('wishlist.itemAdded'), 
          description: t('wishlist.itemAdded') 
        });
      }
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('errors.wishlistError'), variant: 'destructive' });
    },
  });

  // Sync cart state with localStorage changes (e.g. from other tabs/pages)
  React.useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem('cart');
      setCart(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);



  const addToCart = (product: Product) => {
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



  if (productsLoading || wishlistLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded"></div>
            <div className="h-3 sm:h-4 w-48 sm:w-72 bg-gray-200 rounded"></div>
          </div>
          {showAllButton && (
            <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-200 rounded-lg"></div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-2 md:gap-4 xl:gap-6">
          {/* Responsive skeleton items - show different amounts based on screen size */}
          {[...Array(12)].map((_, index) => (
            <div 
              key={index} 
              className={`bg-white border border-gray-200 rounded-xl p-3 sm:p-4 ${
                // Hide excess items on smaller screens to match grid layout
                index >= 4 ? 'hidden xxl:block' : 
                index >= 3 ? 'hidden lg:block' : 
                index >= 2 ? 'hidden sm:block' : ''
              }`}
            >
              <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-8 sm:h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Filter products if featuredOnly is true
  const products = productsData || [];
  const wishlist = Array.isArray(wishlistData)
    ? wishlistData
    : wishlistData && Array.isArray(wishlistData.wishlist)
      ? wishlistData.wishlist.map((w: any) => w.productId)
      : [];
  const displayProducts = featuredOnly ? products.filter(p => p.featured) : products;

  return (
    <section className=" bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 lg:mb-3">{sectionTitle}</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 ">{t('products.allProducts')}</p>
          </div>
            {showAllButton && (
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="px-6 py-3 border-2 border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl font-medium flex items-center justify-center"
            >
              <span className="hidden sm:inline">{t('products.viewAll')}</span>
              <span className="sm:hidden">
              <ArrowRightIcon className="w-5 h-5" />
              </span>
            </Button>
            )}
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-2 md:gap-4 xl:gap-6">
          {displayProducts
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((product, index) => {
              const cartItem = cart.find((item: any) => item.id === product.id && item.size === product.size);
              const isWishlisted = wishlist.includes(product.id);
              const handleToggleWishlist = () => {
                if (!token) return;
                wishlistMutation.mutate({ productId: product.id, isWishlisted });
              };
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={cartItem}
                  onClick={() => {
                    if (product.slug) {
                      navigate(`/products/${product.slug}`);
                    } else if (typeof product.id === 'number' && Number.isFinite(product.id) && !isNaN(product.id)) {
                      navigate(`/products/${product.slug || product.id}`);
                    } else {
                      console.warn('[ProductGrid] Tried to navigate to invalid product id:', product.id);
                    }
                  }}
                  addToCart={() => {
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
                      title: "Added to Cart",
                      description: `${product.name} has been added to your cart.`,
                    });
                  }}
                  updateCartQuantity={delta => {
                    const newCart = [...cart];
                    const idx = newCart.findIndex((item: any) => item.id === product.id && item.size === product.size);
                    if (idx > -1) {
                      newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
                      localStorage.setItem('cart', JSON.stringify(newCart));
                      setCart(newCart);
                      window.dispatchEvent(new Event('cart-updated'));
                    }
                  }}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={handleToggleWishlist}
                />
              );
            })}
        </div>
        {/* Pagination Controls */}
        {products.length > pageSize && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="font-medium text-lg">
              Page {currentPage} of {Math.ceil(products.length / pageSize)}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === Math.ceil(products.length / pageSize)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
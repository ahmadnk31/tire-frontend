import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { productsApi } from "@/lib/api";
import { wishlistApi } from "@/lib/wishlistApi";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/skeletons";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: string;
  rating: string;
  reviews: number;
  stock: number;
  status: string;
  featured: boolean;
  sku: string;
  tags: string[] | null;
  images?: Array<string | { imageUrl: string }>;
  productImages?: Array<{ imageUrl: string }>;
  showAllButton?: boolean; // Optional prop to show "View All" button
}

export const ProductGrid = ({ sectionTitle = "Products", featuredOnly = false, showAllButton = false }: { sectionTitle?: string; featuredOnly?: boolean; showAllButton?: boolean }) => {
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
  const pageSize = 6;
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
        const apiParams = { status: 'published', limit: 100, ...validQuery };
        response = await productsApi.getAll(apiParams);
      }
      return response.products || [];
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' });
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
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };



  if (productsLoading || wishlistLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-72 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(featuredOnly ? 3 : 6)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
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
            <p className="text-sm md:text-base lg:text-lg text-gray-600 ">Top-rated tyres chosen by our experts</p>
          </div>
            {showAllButton && (
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="px-6 py-3 border-2 border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl font-medium flex items-center justify-center"
            >
              <span className="hidden sm:inline">View All Products</span>
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
                    if (typeof product.id === 'number' && Number.isFinite(product.id) && !isNaN(product.id)) {
                      navigate(`/products/${product.id}`);
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
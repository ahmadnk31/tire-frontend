import { useState, useRef, useEffect } from "react";
import { productsApi } from "@/lib/api";
import { wishlistApi } from "@/lib/wishlistApi";
import { ProductCard } from "./ProductCard";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductGridSkeleton } from "@/components/ui/skeletons";
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { NoProductsFound } from '@/components/ui/NoProductsFound';

interface TodaysForYouSectionProps {
  sectionTitle?: string;
}

export const TodaysForYouSection = ({
  sectionTitle,
}: TodaysForYouSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Categories query
  const { data: categoriesData = { categories: [] }, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });
  const categories = categoriesData.categories || [];

  // Set default selected category on categories load
  if (categories.length > 0 && !selectedCategory) {
    setSelectedCategory(categories[0].name);
    setSelectedCategorySlug(categories[0].slug || "");
  }

  // Products query
  const { data: productsData = { products: [] }, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategorySlug],
    queryFn: () => {
      const params = selectedCategorySlug
        ? { category: selectedCategorySlug, status: "published", limit: 12 }
        : { status: "published", limit: 12 };
      return productsApi.getAll(params);
    },
    enabled: !!selectedCategorySlug || categories.length === 0,
    staleTime: 0, // Force fresh data for testing images
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
  const products = productsData.products || [];

  // Wishlist query
  const { data: wishlistData = { wishlist: [] }, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: () => token ? wishlistApi.getWishlist(token) : Promise.resolve({ wishlist: [] }),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // Wishlist stays fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  const wishlist = wishlistData.wishlist ? wishlistData.wishlist.map((w: any) => w.productId) : [];

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
      toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' });
    },
  });

  const handleToggleWishlist = (productId: number) => {
    const isWishlisted = wishlist.includes(productId);
    wishlistMutation.mutate({ productId, isWishlisted });
  };

  // Responsive/toggle tab logic
  const handleCategoryClick = (cat: any) => {
    if (selectedCategory === cat.name) {
      setSelectedCategory("");
      setSelectedCategorySlug("");
    } else {
      setSelectedCategory(cat.name);
      setSelectedCategorySlug(cat.slug || "");
    }
  };



  // Cart state sync
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    setCart(stored ? JSON.parse(stored) : []);
    const handler = () => {
      const stored = localStorage.getItem("cart");
      setCart(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addToCart = (product: any) => {
    const newCart = [...cart];
    const existingIdx = newCart.findIndex(
      (item: any) => item.id === product.id && item.size === product.size
    );
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      let imageUrl = "";
      if (Array.isArray(product.images) && product.images.length > 0) {
        if (typeof product.images[0] === "string") {
          imageUrl = product.images[0];
        } else if (product.images[0] && product.images[0].imageUrl) {
          imageUrl = product.images[0].imageUrl;
        }
      } else if (
        Array.isArray(product.productImages) &&
        product.productImages.length > 0 &&
        product.productImages[0].imageUrl
      ) {
        imageUrl = product.productImages[0].imageUrl;
      }
      newCart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price),
        imageUrl: imageUrl || "/placeholder.svg",
        size: product.size,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const updateCartQuantity = (product: any, delta: number) => {
    const newCart = [...cart];
    const idx = newCart.findIndex(
      (item: any) => item.id === product.id && item.size === product.size
    );
    if (idx > -1) {
      newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const getCartItem = (product: any) => {
    return cart.find((item: any) => item.id === product.id && item.size === product.size);
  };

  // Update URL query param for filtering
  // Do not update URL or global state when filtering; keep filter local to section

  // The backend already filters products by category, so we don't need additional filtering
  const filteredProducts = products;

  // Carousel scroll logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 280; // px per click - adjusted for mobile
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Show skeleton while loading
  if (categoriesLoading || productsLoading || wishlistLoading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Title skeleton */}
            <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 rounded mb-4 sm:mb-6"></div>
            
            {/* Category tabs skeleton */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex-shrink-0 h-7 sm:h-8 md:h-10 w-14 sm:w-16 md:w-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Products carousel skeleton */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-hidden">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className={`flex-shrink-0 min-w-[280px] sm:min-w-[320px] md:min-w-[360px] lg:min-w-[400px] max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-md bg-white border border-gray-200 rounded-xl p-2 sm:p-3 md:p-4 ${
                    // Show fewer items on smaller screens
                    index >= 3 ? 'hidden lg:block' : 
                    index >= 2 ? 'hidden md:block' : ''
                  }`}
                >
                  <div className="w-full h-32 sm:h-36 md:h-40 lg:h-48 bg-gray-200 rounded-lg mb-2 sm:mb-3 md:mb-4"></div>
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                    <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 sm:h-5 md:h-6 w-16 sm:w-18 md:w-20 bg-gray-200 rounded"></div>
                      <div className="h-3 sm:h-4 w-12 sm:w-14 md:w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-7 sm:h-8 md:h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {sectionTitle || t('products.todaysForYou')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
              style={{ display: filteredProducts.length > 0 ? 'block' : 'none' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={scrollRight}
              className="bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
              style={{ display: filteredProducts.length > 0 ? 'block' : 'none' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg border text-sm sm:text-base font-medium transition-colors focus:outline-none whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat.name
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex  overflow-x-auto pb-2 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {productsLoading || wishlistLoading ? (
              <div className="text-center text-gray-500 w-full">
                <ProductGridSkeleton 
        sectionTitle={sectionTitle} 
        itemCount={4} 
      />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="w-full flex justify-center">
                <NoProductsFound 
                  type="no-results"
                  title={t('products.noProductsForYou')}
                  description={t('products.noProductsForYou')}
                  className="max-w-md"
                />
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div key={product.id} className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] lg:min-w-[400px] max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-md flex-shrink-0 px-1 sm:px-2 py-2">
                    <ProductCard
                      product={product}
                      cartItem={getCartItem(product)}
                      addToCart={() => addToCart(product)}
                      updateCartQuantity={(delta) => updateCartQuantity(product, delta)}
                      isWishlisted={isWishlisted}
                      onToggleWishlist={() => handleToggleWishlist(product.id)}
                      onClick={() => navigate(`/products/${product.slug || product.id}`)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};



import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { wishlistApi } from "@/lib/wishlistApi";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { Star, Heart, ChevronLeft, ChevronRight, X, ShoppingCart, Zap, Plus, Minus } from "lucide-react";
import { formatEuro } from "@/lib/currency";
import { ProductCard } from "@/components/store/ProductCard";
import { RichTextEditor } from "@/components/ui/rich-text-editor";


export default function ProductPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageTransition, setImageTransition] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  // Touch state for swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // TanStack Query for product
  const {
    data: product,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Product data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // TanStack Query for related products
  const {
    data: relatedProductsData,
  } = useQuery({
    queryKey: ["relatedProducts", id],
    queryFn: () => productsApi.getRelated(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Related products stay fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
  const relatedProducts = relatedProductsData?.products || [];

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // Check if product is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", token],
    queryFn: () => wishlistApi.getWishlist(token!),
    enabled: isLoggedIn,
    staleTime: 2 * 60 * 1000, // Wishlist stays fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Derive wishlist state directly from query data
  const isWishlisted = useMemo(() => {
    if (!wishlistData?.wishlist || !product) return false;
    return wishlistData.wishlist.some((item: any) => item.productId === product.id);
  }, [wishlistData?.wishlist, product?.id]);

  // Support both array of image URLs and array of image objects, and productImages from API
  let productImages: string[] = [];
  if (Array.isArray(product?.images) && product.images.length > 0) {
    if (typeof product.images[0] === 'string') {
      productImages = product.images;
    } else if (product.images[0] && product.images[0].imageUrl) {
      productImages = product.images.map((img: any) => img.imageUrl);
    }
  } else if (Array.isArray(product?.productImages) && product.productImages.length > 0) {
    productImages = product.productImages.map((img: any) => img.imageUrl);
  }
  // Fallback: if no images, use a placeholder
  if (!productImages || productImages.length === 0) {
    productImages = ["/placeholder.svg"];
  }

  // Add to Cart functionality
  const addToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      // Check if product with same id and size already exists
      const existingIdx = cart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
      
      if (existingIdx > -1) {
        cart[existingIdx].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: productImages[0],
          size: selectedSize,
          quantity: quantity,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      
      toast({
        title: t('products.addToCart'),
        description: t('products.productAdded'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.cartError'),
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy Now functionality
  const buyNow = async () => {
    if (!product) return;
    
    try {
      // Add to cart first
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIdx = cart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
      
      if (existingIdx > -1) {
        cart[existingIdx].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: productImages[0],
          size: selectedSize,
          quantity: quantity,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      
      // Navigate directly to checkout
      navigate('/checkout');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.checkoutError'),
        variant: "destructive",
      });
    }
  };

  // Wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: number, isWishlisted: boolean }) => {
      if (!token) throw new Error('Not authenticated');
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId, token);
      } else {
        await wishlistApi.addToWishlist(productId, token);
      }
      return { productId, isWishlisted };
    },
    onSuccess: (data) => {
      // Invalidate both wishlist queries to ensure all wishlist pages update
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
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

  // Wishlist functionality
  const toggleWishlist = async () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToAddWishlist'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    wishlistMutation.mutate({ productId: product.id, isWishlisted });
  };
  const rating = Number(product?.rating) || 0;
  const reviewCount = product?.reviews || 0;

  const nextImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImage((prev) => (prev + 1) % productImages.length);
      setImageTransition(false);
    }, 200);
  };

  const prevImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
      setImageTransition(false);
    }, 200);
  };

  // Touch handlers for swipe (main carousel)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextImage(); // swipe left
        } else {
          prevImage(); // swipe right
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Touch handlers for swipe (fullscreen modal)
  const fsTouchStartX = useRef<number | null>(null);
  const fsTouchEndX = useRef<number | null>(null);
  const handleFsTouchStart = (e: React.TouchEvent) => {
    fsTouchStartX.current = e.touches[0].clientX;
  };
  const handleFsTouchMove = (e: React.TouchEvent) => {
    fsTouchEndX.current = e.touches[0].clientX;
  };
  const handleFsTouchEnd = () => {
    if (fsTouchStartX.current !== null && fsTouchEndX.current !== null) {
      const diff = fsTouchStartX.current - fsTouchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextImage(); // swipe left
        } else {
          prevImage(); // swipe right
        }
      }
    }
    fsTouchStartX.current = null;
    fsTouchEndX.current = null;
  };

 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Skeleton loader for Product Page */}
          <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-12 animate-pulse">
            {/* Left: Image carousel skeleton */}
            <div className="xl:col-span-3 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
              {/* Thumbnails */}
              <div className="flex lg:flex-col flex-row gap-2 lg:gap-3 items-center justify-center py-2 overflow-x-auto lg:overflow-x-visible">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
              {/* Main image */}
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-2xl aspect-square w-full" />
              </div>
            </div>
            {/* Right: Product details skeleton */}
            <div className="flex flex-col xl:col-span-2">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-4 sm:gap-6">
                <div>
                  <div className="h-6 sm:h-8 w-2/3 bg-gray-200 rounded mb-3" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="w-20 sm:w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-24 sm:w-32 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="w-24 sm:w-32 h-4 bg-gray-200 rounded" />
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 flex flex-col gap-2">
                  <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 sm:h-10 w-12 sm:w-16 bg-gray-200 rounded-xl" />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded mb-4" />
                  <div className="flex items-center border border-gray-300 rounded-lg w-24 sm:w-32">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 rounded" />
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 rounded mx-2" />
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-full h-10 sm:h-12 bg-gray-200 rounded-xl" />
                  <div className="w-full h-10 sm:h-12 bg-gray-200 rounded-xl" />
                </div>
                <div className="flex justify-center gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="w-24 sm:w-32 h-5 sm:h-6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
          {/* Tabs skeleton */}
          <div className="w-full mt-8 sm:mt-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-screen-2xl mx-auto">
              <div className="flex border-b border-gray-100">
                <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 w-full">
                <div className="space-y-4 sm:space-y-6 w-full">
                  <div>
                    <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gray-200 rounded mb-3 sm:mb-4" />
                    <div className="h-3 sm:h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-3 sm:h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                  <div>
                    <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Related products skeleton */}
            <div className="mt-12 sm:mt-16">
              <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 rounded mb-4 sm:mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3 sm:gap-4">
                    <div className="h-32 sm:h-40 bg-gray-200 rounded-lg mb-2" />
                    <div className="h-5 sm:h-6 w-2/3 bg-gray-200 rounded" />
                    <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-4 sm:h-5 w-1/3 bg-gray-200 rounded" />
                    <div className="h-8 sm:h-10 w-full bg-gray-200 rounded-xl mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">{(error as any)?.message || t('errors.productNotFound')}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Fullscreen Modal rendered at root level, outside main grid */}
        {fullscreen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onTouchStart={handleFsTouchStart}
            onTouchMove={handleFsTouchMove}
            onTouchEnd={handleFsTouchEnd}
          >
            <button
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full"
              onClick={() => setFullscreen(false)}
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
            <button
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full disabled:opacity-50"
              onClick={prevImage}
              disabled={productImages.length <= 1 || selectedImage === 0}
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </button>
            <img
              src={productImages[selectedImage]}
              alt="Fullscreen product"
              className={`max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${imageTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              onError={e => (e.currentTarget.src = "/placeholder.svg")}
              draggable={false}
            />
            <button
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full disabled:opacity-50"
              onClick={nextImage}
              disabled={productImages.length <= 1 || selectedImage === productImages.length - 1}
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-12">
          {/* Responsive Image Carousel */}
          <div className="relative xl:col-span-3 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            {/* Thumbnails: horizontal on mobile, vertical on desktop */}
            {productImages.length > 1 && (
              <div
                className="flex lg:flex-col flex-row gap-2 lg:gap-3 items-center justify-center py-2 overflow-x-auto lg:overflow-x-visible"
                ref={thumbnailsRef}
              >
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    onMouseEnter={() => setSelectedImage(idx)}
                    className={`border-2 rounded-lg overflow-hidden w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-200 focus:outline-none flex-shrink-0 ${selectedImage === idx ? 'border-black ring-2 ring-primary' : 'border-gray-200 hover:border-primary'}`}
                    style={{ background: '#fff', minWidth: '3rem', minHeight: '3rem' }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Main Image Carousel with swipe */}
            <div className="flex-1 relative">
              <div
                className="relative bg-white rounded-2xl overflow-hidden aspect-square group touch-pan-x"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  src={productImages[selectedImage]} 
                  alt="Main product image" 
                  className={`w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105 cursor-zoom-in select-none ${imageTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  onClick={() => setFullscreen(true)}
                  onError={e => (e.currentTarget.src = "/placeholder.svg")}
                  draggable={false}
                />
                {/* Image overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {/* Navigation Chevrons - Bottom Right (hide on mobile) */}
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 hidden sm:flex gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={prevImage}
                    className="p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={productImages.length <= 1 || selectedImage === 0}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={productImages.length <= 1 || selectedImage === productImages.length - 1}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>



          {/* Right Side - Product Details */}
          <div className="flex flex-col xl:col-span-2">
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 flex-1">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${product.stock && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {product.stock && product.stock > 0 ? `${product.stock} ${t('products.inStock')}` : t('products.outOfStock')}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="font-medium ml-1">{rating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviewCount} {t('products.reviews')})</span>
                  </div>
                </div>
                {product.brand && (
                  <div className="text-sm text-gray-600">
                    {t('products.brand')}: <span className="font-medium text-gray-800">{product.brand}</span>
                  </div>
                )}
              </div>
              

              {/* Price Section */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">{formatEuro(product.price)}</span>
                  {product.comparePrice && (
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg text-gray-500 line-through">{formatEuro(product.comparePrice)}</span>
                      <span className="text-xs sm:text-sm font-semibold text-red-500 bg-red-100 px-2 py-1 rounded-full">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-base sm:text-lg">{t('products.selectSize')}</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t('products.sizeGuide')}</button>
                  </div>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 font-medium transition-all duration-200 text-sm sm:text-base ${
                          selectedSize === size 
                            ? 'bg-black text-white border-black shadow-lg transform scale-105' 
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-base sm:text-lg">{t('products.quantity')}</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 sm:px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= (product.stock || 99)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {(!product.stock || product.stock === 0) && (
                  <div className="w-full py-3 sm:py-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <span className="text-red-600 font-semibold text-sm sm:text-base">{t('products.currentlyOutOfStock')}</span>
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{t('products.temporarilyUnavailable')}</p>
                  </div>
                )}
                <button 
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-primary transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  onClick={buyNow}
                  disabled={!product.stock || product.stock === 0}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('products.buyNow')} - {formatEuro(product.price * quantity)}
                </button>
                <button
                  className="w-full py-3 sm:py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  onClick={addToCart}
                  disabled={isAddingToCart || !product.stock || product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isAddingToCart ? t('common.loading') : t('products.addToCart')}
                </button>
              </div>

              {/* Social Actions */}
              <div className="flex justify-center gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-gray-100">
                <button 
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  onClick={toggleWishlist}
                  disabled={wishlistMutation.isPending}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="font-medium hidden sm:inline">
                    {wishlistMutation.isPending ? t('common.loading') : isWishlisted ? t('products.removeFromWishlist') : t('products.addToWishlist')}
                  </span>
                  <span className="font-medium sm:hidden">
                    {wishlistMutation.isPending ? t('common.loading') : isWishlisted ? t('common.remove') : t('navigation.wishlist')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        


      {/* Related Products Section */}
      
      </div>

    {/* Product Details Tabs - now truly full width below grid */}
    <div className="w-full mt-8 sm:mt-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-screen-2xl mx-auto">
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-200 text-sm sm:text-base ${
              activeTab === 'description'
                ? 'border-b-3 border-black text-black bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50/50 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('description')}
          >
            {t('products.description')}
          </button>
          <button
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-200 text-sm sm:text-base ${
              activeTab === 'specifications'
                ? 'border-b-3 border-black text-black bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50/50 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('specifications')}
          >
            {t('products.specifications')}
          </button>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 w-full">
          {activeTab === "description" && (
            <div className="space-y-4 sm:space-y-6 w-full">
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-gray-900">{t('products.productDetails')}</h3>
                <RichTextEditor
                  value={product.description || ''}
                  onChange={() => {}} // Read-only, no changes allowed
                  className="border-0 shadow-none bg-transparent"
                  readOnly={true}
                />
              </div>
              {product.features && (
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-3 text-gray-900">{t('products.keyFeatures')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Array.isArray(product.features) ? product.features : typeof product.features === 'string' ? product.features.split(',').map(f => f.trim()).filter(f => f) : []).map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "specifications" && (
            <div className="space-y-6 w-full">
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-4 text-gray-900">{t('products.specifications')}</h3>
                
                {/* Basic Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t('products.brand')}</span>
                        <span className="text-gray-900 font-semibold capitalize">{product.brand}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t('products.model')}</span>
                        <span className="text-gray-900 font-semibold">{product.model}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t('products.size')}</span>
                        <span className="text-gray-900 font-semibold">{product.size}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">SKU</span>
                        <span className="text-gray-900 font-semibold">{product.sku}</span>
                      </div>
                    </div>
                  </div>
                  

                </div>

                {/* Performance Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2">Performance Ratings</h4>
                    <div className="space-y-3">
                      {product.speedRating && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">{t('products.speedRating')}</span>
                          <span className="text-gray-900 font-semibold">{product.speedRating}</span>
                        </div>
                      )}
                      {product.loadIndex && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">{t('products.loadIndex')}</span>
                          <span className="text-gray-900 font-semibold">{product.loadIndex}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2">Tire Classification</h4>
                    <div className="space-y-3">
                      {product.seasonType && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">{t('products.seasonType')}</span>
                          <span className="text-gray-900 font-semibold capitalize">{product.seasonType}</span>
                        </div>
                      )}
                      {product.tireType && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">{t('products.tireType')}</span>
                          <span className="text-gray-900 font-semibold capitalize">{product.tireType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Specifications */}
                {product.specifications && typeof product.specifications === 'object' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2">Additional Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(product.specifications).map(([key, value]) => {
                        if (value && typeof value === 'string' && value.trim() !== '') {
                          return (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-gray-900 font-semibold">{value}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h4 className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
       
       
      </div>
       
      {relatedProducts.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('products.relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((related) => {
                // Cart logic for related products
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const cartItem = cart.find((item: any) => item.id === related.id && item.size === related.size);
                return (
                  <ProductCard
                    key={related.id}
                    product={{
                      ...related,
                      price: formatEuro(related.price)
                    }}
                    onClick={() => navigate(`/products/${related.id}`)}
                    cartItem={cartItem}
                    addToCart={() => {
                      const newCart = [...cart];
                      const existingIdx = newCart.findIndex((item: any) => item.id === related.id && item.size === related.size);
                      if (existingIdx > -1) {
                        newCart[existingIdx].quantity += 1;
                      } else {
                        let imageUrl = '';
                        if (Array.isArray(related.images) && related.images.length > 0) {
                          if (typeof related.images[0] === 'string') {
                            imageUrl = related.images[0];
                          } else if (related.images[0] && related.images[0].imageUrl) {
                            imageUrl = related.images[0].imageUrl;
                          }
                        } else if (Array.isArray(related.productImages) && related.productImages.length > 0 && related.productImages[0].imageUrl) {
                          imageUrl = related.productImages[0].imageUrl;
                        }
                        newCart.push({
                          id: related.id,
                          name: related.name,
                          brand: related.brand,
                          price: parseFloat(related.price),
                          imageUrl: imageUrl || '/placeholder.svg',
                          size: related.size,
                          quantity: 1,
                        });
                      }
                      localStorage.setItem('cart', JSON.stringify(newCart));
                      window.dispatchEvent(new Event('cart-updated'));
                      toast({
                        title: t('products.addToCart'),
                        description: t('products.productAdded'),
                      });
                    }}
                    updateCartQuantity={(delta) => {
                      const newCart = [...cart];
                      const idx = newCart.findIndex((item: any) => item.id === related.id && item.size === related.size);
                      if (idx > -1) {
                        newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
                        localStorage.setItem('cart', JSON.stringify(newCart));
                        window.dispatchEvent(new Event('cart-updated'));
                        toast({
                          title: t('cart.cartUpdated'),
                          description: t('cart.cartUpdated'),
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
        </div>
      )}
      </div>
      </div>
  </div>
  
  );
}
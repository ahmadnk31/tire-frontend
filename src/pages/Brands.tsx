import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, ChevronRight, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, reviewsApi, getCurrentUserId } from '@/lib/api';
import { wishlistApi } from '@/lib/wishlistApi';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/store/ProductCard';

interface Brand {
  id: string;
  name: string;
  originalName: string;
  logo: string;
  description: string;
  country: string;
  founded: number;
  productCount: number;
  rating: number;
  reviewCount: number;
  categories: string[];
  isPremium: boolean;
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
  slug?: string;
  images?: Array<string | { imageUrl: string }>;
  productImages?: Array<{ imageUrl: string }>;
  saleStartDate?: string;
  saleEndDate?: string;
  isOnSale?: boolean;
}

const Brands: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  // Initialize cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const logos={
    'michelin': 'https://logos-world.net/wp-content/uploads/2020/09/Michelin-Logo-2017-present.jpg',
    'bridgestone': 'https://bpando.org/wp-content/uploads/New-Bridgestone-Logo-Design-2011-BPO.jpg',
    'continental': 'https://continentaltire.com/themes/custom/nextcontinental/assets/images/Continental_Logo_Social.jpg',
    'goodyear': 'https://www.goodyear.co.in/wp-content/uploads/GoodYear-Tyres.jpg',
    'pirelli': 'https://1000logos.net/wp-content/uploads/2021/04/Pirelli-logo.png',
    'hankook': 'https://www.automotivetestingtechnologyinternational.com/wp-content/uploads/2023/07/Hankook-Logo-1999.png',
    'double star': 'https://kelucktyre.com/u_file/2007/photo/185a4cb981.jpg',
    'rotalla': 'https://cdn.buttercms.com/5RvYx5AVS9qnaHY9Nlbz',
    'ovation': 'https://eshop.tireworld.co.ke/media/manufacturers/Ovation-Tyres-Logo.webp',
    'tracmax': 'https://www.tyrecenter.net/wp-content/uploads/2020/12/New-Project-1.jpg',
    'windforce': 'https://ik.imagekit.io/ntvz9dezi1x/blog/windforce-logo.png',
    "headway": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3pm5I-aR6QDAcIj5ZHTUpouU2VTK80MNi8Lsaskagov8-vsvEcsxIpNzgFB_UxPJC8z4&usqp=CAU",
    "dextero": "https://tirehungry.com/wp-content/uploads/2023/05/Dextero-Review.png",
    "leao": "https://leao-tyres.com/sites/default/files/default_images/Leao%20logo.png"
  }

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

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

  // Fetch real brands data
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productsApi.getBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const brands: Brand[] = brandsData?.brands?.map((brandData: any) => ({
    id: brandData.brand.toLowerCase().replace(/\s+/g, '-'),
    name: brandData.brand,
    originalName: brandData.brand, // Keep original name for API calls
    logo: logos[brandData.brand.toLowerCase()] || `/brand-logos/${brandData.brand.toLowerCase().replace(/\s+/g, '-')}.png`, // Use actual logo URLs
    country: getBrandCountry(brandData.brand),
    founded: getBrandFounded(brandData.brand),
    productCount: brandData.productCount,
    rating: 4.5, // Default rating since not available in current schema
    reviewCount: 0, // Not available in current schema
    categories: getBrandCategories(brandData.brand),
    isPremium: isPremiumBrand(brandData.brand)
  })) || [];

  // Fetch products for selected brand
  const { data: brandProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['brand-products', selectedBrand],
    queryFn: () => {
      if (!selectedBrand) return Promise.resolve({ products: [] });
      // Find the brand by ID to get the original name
      const selectedBrandData = brands.find(b => b.id === selectedBrand);
      if (!selectedBrandData) return Promise.resolve({ products: [] });
      return productsApi.getBrandProducts(selectedBrandData.originalName);
    },
    enabled: !!selectedBrand,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch review stats for products
  const productIds = brandProductsData?.products?.map((p: any) => p.id) || [];
  const { data: reviewStatsData } = useQuery({
    queryKey: ['brand-review-stats', productIds],
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
      if (!token) throw new Error('Not authenticated');
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId, token);
      } else {
        await wishlistApi.addToWishlist(productId, token);
      }
      return { productId, isWishlisted };
    },
    onMutate: async ({ productId, isWishlisted }) => {
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
    if (!token) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToAddWishlist'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    const isWishlisted = wishlist.includes(productId);
    wishlistMutation.mutate({ productId, isWishlisted });
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

  // Helper functions for brand data
  function getBrandCountry(brand: string): string {
    const countryMap: { [key: string]: string } = {
      'michelin': 'France',
      'bridgestone': 'Japan',
      'continental': 'Germany',
      'goodyear': 'USA',
      'pirelli': 'Italy',
      'hankook': 'South Korea',
      'double star': 'China',
      'rotalla': 'China',
      'ovation': 'China',
      'tracmax': 'China',
      "windforce": "USA",
      "headway": "USA",
      "dextero": "USA",
      "leao": "China"
    };
    return countryMap[brand.toLowerCase()] || 'Unknown';
  }

  function getBrandFounded(brand: string): number {
    const foundedMap: { [key: string]: number } = {
      'michelin': 1889,
      'bridgestone': 1931,
      'continental': 1871,
      'goodyear': 1898,
      'pirelli': 1872,
      'hankook': 1941,
      'double star': 1996,
      'rotalla': 1996,
      'ovation': 1996,
      'tracmax': 1996,
      'windforce': 1996,
      'headway': 1996,
      'dextero': 1993,
      'leao': 1996
    };
    return foundedMap[brand.toLowerCase()] || 1900;
  }

  function getBrandCategories(brand: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      'michelin': ['Summer Tires', 'Winter Tires', 'All-Season', 'Truck Tires'],
      'bridgestone': ['Summer Tires', 'Winter Tires', 'All-Season', 'Motorcycle'],
      'continental': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'goodyear': ['Summer Tires', 'Winter Tires', 'All-Season', 'Truck Tires'],
      'pirelli': ['Summer Tires', 'Performance', 'Motorcycle'],
      'hankook': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'double star': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'rotalla': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'ovation': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'tracmax': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'windforce': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'headway': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'dextero': ['Summer Tires', 'Winter Tires', 'All-Season'],
      'leao': ['Summer Tires', 'Winter Tires', 'All-Season']
    };
    return categoryMap[brand.toLowerCase()] || ['Tires'];
  }

  function isPremiumBrand(brand: string): boolean {
    const premiumBrands = ['michelin', 'bridgestone', 'continental', 'goodyear', 'pirelli'];
    return premiumBrands.includes(brand.toLowerCase());
  }

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || brand.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  const sortedBrands = [...filteredBrands].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'products':
        return b.productCount - a.productCount;
      case 'founded':
        return a.founded - b.founded;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const filteredProducts = brandProductsData?.products?.map((product: any) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    model: product.model,
    size: product.size,
    price: product.price,
    comparePrice: product.comparePrice,
    rating: product.rating,
    reviews: product.reviews,
    stock: product.stock,
    featured: product.featured,
    slug: product.slug,
    images: product.images,
    productImages: product.productImages,
    saleStartDate: product.saleStartDate,
    saleEndDate: product.saleEndDate,
    isOnSale: product.isOnSale,
  })) || [];

  // Check if product is in cart
  const isInCart = (productId: number) => {
    return cart.some(item => item.id === productId);
  };

  // Check if product is wishlisted
  const isWishlisted = (productId: number) => {
    return wishlist.includes(productId);
  };

  const countries = Array.from(new Set(brands.map(brand => brand.country)));

  // Calculate days until sale ends
  const getDaysUntilEnd = (date: string | null) => {
    if (!date) return 0;
    const end = new Date(date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Loading state
  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('brands.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('brands.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-6 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('brands.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('brands.description')}
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
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('brands.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('brands.description')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('brands.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('brands.allCountries')}</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="name">{t('brands.sort.name')}</option>
              <option value="rating">{t('brands.sort.rating')}</option>
              <option value="products">{t('brands.sort.products')}</option>
              <option value="founded">{t('brands.sort.founded')}</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className={`mb-12 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' : 'space-y-4'}`}>
          {sortedBrands.map(brand => (
            <div
              key={brand.id}
              className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                selectedBrand === brand.id ? 'ring-2 ring-primary' : ''
              } ${viewMode === 'list' ? 'flex' : ''}`}
              onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                />
                {brand.isPremium && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      {t('brands.premium')}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {brand.productCount} {t('brands.products')}
                  </span>
                </div>
              </div>
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{brand.rating}</span>
                    <span className="text-sm text-gray-500">({brand.reviewCount})</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {brand.description}
                </p>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span>{brand.country}</span>
                  <span>•</span>
                  <span>{t('brands.founded')} {brand.founded}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {brand.categories.slice(0, 3).map(category => (
                    <span key={category} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {category}
                    </span>
                  ))}
                  {brand.categories.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{brand.categories.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/products?brand=${brand.originalName}`}
                    className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                  >
                    {t('brands.viewProducts')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Section */}
        {selectedBrand && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('brands.productsBy')} {brands.find(b => b.id === selectedBrand)?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => {
                const cartItem = cart.find((item: any) => item.id === product.id);
                return (
                  <div key={product.id} className="h-full min-w-0">
                    <ProductCard
                      product={product}
                      onClick={() => navigate(`/products/${product.slug || product.id}`)}
                      cartItem={cartItem}
                      addToCart={() => addToCart(product)}
                      updateCartQuantity={(delta) => updateCartQuantity(product, delta)}
                      isWishlisted={isWishlisted(product.id)}
                      onToggleWishlist={() => handleToggleWishlist(product.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brand Statistics */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('brands.statistics.title')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{brands.length}</div>
              <div className="text-gray-600">{t('brands.statistics.brands')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {brands.reduce((sum, brand) => sum + brand.productCount, 0)}
              </div>
              <div className="text-gray-600">{t('brands.statistics.products')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {countries.length}
              </div>
              <div className="text-gray-600">{t('brands.statistics.countries')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {brands.filter(b => b.isPremium).length}
              </div>
              <div className="text-gray-600">{t('brands.statistics.premium')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;

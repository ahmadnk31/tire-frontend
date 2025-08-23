import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, Clock, TrendingUp, Sparkles, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { wishlistApi } from '@/lib/wishlistApi';
import { useToast } from '@/hooks/use-toast';
import { addNewArrivalNotification } from '@/lib/notifications';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  arrivalDate: string;
  isNew: boolean;
  isOnSale?: boolean;
  discount?: number;
  features: string[];
  size?: string;
  saleEndDate?: string;
}

const NewArrivals: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch real new arrivals
  const { data: newArrivalsData, isLoading, error } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productsApi.getNewArrivals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products: Product[] = newArrivalsData?.products?.map((product: any) => {
    // Add notification for new arrivals
    addNewArrivalNotification(product.name, product.id);
    
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      originalPrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      image: product.images?.[0]?.imageUrl || product.productImages?.[0]?.imageUrl || '/placeholder.svg',
      rating: Number(product.rating) || 0,
      reviewCount: 0, // Not available in current schema
      category: product.seasonType || 'tires',
      arrivalDate: product.createdAt,
      isNew: true,
      isOnSale: product.isOnSale || (product.comparePrice ? Number(product.comparePrice) > Number(product.price) : false),
      discount: product.comparePrice ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100) : undefined,
      features: typeof product.features === 'string' ? product.features.split(',').map(f => f.trim()) : (Array.isArray(product.features) ? product.features : []),
      size: product.size,
      saleEndDate: product.saleEndDate || null
    };
  }) || [];

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

  const wishlist = wishlistData || [];

  // Calculate days until sale ends
  const getDaysUntilEnd = (date: string | null) => {
    if (!date) return 0;
    const end = new Date(date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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

  // Sync cart state with localStorage changes
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem('cart');
      setCart(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Add to cart functionality
  const addToCart = (product: Product) => {
    const newCart = [...cart];
    const existingIdx = newCart.findIndex((item: any) => item.id === product.id && item.size === product.size);
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      newCart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price.toString()),
        imageUrl: product.image,
        size: product.size || 'default',
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

  // Wishlist functionality
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

  const categories = [
    { id: 'all', name: t('newArrivals.categories.all') },
    { id: 'summer-tires', name: t('newArrivals.categories.summer') },
    { id: 'winter-tires', name: t('newArrivals.categories.winter') },
    { id: 'all-season-tires', name: t('newArrivals.categories.allSeason') },
    { id: 'truck-tires', name: t('newArrivals.categories.truck') },
    { id: 'motorcycle-tires', name: t('newArrivals.categories.motorcycle') }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getDaysSinceArrival = (date: string) => {
    const arrival = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('newArrivals.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('newArrivals.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-6 rounded w-1/2"></div>
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
              {t('newArrivals.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('newArrivals.description')}
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              {t('newArrivals.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('newArrivals.description')}
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold mb-1">{products.length}</div>
              <div className="text-sm opacity-90">{t('newArrivals.stats.newProducts')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {products.filter(p => p.isOnSale).length}
              </div>
              <div className="text-sm opacity-90">{t('newArrivals.stats.onSale')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {Math.max(...products.map(p => getDaysSinceArrival(p.arrivalDate)))}
              </div>
              <div className="text-sm opacity-90">{t('newArrivals.stats.daysSince')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {Array.from(new Set(products.map(p => p.brand))).length}
              </div>
              <div className="text-sm opacity-90">{t('newArrivals.stats.brands')}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('newArrivals.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('newArrivals.sort.date')}</SelectItem>
                <SelectItem value="price-low">{t('newArrivals.sort.priceLow')}</SelectItem>
                <SelectItem value="price-high">{t('newArrivals.sort.priceHigh')}</SelectItem>
                <SelectItem value="rating">{t('newArrivals.sort.rating')}</SelectItem>
                <SelectItem value="name">{t('newArrivals.sort.name')}</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Products Grid */}
        <div className={`mb-12 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {sortedProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full ${viewMode === 'list' ? 'flex-row' : ''}`}>
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                    {t('newArrivals.new')}
                  </span>
                  {product.isOnSale && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      -{product.discount}%
                    </span>
                  )}
                  {/* Sale countdown badge */}
                  {product.saleEndDate && getDaysUntilEnd(product.saleEndDate) > 0 && product.isOnSale && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDaysUntilEnd(product.saleEndDate)}d
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getDaysSinceArrival(product.arrivalDate)}d
                  </span>
                </div>
              </div>
              <div className={`p-4 flex flex-col flex-grow ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary">{product.brand}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      €{product.originalPrice}
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary">
                    €{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-green-600 font-medium">
                      Save €{(product.originalPrice - product.price).toFixed(0)}
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(product.features) && product.features.slice(0, 2).map(feature => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                    {Array.isArray(product.features) && product.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{product.features.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t('newArrivals.addToCart')}
                  </button>
                  <button 
                    onClick={() => handleToggleWishlist(product.id)}
                    className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      wishlist.includes(product.id) ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${
                      wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('newArrivals.newsletter.title')}
              </h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('newArrivals.newsletter.description')}
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('newArrivals.newsletter.placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors">
                {t('newArrivals.newsletter.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;

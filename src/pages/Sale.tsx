import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, Percent, Clock, TrendingDown, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  discount: number;
  isOnSale: boolean;
  saleEndDate?: string;
  features: string[];
  stockLevel: 'high' | 'medium' | 'low';
}

const Sale: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDiscount, setFilterDiscount] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch real sale products
  const { data: saleData, isLoading, error } = useQuery({
    queryKey: ['sale-products'],
    queryFn: () => productsApi.getOnSale(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products: Product[] = saleData?.products?.map((product: any) => ({
    id: product.id.toString(),
    name: product.name,
    brand: product.brand,
    price: Number(product.price),
    originalPrice: product.comparePrice ? Number(product.comparePrice) : Number(product.price),
    image: product.images?.[0]?.imageUrl || product.productImages?.[0]?.imageUrl || '/placeholder.svg',
    rating: Number(product.rating) || 0,
    reviewCount: 0, // Not available in current schema
    category: product.seasonType || 'tires',
    discount: product.comparePrice ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100) : 0,
    isOnSale: true,
    saleEndDate: undefined, // Not available in current schema
    features: product.features || [],
    stockLevel: product.stock > 10 ? 'high' : product.stock > 5 ? 'medium' : 'low'
  })) || [];

  const categories = [
    { id: 'all', name: t('sale.categories.all') },
    { id: 'summer-tires', name: t('sale.categories.summer') },
    { id: 'winter-tires', name: t('sale.categories.winter') },
    { id: 'all-season-tires', name: t('sale.categories.allSeason') },
    { id: 'truck-tires', name: t('sale.categories.truck') },
    { id: 'motorcycle-tires', name: t('sale.categories.motorcycle') }
  ];

  const discountRanges = [
    { id: 'all', name: t('sale.discountRanges.all') },
    { id: '10-20', name: '10-20%' },
    { id: '20-30', name: '20-30%' },
    { id: '30+', name: '30%+' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDiscount = true;
    if (filterDiscount !== 'all') {
      const [min, max] = filterDiscount === '30+' ? [30, 100] : filterDiscount.split('-').map(Number);
      matchesDiscount = product.discount >= min && (max ? product.discount <= max : true);
    }
    
    return matchesCategory && matchesSearch && matchesDiscount;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return b.discount - a.discount;
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

  const getDaysUntilEnd = (date: string) => {
    const end = new Date(date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStockLevelText = (level: string) => {
    switch (level) {
      case 'high': return t('sale.stock.high');
      case 'medium': return t('sale.stock.medium');
      case 'low': return t('sale.stock.low');
      default: return '';
    }
  };

  const totalSavings = products.reduce((sum, product) => sum + (product.originalPrice - product.price), 0);
  const averageDiscount = Math.round(products.reduce((sum, product) => sum + product.discount, 0) / products.length);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('sale.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('sale.description')}
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('sale.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('sale.description')}
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              {t('sale.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('sale.description')}
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold mb-1">{products.length}</div>
              <div className="text-sm opacity-90">{t('sale.stats.products')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">€{totalSavings.toFixed(0)}</div>
              <div className="text-sm opacity-90">{t('sale.stats.totalSavings')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">{averageDiscount}%</div>
              <div className="text-sm opacity-90">{t('sale.stats.averageDiscount')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {Math.min(...products.map(p => getDaysUntilEnd(p.saleEndDate || '')))}
              </div>
              <div className="text-sm opacity-90">{t('sale.stats.daysLeft')}</div>
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
                placeholder={t('sale.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={filterDiscount}
              onChange={(e) => setFilterDiscount(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {discountRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="discount">{t('sale.sort.discount')}</option>
              <option value="price-low">{t('sale.sort.priceLow')}</option>
              <option value="price-high">{t('sale.sort.priceHigh')}</option>
              <option value="rating">{t('sale.sort.rating')}</option>
              <option value="name">{t('sale.sort.name')}</option>
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

        {/* Products Grid */}
        <div className={`mb-12 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {sortedProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    -{product.discount}%
                  </span>
                </div>
                {product.saleEndDate && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDaysUntilEnd(product.saleEndDate)}d
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-1 bg-white text-xs font-medium rounded ${getStockLevelColor(product.stockLevel)}`}>
                    {getStockLevelText(product.stockLevel)}
                  </span>
                </div>
              </div>
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                  <span className="text-sm text-gray-500 line-through">
                    €{product.originalPrice}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    €{product.price}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {t('sale.save')} €{(product.originalPrice - product.price).toFixed(0)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map(feature => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{product.features.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <ShoppingCart className="h-4 w-4" />
                    {t('sale.addToCart')}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sale Countdown */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border border-red-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('sale.countdown.title')}
              </h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('sale.countdown.description')}
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {Math.min(...products.map(p => getDaysUntilEnd(p.saleEndDate || '')))}
                </div>
                <div className="text-sm text-gray-600">{t('sale.countdown.days')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {averageDiscount}%
                </div>
                <div className="text-sm text-gray-600">{t('sale.countdown.averageDiscount')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  €{totalSavings.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">{t('sale.countdown.totalSavings')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sale;

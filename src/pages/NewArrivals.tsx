import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
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
}

const NewArrivals: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const products: Product[] = [
    {
      id: '1',
      name: 'Michelin Pilot Sport 5',
      brand: 'Michelin',
      price: 245.99,
      originalPrice: 289.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      rating: 4.9,
      reviewCount: 89,
      category: 'summer-tires',
      arrivalDate: '2024-11-15',
      isNew: true,
      isOnSale: true,
      discount: 15,
      features: ['Ultra High Performance', 'Wet Grip A', 'Fuel Efficiency B']
    },
    {
      id: '2',
      name: 'Bridgestone Turanza T005',
      brand: 'Bridgestone',
      price: 189.50,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      rating: 4.7,
      reviewCount: 156,
      category: 'all-season-tires',
      arrivalDate: '2024-11-10',
      isNew: true,
      features: ['Touring', 'Comfort', 'Long Life']
    },
    {
      id: '3',
      name: 'Continental WinterContact TS870',
      brand: 'Continental',
      price: 165.00,
      originalPrice: 195.00,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop',
      rating: 4.8,
      reviewCount: 234,
      category: 'winter-tires',
      arrivalDate: '2024-11-08',
      isNew: true,
      isOnSale: true,
      discount: 15,
      features: ['Studless', 'Ice Performance', 'Snow Grip']
    },
    {
      id: '4',
      name: 'Pirelli P Zero PZ4',
      brand: 'Pirelli',
      price: 298.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      rating: 4.9,
      reviewCount: 67,
      category: 'summer-tires',
      arrivalDate: '2024-11-05',
      isNew: true,
      features: ['Ultra High Performance', 'Track Ready', 'Premium Compound']
    },
    {
      id: '5',
      name: 'Goodyear Eagle F1 Asymmetric 6',
      brand: 'Goodyear',
      price: 178.50,
      originalPrice: 220.00,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      rating: 4.6,
      reviewCount: 123,
      category: 'summer-tires',
      arrivalDate: '2024-11-03',
      isNew: true,
      isOnSale: true,
      discount: 19,
      features: ['High Performance', 'Wet Grip A', 'Noise Reduction']
    },
    {
      id: '6',
      name: 'Hankook Ventus V12 evo3',
      brand: 'Hankook',
      price: 145.00,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop',
      rating: 4.5,
      reviewCount: 98,
      category: 'summer-tires',
      arrivalDate: '2024-11-01',
      isNew: true,
      features: ['Performance', 'Value', 'Durability']
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date">{t('newArrivals.sort.date')}</option>
              <option value="price-low">{t('newArrivals.sort.priceLow')}</option>
              <option value="price-high">{t('newArrivals.sort.priceHigh')}</option>
              <option value="rating">{t('newArrivals.sort.rating')}</option>
              <option value="name">{t('newArrivals.sort.name')}</option>
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
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                    {t('newArrivals.new')}
                  </span>
                  {product.isOnSale && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      -{product.discount}%
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
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      €{product.originalPrice}
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary">
                    €{product.price}
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
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    <ShoppingCart className="h-4 w-4" />
                    {t('newArrivals.addToCart')}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="h-4 w-4 text-gray-600" />
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

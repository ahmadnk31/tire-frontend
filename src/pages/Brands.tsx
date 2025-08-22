import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Brand {
  id: string;
  name: string;
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
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
}

const Brands: React.FC = () => {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const brands: Brand[] = [
    {
      id: 'michelin',
      name: 'Michelin',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=100&fit=crop',
      description: t('brands.michelin.description'),
      country: 'France',
      founded: 1889,
      productCount: 156,
      rating: 4.8,
      reviewCount: 2847,
      categories: ['Summer Tires', 'Winter Tires', 'All-Season', 'Truck Tires'],
      isPremium: true
    },
    {
      id: 'bridgestone',
      name: 'Bridgestone',
      logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=100&fit=crop',
      description: t('brands.bridgestone.description'),
      country: 'Japan',
      founded: 1931,
      productCount: 142,
      rating: 4.7,
      reviewCount: 2156,
      categories: ['Summer Tires', 'Winter Tires', 'All-Season', 'Motorcycle'],
      isPremium: true
    },
    {
      id: 'continental',
      name: 'Continental',
      logo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=100&fit=crop',
      description: t('brands.continental.description'),
      country: 'Germany',
      founded: 1871,
      productCount: 98,
      rating: 4.6,
      reviewCount: 1893,
      categories: ['Summer Tires', 'Winter Tires', 'All-Season'],
      isPremium: true
    },
    {
      id: 'goodyear',
      name: 'Goodyear',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=100&fit=crop',
      description: t('brands.goodyear.description'),
      country: 'USA',
      founded: 1898,
      productCount: 87,
      rating: 4.5,
      reviewCount: 1654,
      categories: ['Summer Tires', 'Winter Tires', 'All-Season', 'Truck Tires'],
      isPremium: true
    },
    {
      id: 'pirelli',
      name: 'Pirelli',
      logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=100&fit=crop',
      description: t('brands.pirelli.description'),
      country: 'Italy',
      founded: 1872,
      productCount: 76,
      rating: 4.7,
      reviewCount: 1432,
      categories: ['Summer Tires', 'Performance', 'Motorcycle'],
      isPremium: true
    },
    {
      id: 'hankook',
      name: 'Hankook',
      logo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=100&fit=crop',
      description: t('brands.hankook.description'),
      country: 'South Korea',
      founded: 1941,
      productCount: 65,
      rating: 4.4,
      reviewCount: 987,
      categories: ['Summer Tires', 'Winter Tires', 'All-Season'],
      isPremium: false
    }
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Michelin Pilot Sport 4',
      brand: 'Michelin',
      price: 189.99,
      originalPrice: 229.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      rating: 4.8,
      reviewCount: 124,
      category: 'summer-tires',
      isOnSale: true
    },
    {
      id: '2',
      name: 'Bridgestone Blizzak WS90',
      brand: 'Bridgestone',
      price: 165.50,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      rating: 4.6,
      reviewCount: 89,
      category: 'winter-tires',
      isNew: true
    },
    {
      id: '3',
      name: 'Continental CrossContact LX25',
      brand: 'Continental',
      price: 145.00,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop',
      rating: 4.7,
      reviewCount: 156,
      category: 'all-season-tires'
    }
  ];

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

  const filteredProducts = products.filter(product => {
    return !selectedBrand || product.brand.toLowerCase() === selectedBrand;
  });

  const countries = Array.from(new Set(brands.map(brand => brand.country)));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
        <div className={`mb-12 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}`}>
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
                    to={`/products?brand=${brand.id}`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        {t('brands.new')}
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                        {t('brands.sale')}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
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
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                        <ShoppingCart className="h-4 w-4" />
                        {t('brands.addToCart')}
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Statistics */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('brands.statistics.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

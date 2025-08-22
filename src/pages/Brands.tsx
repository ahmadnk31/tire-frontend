import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

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
  'tracmax': 'https://www.tyrecenter.net/wp-content/uploads/2020/12/New-Project-1.jpg'
}
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
      'tracmax': 'China'
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
      'tracmax': 1996
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
      'tracmax': ['Summer Tires', 'Winter Tires', 'All-Season']
    };
    return categoryMap[brand.toLowerCase()] || ['Tires'];
  }

  function isPremiumBrand(brand: string): boolean {
    const premiumBrands = ['michelin', 'bridgestone', 'continental', 'goodyear', 'pirelli'];
    return premiumBrands.includes(brand.toLowerCase());
  }

  // Fetch products for selected brand
  const { data: brandProductsData } = useQuery({
    queryKey: ['brand-products', selectedBrand],
    queryFn: () => {
      if (!selectedBrand) return Promise.resolve({ products: [] });
      const selectedBrandData = brands.find(b => b.id === selectedBrand);
      return selectedBrandData ? productsApi.getBrandProducts(selectedBrandData.originalName) : Promise.resolve({ products: [] });
    },
    enabled: !!selectedBrand,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products: Product[] = brandProductsData?.products?.map((product: any) => ({
    id: product.id.toString(),
    name: product.name,
    brand: product.brand,
    price: Number(product.price),
    originalPrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    image: product.images?.[0]?.imageUrl || product.productImages?.[0]?.imageUrl || '/placeholder.svg',
    rating: Number(product.rating) || 0,
    reviewCount: 0, // Not available in current schema
    category: product.seasonType || 'tires',
    isOnSale: product.comparePrice ? Number(product.comparePrice) > Number(product.price) : false,
    isNew: false // Would need to check creation date
  })) || [];

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('brands.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('brands.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="min-h-screen bg-gray-50 py-8">
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

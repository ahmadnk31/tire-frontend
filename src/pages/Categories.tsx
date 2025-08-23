import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Filter, Grid, List, Search, Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  subcategories: string[];
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

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Fetch real categories data
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Helper function for category subcategories based on real data
  function getCategorySubcategories(categoryName: string): string[] {
    // Use real subcategories based on the category name
    const subcategoryMap: { [key: string]: string[] } = {
      'summer tires': ['Performance', 'Touring', 'High Performance'],
      'winter tires': ['Studded', 'Studless', 'Performance Winter'],
      'all-season tires': ['Touring', 'Performance', 'SUV'],
      'performance tires': ['Ultra High Performance', 'High Performance', 'Track'],
      'truck tires': ['Light Truck', 'Heavy Duty', 'Commercial'],
      'motorcycle tires': ['Sport', 'Touring', 'Cruiser', 'Off-Road']
    };
    return subcategoryMap[categoryName.toLowerCase()] || ['General'];
  }

  const categories: Category[] = (Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [])?.map((category: any) => ({
    id: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
    name: category.name,
    description: category.description || `${category.name} tires`,
    image: category.image || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center`,
    productCount: category.productCount || 0,
    subcategories: getCategorySubcategories(category.name)
  })) || [];

  // Fetch products for selected category
  const { data: categoryProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', selectedCategory],
    queryFn: () => selectedCategory ? productsApi.getCategoryProducts(selectedCategory) : Promise.resolve({ products: [] }),
    enabled: !!selectedCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add to cart mutation (localStorage)
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Increment quantity if product already exists
        existingCart[existingItemIndex].quantity += 1;
      } else {
                 // Add new product to cart
         existingCart.push({
           id: product.id,
           name: product.name,
           price: product.price,
           imageUrl: product.image,
           quantity: 1,
           brand: product.brand
         });
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      return { success: true, cart: existingCart };
    },
    onSuccess: () => {
      // Update cart count in header
      window.dispatchEvent(new Event('cart-updated'));
      toast({
        title: t('cart.addedToCart'),
        description: t('cart.itemAddedSuccessfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('cart.addToCartFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }
      
      return response.json();
    },
    onSuccess: (data, productId) => {
      setWishlist(prev => [...prev, productId]);
      toast({
        title: t('wishlist.addedToWishlist'),
        description: t('wishlist.itemAddedSuccessfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('wishlist.addToWishlistFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/wishlist/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      
      return response.json();
    },
    onSuccess: (data, productId) => {
      setWishlist(prev => prev.filter(id => id !== productId));
      toast({
        title: t('wishlist.removedFromWishlist'),
        description: t('wishlist.itemRemovedSuccessfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('wishlist.removeFromWishlistFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Debug logging
  console.log('Selected category:', selectedCategory);
  console.log('Category products data:', categoryProductsData);
  console.log('Products loading:', productsLoading);

  const products: Product[] = categoryProductsData?.products?.map((product: any) => ({
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

  // Add cart and wishlist functionality
  const addToCart = (product: Product) => {
    addToCartMutation.mutate(product);
  };

  const handleToggleWishlist = (product: Product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToAddWishlist'),
        variant: 'destructive',
      });
      return;
    }

    const productId = Number(product.id);
    if (wishlist.includes(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  const filteredProducts = products.filter(product => {
    // Only filter by search term since we're already getting products for the selected category
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Debug logging for products mapping
  console.log('Mapped products:', products);
  console.log('Products array length:', products.length);
  console.log('Filtered products:', filteredProducts);
  console.log('Sorted products:', sortedProducts);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-6 space-y-2">
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
              {t('categories.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
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
            {t('categories.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('categories.description')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('categories.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="name">{t('categories.sort.name')}</option>
              <option value="price-low">{t('categories.sort.priceLow')}</option>
              <option value="price-high">{t('categories.sort.priceHigh')}</option>
              <option value="rating">{t('categories.sort.rating')}</option>
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories.map(category => (
            <div
              key={category.id}
              className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {category.productCount} {t('categories.products')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.subcategories.map(sub => (
                    <span key={sub} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {sub}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {t('categories.subcategories')}: {category.subcategories.length}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Section */}
        {selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('categories.productsIn')} {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {productsLoading ? (
                // Loading skeleton for products
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-4 space-y-2">
                      <div className="bg-gray-200 h-4 rounded"></div>
                      <div className="bg-gray-200 h-6 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {t('categories.noProducts')}
                  </p>
                </div>
              ) : (
                sortedProducts.map(product => (
                  <div key={product.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full ${viewMode === 'list' ? 'flex-row' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'h-48'} flex-shrink-0`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                      {product.isNew && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                          {t('categories.new')}
                        </span>
                      )}
                      {product.isOnSale && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                          {t('categories.sale')}
                        </span>
                      )}
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
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={addToCartMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {addToCartMutation.isPending ? t('common.loading') : t('categories.addToCart')}
                        </button>
                        <button 
                          onClick={() => handleToggleWishlist(product)}
                          disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                          className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            wishlist.includes(Number(product.id)) ? 'bg-red-50 border-red-200' : ''
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${
                            wishlist.includes(Number(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* Category Navigation */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {t('categories.browseAll')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-primary font-bold text-lg">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                <span className="text-xs text-gray-500">{category.productCount} {t('categories.products')}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

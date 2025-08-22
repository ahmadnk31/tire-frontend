import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star,
  DollarSign,
  Zap,
  Car,
  Snowflake,
  Sun,
  CloudRain
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilterState {
  brands: string[];
  categories: string[];
  sizes: string[];
  seasonTypes: string[];
  speedRatings: string[];
  loadIndexes: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  featured: boolean;
  search: string;
}

const SPEED_RATINGS = ['S', 'T', 'H', 'V', 'W', 'Y', 'Z'];
const SEASON_TYPES = ['summer', 'winter', 'all-season', 'all-weather'];
const LOAD_INDEXES = ['91', '95', '99', '103', '107', '111', '115', '119'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brands: true,
    categories: true,
    sizes: true,
    specifications: true,
    price: true,
    rating: true,
    availability: true
  });

  // Get current filters from URL
  const getCurrentFilters = (): FilterState => ({
    brands: searchParams.getAll('brand'),
    categories: searchParams.getAll('category'),
    sizes: searchParams.getAll('size'),
    seasonTypes: searchParams.getAll('seasonType'),
    speedRatings: searchParams.getAll('speedRating'),
    loadIndexes: searchParams.getAll('loadIndex'),
    priceRange: [
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '1000')
    ],
    rating: parseInt(searchParams.get('rating') || '0'),
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    search: searchParams.get('search') || ''
  });

  const [filters, setFilters] = useState<FilterState>(getCurrentFilters());

  // Fetch available filter options
  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching filter options...');
        
        const productsRes = await productsApi.getAll({ limit: 1000 });
        const categoriesRes = await productsApi.getCategories();

        console.log('🔍 Products response:', productsRes);
        console.log('🔍 Categories response:', categoriesRes);

        const products = productsRes.products || [];
        const categories = categoriesRes.categories || [];

        console.log('🔍 Products array length:', products.length);
        console.log('🔍 Categories array length:', categories.length);

        // Extract brands
        const brands: string[] = [];
        products.forEach((p: any, index: number) => {
          console.log(`🔍 Product ${index} brand:`, p.brand);
          if (p.brand && !brands.includes(p.brand)) {
            brands.push(p.brand);
          }
        });
        console.log('🔍 Extracted brands:', brands);

        // Extract sizes
        const sizes: string[] = [];
        products.forEach((p: any, index: number) => {
          console.log(`🔍 Product ${index} size:`, p.size);
          if (p.size && !sizes.includes(p.size)) {
            sizes.push(p.size);
          }
        });
        console.log('🔍 Extracted sizes:', sizes);

        // Extract season types
        const seasonTypes: string[] = [];
        products.forEach((p: any, index: number) => {
          const seasonType = p.seasonType || p.specifications?.seasonType;
          console.log(`🔍 Product ${index} seasonType:`, seasonType);
          if (seasonType && !seasonTypes.includes(seasonType)) {
            seasonTypes.push(seasonType);
          }
        });
        console.log('🔍 Extracted seasonTypes:', seasonTypes);

        // Extract speed ratings
        const speedRatings: string[] = [];
        products.forEach((p: any, index: number) => {
          const speedRating = p.speedRating || p.specifications?.speedRating;
          console.log(`🔍 Product ${index} speedRating:`, speedRating);
          if (speedRating && !speedRatings.includes(speedRating)) {
            speedRatings.push(speedRating);
          }
        });
        console.log('🔍 Extracted speedRatings:', speedRatings);

        // Extract load indexes
        const loadIndexes: string[] = [];
        products.forEach((p: any, index: number) => {
          const loadIndex = p.loadIndex || p.specifications?.loadIndex;
          console.log(`🔍 Product ${index} loadIndex:`, loadIndex);
          if (loadIndex && !loadIndexes.includes(loadIndex)) {
            loadIndexes.push(loadIndex);
          }
        });
        console.log('🔍 Extracted loadIndexes:', loadIndexes);

        // Extract categories
        const categoryNames: string[] = [];
        categories.forEach((c: any, index: number) => {
          console.log(`🔍 Category ${index}:`, c);
          const name = typeof c === 'string' ? c : c.name;
          console.log(`🔍 Category ${index} name:`, name);
          if (name && !categoryNames.includes(name)) {
            categoryNames.push(name);
          }
        });
        console.log('🔍 Extracted categoryNames:', categoryNames);

        // Calculate price range
        const prices = products.map((p: any) => parseFloat(p.price) || 0).filter(p => p > 0);
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        const result = {
          brands: brands.sort(),
          categories: categoryNames.sort(),
          sizes: sizes.sort(),
          seasonTypes: seasonTypes.sort(),
          speedRatings: speedRatings.sort(),
          loadIndexes: loadIndexes.sort(),
          maxPrice,
          minPrice
        };

        console.log('🔍 Final extracted filter options:', result);
        return result;

      } catch (error) {
        console.error('❌ Error fetching filter options:', error);
        return {
          brands: [],
          categories: [],
          sizes: [],
          seasonTypes: [],
          speedRatings: [],
          loadIndexes: [],
          maxPrice: 1000,
          minPrice: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update URL when filters change
  const updateURL = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    // Add filters to URL
    if (updatedFilters.brands.length > 0) {
      updatedFilters.brands.forEach(brand => params.append('brand', brand));
    }
    if (updatedFilters.categories.length > 0) {
      updatedFilters.categories.forEach(category => params.append('category', category));
    }
    if (updatedFilters.sizes.length > 0) {
      updatedFilters.sizes.forEach(size => params.append('size', size));
    }
    if (updatedFilters.seasonTypes.length > 0) {
      updatedFilters.seasonTypes.forEach(season => params.append('seasonType', season));
    }
    if (updatedFilters.speedRatings.length > 0) {
      updatedFilters.speedRatings.forEach(rating => params.append('speedRating', rating));
    }
    if (updatedFilters.loadIndexes.length > 0) {
      updatedFilters.loadIndexes.forEach(index => params.append('loadIndex', index));
    }
    if (updatedFilters.priceRange[0] > 0) {
      params.set('minPrice', updatedFilters.priceRange[0].toString());
    }
    if (updatedFilters.priceRange[1] < 1000) {
      params.set('maxPrice', updatedFilters.priceRange[1].toString());
    }
    if (updatedFilters.rating > 0) {
      params.set('rating', updatedFilters.rating.toString());
    }
    if (updatedFilters.inStock) {
      params.set('inStock', 'true');
    }
    if (updatedFilters.featured) {
      params.set('featured', 'true');
    }
    if (updatedFilters.search) {
      params.set('search', updatedFilters.search);
    }

    setSearchParams(params);
    setFilters(updatedFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams({});
    setFilters({
      brands: [],
      categories: [],
      sizes: [],
      seasonTypes: [],
      speedRatings: [],
      loadIndexes: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      featured: false,
      search: ''
    });
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.seasonTypes.length > 0) count += filters.seasonTypes.length;
    if (filters.speedRatings.length > 0) count += filters.speedRatings.length;
    if (filters.loadIndexes.length > 0) count += filters.loadIndexes.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count += 1;
    if (filters.rating > 0) count += 1;
    if (filters.inStock) count += 1;
    if (filters.featured) count += 1;
    if (filters.search) count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">


            {/* Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-900">Search</Label>
              </div>
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateURL({ search: e.target.value })}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Brands */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('brands')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900">Brands</Label>
                {expandedSections.brands ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.brands && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptionsLoading ? (
                    <div className="text-sm text-gray-500">Loading brands...</div>
                  ) : filterOptions?.brands && filterOptions.brands.length > 0 ? (
                    filterOptions.brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={(checked) => {
                            const newBrands = checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter(b => b !== brand);
                            updateURL({ brands: newBrands });
                          }}
                        />
                        <Label
                          htmlFor={`brand-${brand}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No brands available</div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900">Categories</Label>
                {expandedSections.categories ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.categories && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptionsLoading ? (
                    <div className="text-sm text-gray-500">Loading categories...</div>
                  ) : filterOptions?.categories && filterOptions.categories.length > 0 ? (
                    filterOptions.categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            const newCategories = checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(c => c !== category);
                            updateURL({ categories: newCategories });
                          }}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No categories available</div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Sizes */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('sizes')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900">Sizes</Label>
                {expandedSections.sizes ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.sizes && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptionsLoading ? (
                    <div className="text-sm text-gray-500">Loading sizes...</div>
                  ) : filterOptions?.sizes && filterOptions.sizes.length > 0 ? (
                    filterOptions.sizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={filters.sizes.includes(size)}
                          onCheckedChange={(checked) => {
                            const newSizes = checked
                              ? [...filters.sizes, size]
                              : filters.sizes.filter(s => s !== size);
                            updateURL({ sizes: newSizes });
                          }}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No sizes available</div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('specifications')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900">Specifications</Label>
                {expandedSections.specifications ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.specifications && (
                <div className="space-y-4">
                  {/* Season Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Season Type</Label>
                    <div className="space-y-2">
                      {SEASON_TYPES.map((season) => (
                        <div key={season} className="flex items-center space-x-2">
                          <Checkbox
                            id={`season-${season}`}
                            checked={filters.seasonTypes.includes(season)}
                            onCheckedChange={(checked) => {
                              const newSeasons = checked
                                ? [...filters.seasonTypes, season]
                                : filters.seasonTypes.filter(s => s !== season);
                              updateURL({ seasonTypes: newSeasons });
                            }}
                          />
                          <Label
                            htmlFor={`season-${season}`}
                            className="text-sm text-gray-700 cursor-pointer flex items-center gap-1"
                          >
                            {season === 'summer' && <Sun className="h-3 w-3" />}
                            {season === 'winter' && <Snowflake className="h-3 w-3" />}
                            {season === 'all-season' && <CloudRain className="h-3 w-3" />}
                            {season === 'all-weather' && <Zap className="h-3 w-3" />}
                            {season.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speed Rating */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Speed Rating</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SPEED_RATINGS.map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            id={`speed-${rating}`}
                            checked={filters.speedRatings.includes(rating)}
                            onCheckedChange={(checked) => {
                              const newRatings = checked
                                ? [...filters.speedRatings, rating]
                                : filters.speedRatings.filter(r => r !== rating);
                              updateURL({ speedRatings: newRatings });
                            }}
                          />
                          <Label
                            htmlFor={`speed-${rating}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {rating}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load Index */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Load Index</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOAD_INDEXES.map((index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`load-${index}`}
                            checked={filters.loadIndexes.includes(index)}
                            onCheckedChange={(checked) => {
                              const newIndexes = checked
                                ? [...filters.loadIndexes, index]
                                : filters.loadIndexes.filter(i => i !== index);
                              updateURL({ loadIndexes: newIndexes });
                            }}
                          />
                          <Label
                            htmlFor={`load-${index}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {index}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </Label>
                {expandedSections.price ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.price && filterOptions && (
                <div className="space-y-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateURL({ priceRange: value as [number, number] })}
                    max={filterOptions.maxPrice || 1000}
                    min={filterOptions.minPrice || 0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Rating */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('rating')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Minimum Rating
                </Label>
                {expandedSections.rating ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.rating && (
                <div className="space-y-4">
                  <Slider
                    value={[filters.rating]}
                    onValueChange={(value) => updateURL({ rating: value[0] })}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Any rating</span>
                    <span>{filters.rating}★ & up</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('availability')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  Availability
                </Label>
                {expandedSections.availability ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.availability && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => updateURL({ inStock: checked as boolean })}
                    />
                    <Label htmlFor="inStock" className="text-sm text-gray-700 cursor-pointer">
                      In Stock Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={filters.featured}
                      onCheckedChange={(checked) => updateURL({ featured: checked as boolean })}
                    />
                    <Label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
                      Featured Products Only
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import { useState, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';
import { NoSearchResults } from "@/components/ui/NoProductsFound";
import { useSearch, useBrands, useSearchPrefetch } from "@/hooks";

export function SearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Custom hooks with TanStack Query
  const { brands, isLoading: brandsLoading } = useBrands();
  const { prefetchSearch } = useSearchPrefetch();
  const {
    results,
    totalResults,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isDebouncing,
    error: searchError,
    hasQuery,
  } = useSearch(
    { query, brand: selectedBrand },
    {
      debounceMs: 300,
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Limit results to top 10 for dropdown
  const limitedResults = results.slice(0, 10);
  const loading = searchLoading || searchFetching || isDebouncing;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Show dropdown if there's a query
    if (value.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    // Keep dropdown open if there's a query
    if (query.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSelect = (product: any) => {
    setShowDropdown(false);
    setQuery("");
    setSelectedIndex(-1);
    console.log('🔍 [SearchBar] Navigating to product:', { id: product.id, name: product.name, slug: product.slug });
    navigate(`/products/${product.slug || product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || limitedResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < limitedResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : limitedResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < limitedResults.length) {
          handleSelect(limitedResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Highlight search matches in text
  const highlightMatches = (text: string, matches: any[]) => {
    if (!matches || !text) return text;
    
    let highlightedText = text;
    matches.forEach(match => {
      if (match.key === 'name' || match.key === 'brand' || match.key === 'size') {
        match.indices.forEach(([start, end]: [number, number]) => {
          const before = highlightedText.substring(0, start);
          const matchText = highlightedText.substring(start, end + 1);
          const after = highlightedText.substring(end + 1);
          highlightedText = `${before}<mark class="bg-accent/20 text-accent-foreground px-1 rounded">${matchText}</mark>${after}`;
        });
      }
    });
    
    return highlightedText;
  };

  // Get product image URL
  const getProductImage = (product: any) => {
    // Try different image sources
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage && firstImage.imageUrl) {
        return firstImage.imageUrl;
      }
    }
    
    if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
      return product.productImages[0].imageUrl;
    }
    
    // Fallback to placeholder
    return "/placeholder.svg";
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Search Input with Filter Icon */}
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t('searchBar.placeholder')}
            className={`w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm ${
              isDebouncing ? 'animate-pulse' : ''
            }`}
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            aria-label={t('searchBar.placeholder')}
            aria-describedby="search-results"
          />
          {/* Clear search button for mobile */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
                setSelectedIndex(-1);
              }}
              className="p-1 rounded hover:bg-primary/10 transition-colors ml-2 flex-shrink-0"
              aria-label={t('searchBar.clearSearch')}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          {/* Debouncing indicator for mobile */}
          {isDebouncing && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2" />
          )}
          {/* Filter Icon */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="p-1 rounded hover:bg-primary/10 transition-colors ml-2 flex-shrink-0"
            aria-label={t('searchBar.filter')}
          >
            <Filter className={`h-4 w-4 transition-colors ${selectedBrand && selectedBrand !== 'all' ? 'text-primary' : 'text-gray-400'}`} />
          </button>
        </div>
        
        {/* Mobile Brand Filter Dropdown */}
        {showMobileFilter && brands.length > 0 && (
          <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-40">
            <div className="p-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">{t('searchBar.filterByBrand')}</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    handleBrandChange(brand);
                    setShowMobileFilter(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors ${
                    selectedBrand === brand ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                  }`}
                >
                  {brand === 'all' ? t('searchBar.allBrands') : brand}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
          {/* Brand Selector */}
          <Select value={selectedBrand} onValueChange={handleBrandChange}>
            <SelectTrigger className="w-[130px] h-9 text-sm border-none bg-transparent px-2">
              <SelectValue placeholder={t('searchBar.selectBrand')} />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand === 'all' ? t('searchBar.allBrands') : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Divider */}
          <span className="mx-1 text-gray-300">|</span>
          
          {/* Search Icon */}
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          
          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t('searchBar.placeholder')}
            className={`flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 px-2 ${
              isDebouncing ? 'animate-pulse' : ''
            }`}
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            aria-label={t('searchBar.placeholder')}
            aria-describedby="search-results"
          />
          {/* Clear search button for desktop */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
                setSelectedIndex(-1);
              }}
              className="p-1 rounded hover:bg-primary/10 transition-colors mr-2 flex-shrink-0"
              aria-label={t('searchBar.clearSearch')}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          {/* Debouncing indicator */}
          {isDebouncing && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2" />
          )}
        </div>
      </div>

      {/* Search Results Dropdown - Responsive */}
      {showDropdown && limitedResults.length > 0 && (
        <div 
          id="search-results"
          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-72 overflow-auto"
          role="listbox"
          aria-label={t('searchBar.searchResults')}
        >
          {limitedResults.map((product, index) => {
            const imageUrl = getProductImage(product);
            
            return (
              <button
                key={product.id}
                className={`w-full text-left px-3 py-3 md:px-4 transition-colors flex items-center gap-3 ${
                  selectedIndex === index 
                    ? 'bg-primary/10 border-l-2 border-primary' 
                    : 'hover:bg-primary/5'
                }`}
                onMouseDown={() => handleSelect(product)}
                onMouseEnter={() => {
                  setSelectedIndex(index);
                  prefetchSearch(product.name, selectedBrand);
                }}
                tabIndex={-1}
                role="option"
                aria-selected={selectedIndex === index}
                aria-label={`${product.name} - ${product.brand} - ${product.size}`}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div 
                    className="font-medium text-sm text-gray-900 truncate"
                   
                  >
                    {product.name} {product.searchMatches && product.searchMatches.some((m: any) => 
                    m.key === 'tags' || m.key === 'features' || m.key === 'specifications'
                  ) && (
                    <div className="text-xs text-blue-600 mt-1">
                      Matches in specifications
                    </div>
                  )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {product.brand} • {product.size}
                    {product.seasonType && ` • ${product.seasonType}`}
                  </div>
                  {product.searchMatches && product.searchMatches.some((m: any) => 
                    m.key === 'tags' || m.key === 'features' || m.key === 'specifications'
                  ) && (
                    <div className="text-xs text-accent mt-1">
                      {t('searchBar.matchesInSpecifications')}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {loading && (
            <div className="px-3 py-3 md:px-4 text-sm text-gray-500">
              {isDebouncing ? t('searchBar.searching') : t('searchBar.loadingResults')}
            </div>
          )}
          {totalResults > limitedResults.length && (
            <div className="px-3 py-2 md:px-4 text-xs text-gray-500 border-t border-gray-100">
              {t('searchBar.showingResults', { count: limitedResults.length, total: totalResults })}
            </div>
          )}
        </div>
      )}
      
      {/* No Results - Responsive */}
      {showDropdown && !loading && limitedResults.length === 0 && hasQuery && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <NoSearchResults 
            onClearFilters={() => {
              setQuery("");
              setSelectedBrand("all");
              setShowDropdown(false);
            }}
          />
        </div>
      )}

      {/* Error State */}
      {searchError && (
        <div className="absolute left-0 right-0 mt-2 bg-destructive/10 border border-destructive/20 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-destructive">
            {t('searchBar.searchError')}
          </div>
        </div>
      )}
    </div>
  );
}
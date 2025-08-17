import { useState, useRef, useEffect } from "react";
import { productsApi } from "@/lib/api";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export function SearchBar() {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    triggerSearch(value);
  };

  const triggerSearch = (q: string) => {
    console.log('[DEBUG] triggerSearch called with:', { q, brand: selectedBrand });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (q.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        // Only send brand and search term
        const res = await productsApi.search(q, selectedBrand);
        setResults(res.products || []);
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(() => {
    // Fetch brands from backend on mount
    productsApi.getAll().then(res => {
      if (res.filters && Array.isArray(res.filters.brands)) {
        const uniqueBrands = res.filters.brands.filter(b => !!b);
        setBrands(['all', ...uniqueBrands]);
      }
    });
  }, []);

  const handleSelect = (id: number) => {
    setShowDropdown(false);
    setQuery("");
    if (typeof id === 'number' && Number.isFinite(id) && !isNaN(id)) {
      navigate(`/products/${id}`);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Search Input with Filter Icon */}
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search by brand..."
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {/* Filter Icon */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="p-1 rounded hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
            aria-label="Filter"
          >
            <Filter className={`h-4 w-4 transition-colors ${selectedBrand && selectedBrand !== 'all' ? 'text-blue-600' : 'text-gray-400'}`} />
          </button>
        </div>
        
        {/* Mobile Brand Filter Dropdown */}
        {showMobileFilter && brands.length > 0 && (
          <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-40">
            <div className="p-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Filter by Brand</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setShowMobileFilter(false);
                    triggerSearch(query);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    selectedBrand === brand ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {brand === 'all' ? 'All Brands' : brand}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1 shadow-sm">
          {/* Brand Selector */}
          <Select value={selectedBrand} onValueChange={value => { setSelectedBrand(value); triggerSearch(query); }}>
            <SelectTrigger className="w-[130px] h-9 text-sm border-none bg-transparent px-2">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand === 'all' ? 'All Brands' : brand}
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
            placeholder="Search by brand..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 px-2"
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
        </div>
      </div>

      {/* Search Results Dropdown - Responsive */}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-72 overflow-auto">
          {results.map((product) => {
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
            // fallback to placeholder if no image
            if (!imageUrl) imageUrl = "/placeholder.svg";
            
            return (
              <button
                key={product.id}
                className="w-full text-left px-3 py-3 md:px-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                onMouseDown={() => handleSelect(product.id)}
                tabIndex={-1}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">{product.brand}</div>
                </div>
              </button>
            );
          })}
          {loading && (
            <div className="px-3 py-3 md:px-4 text-sm text-gray-500">Loading...</div>
          )}
        </div>
      )}
      
      {/* No Results - Responsive */}
      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 px-3 py-3 md:px-4 text-sm text-gray-500">
          No results found.
        </div>
      )}
    </div>
  );
}
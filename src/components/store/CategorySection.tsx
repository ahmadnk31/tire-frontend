import { productsApi } from "@/lib/api";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoriesSkeleton } from "@/components/ui/skeletons";

export const CategorySection = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Number of items to show per page in carousel mode
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    productsApi.getCategories().then((data) => {
      setCategories(data.categories || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Check scroll position for mobile scrolling
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [categories]);

  // Handle category click
  const handleCategoryClick = (category: any) => {
    // Always remove query params from homepage before navigating
    if (window.location.pathname === "/" && window.location.search) {
      window.history.replaceState({}, "", "/");
    }
    if (category.id) {
      navigate(`/products?category=${category.name}`);
    } else {
      navigate('/products?category=all');
    }
  };

  // Carousel navigation for desktop
  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const goToNext = () => {
    const maxIndex = Math.max(0, categories.length + 1 - itemsPerPage); // +1 for "All Category"
    setCurrentIndex((prev) => Math.min(maxIndex, prev + itemsPerPage));
  };

  // Mobile scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const allCategories = [...categories, { id: null, name: "All Category", image: null }];
  const visibleCategories = allCategories.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < allCategories.length;

  // Show skeleton while loading
  if (loading) {
    return <CategoriesSkeleton />;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout - Scrollable */}
        <div className="lg:hidden relative">
          {/* Mobile Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-6 overflow-x-auto pb-2 px-8 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.map((cat, idx) => (
              <CategoryItem
                key={cat.id || 'all'}
                category={cat}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout - Carousel */}
        <div className="hidden lg:block relative">
          {/* Desktop Carousel Buttons */}
          {canGoPrevious && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="flex items-center justify-center gap-8 px-12">
            {visibleCategories.map((cat, idx) => (
              <CategoryItem
                key={cat.id || 'all'}
                category={cat}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
          </div>

          {/* Carousel Dots Indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(allCategories.length / itemsPerPage) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / itemsPerPage) === idx
                    ? 'bg-blue-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Separate component for individual category items
const CategoryItem = ({ category, onClick }: { category: any; onClick: () => void }) => {
  // Enhanced icon mapping for tire categories
  const iconMap: Record<string, JSX.Element> = {
    // Summer tires
    sun: <span role="img" aria-label="Summer" className="text-2xl">☀️</span>,
    summer: <span role="img" aria-label="Summer" className="text-2xl">🌞</span>,
    
    // Winter tires
    snowflake: <span role="img" aria-label="Winter" className="text-2xl">❄️</span>,
    winter: <span role="img" aria-label="Winter" className="text-2xl">🌨️</span>,
    snow: <span role="img" aria-label="Snow" className="text-2xl">⛄</span>,
    
    // All season
    cloud: <span role="img" aria-label="All Season" className="text-2xl">☁️</span>,
    allseason: <span role="img" aria-label="All Season" className="text-2xl">🌤️</span>,
    
    // Performance/Sports
    speed: <span role="img" aria-label="Performance" className="text-2xl">🏎️</span>,
    performance: <span role="img" aria-label="Performance" className="text-2xl">🏁</span>,
    sports: <span role="img" aria-label="Sports" className="text-2xl">🏆</span>,
    racing: <span role="img" aria-label="Racing" className="text-2xl">🚗</span>,
    
    // Commercial/Truck
    truck: <span role="img" aria-label="Truck" className="text-2xl">🚛</span>,
    commercial: <span role="img" aria-label="Commercial" className="text-2xl">🚚</span>,
    delivery: <span role="img" aria-label="Delivery" className="text-2xl">📦</span>,
    
    // SUV/4x4
    suv: <span role="img" aria-label="SUV" className="text-2xl">🚙</span>,
    offroad: <span role="img" aria-label="Off-road" className="text-2xl">🏔️</span>,
    fourwheeldrive: <span role="img" aria-label="4WD" className="text-2xl">🛻</span>,
    
    // Motorcycle
    motorcycle: <span role="img" aria-label="Motorcycle" className="text-2xl">🏍️</span>,
    bike: <span role="img" aria-label="Bike" className="text-2xl">🛵</span>,
    
    // Economy/Budget
    economy: <span role="img" aria-label="Economy" className="text-2xl">💰</span>,
    budget: <span role="img" aria-label="Budget" className="text-2xl">💵</span>,
    
    // Eco-friendly
    eco: <span role="img" aria-label="Eco" className="text-2xl">🌱</span>,
    green: <span role="img" aria-label="Green" className="text-2xl">♻️</span>,
    electric: <span role="img" aria-label="Electric" className="text-2xl">🔋</span>,
    
    // Premium/Luxury
    premium: <span role="img" aria-label="Premium" className="text-2xl">💎</span>,
    luxury: <span role="img" aria-label="Luxury" className="text-2xl">👑</span>,
    
    // Run-flat
    runflat: <span role="img" aria-label="Run-flat" className="text-2xl">🛡️</span>,
    safety: <span role="img" aria-label="Safety" className="text-2xl">🔒</span>,
  };

  // Try to match category name to icon (case insensitive)
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase().replace(/\s+/g, '');
    
    // Direct matches
    if (iconMap[name]) return iconMap[name];
    
    // Partial matches
    if (name.includes('summer') || name.includes('zomer')) return iconMap.summer;
    if (name.includes('winter') || name.includes('winter')) return iconMap.winter;
    if (name.includes('allseason') || name.includes('all') || name.includes('seizoen')) return iconMap.allseason;
    if (name.includes('performance') || name.includes('sport') || name.includes('racing')) return iconMap.performance;
    if (name.includes('truck') || name.includes('commercial') || name.includes('van')) return iconMap.truck;
    if (name.includes('suv') || name.includes('4x4') || name.includes('offroad')) return iconMap.suv;
    if (name.includes('motorcycle') || name.includes('motor') || name.includes('bike')) return iconMap.motorcycle;
    if (name.includes('economy') || name.includes('budget') || name.includes('cheap')) return iconMap.economy;
    if (name.includes('eco') || name.includes('green') || name.includes('electric')) return iconMap.eco;
    if (name.includes('premium') || name.includes('luxury') || name.includes('high')) return iconMap.premium;
    if (name.includes('runflat') || name.includes('run') || name.includes('flat')) return iconMap.runflat;
    
    // Default fallback
    return <span role="img" aria-label="Tire" className="text-2xl">🛞</span>;
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center min-w-[90px] cursor-pointer group hover:transform hover:scale-105 transition-transform duration-200"
    >
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-2 border border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors shadow-sm">
        {category.image ? (
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-10 h-10 object-contain rounded-full" 
          />
        ) : category.id === null ? (
          <span role="img" aria-label="All Categories" className="text-2xl">📋</span>
        ) : (
          getIconForCategory(category.name)
        )}
      </div>
      <span className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors">
        {category.name}
      </span>
    </div>
  );
};
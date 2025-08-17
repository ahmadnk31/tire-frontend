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
  // Icon mapping for demo (expand as needed)
  const iconMap: Record<string, JSX.Element> = {
    sun: <span role="img" aria-label="Summer"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FFD600"/><g stroke="#FFD600" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.22" y1="4.22" x2="7.07" y2="7.07"/><line x1="16.93" y1="16.93" x2="19.78" y2="19.78"/><line x1="4.22" y1="19.78" x2="7.07" y2="16.93"/><line x1="16.93" y1="7.07" x2="19.78" y2="4.22"/></g></svg></span>,
    snowflake: <span role="img" aria-label="Winter"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="#00BFFF" strokeWidth="2"/></svg></span>,
    cloud: <span role="img" aria-label="All Season"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="8" ry="5" fill="#B0BEC5"/><ellipse cx="16" cy="12" rx="6" ry="4" fill="#90A4AE"/></svg></span>,
    speed: <span role="img" aria-label="Performance"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FF5252" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#FF5252" strokeWidth="2"/></svg></span>,
  };
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center min-w-[90px] cursor-pointer group hover:transform hover:scale-105 transition-transform duration-200"
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 border border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
        {category.icon && iconMap[category.icon] ? (
          iconMap[category.icon]
        ) : category.image ? (
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-10 h-10 object-contain rounded-full" 
          />
        ) : category.id === null ? (
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="4" height="4" rx="1.5" fill="#bbb"/>
            <rect x="4" y="16" width="4" height="4" rx="1.5" fill="#bbb"/>
            <rect x="16" y="4" width="4" height="4" rx="1.5" fill="#bbb"/>
            <rect x="16" y="16" width="4" height="4" rx="1.5" fill="#bbb"/>
          </svg>
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors">
        {category.name}
      </span>
    </div>
  );
};
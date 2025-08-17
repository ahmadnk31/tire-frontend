
import { HeroSection } from "./HeroSection";
import { CategorySection } from "./CategorySection";
import { ProductGrid } from "./ProductGrid";
import { TodaysForYouSection } from "./TodaysForYouSection";
import { HeroCarousel } from "../HeroCarousel";
import BrandsMarquee from "../BrandsMarquee";
import { LoadingSkeleton } from "../ui/skeletons";
import { useState, useEffect } from "react";

export const Store = () => {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Initial page load delay to show skeleton
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Show full page skeleton on initial load
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        {/* Header skeleton */}
        <div className="w-full bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero section skeleton */}
        <div className="w-full h-96 bg-gray-200 mb-8"></div>
        
        {/* Categories skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Products skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <CategorySection />
      <TodaysForYouSection sectionTitle="Todays For You!" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid sectionTitle="Featured Products" showAllButton={true} featuredOnly={true} />
      </div>
      <BrandsMarquee />
    </div>
  );
};
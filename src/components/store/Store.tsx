
import { CategorySection } from "./CategorySection";
import { ProductGrid } from "./ProductGrid";
import { TodaysForYouSection } from "./TodaysForYouSection";
import { HeroCarousel } from "../HeroCarousel";

import { useState, useEffect } from "react";
import BrandsMarquee from "../BrandsMarquee";

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
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="h-8 sm:h-10 w-8 sm:w-10 bg-gray-200 rounded-full"></div>
                <div className="h-8 sm:h-10 w-8 sm:w-10 bg-gray-200 rounded-full"></div>
                <div className="h-8 sm:h-10 w-16 sm:w-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero section skeleton */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-200 mb-6 sm:mb-8 overflow-hidden">
          {/* Content overlay skeleton */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300/60 via-gray-300/40 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                {/* Text content skeleton */}
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Badge skeleton */}
                  <div className="h-5 sm:h-6 lg:h-8 w-24 sm:w-32 lg:w-40 bg-gray-300 rounded-full"></div>
                  
                  {/* Headline skeleton */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="h-6 sm:h-8 lg:h-10 xl:h-12 w-full bg-gray-300 rounded"></div>
                    <div className="h-5 sm:h-6 lg:h-8 xl:h-10 w-4/5 sm:w-3/4 bg-gray-300 rounded"></div>
                  </div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="h-2.5 sm:h-3 lg:h-4 w-full bg-gray-300 rounded"></div>
                    <div className="h-2.5 sm:h-3 lg:h-4 w-11/12 sm:w-5/6 bg-gray-300 rounded"></div>
                    <div className="h-2.5 sm:h-3 lg:h-4 w-10/12 sm:w-4/6 bg-gray-300 rounded"></div>
                  </div>
                  
                  {/* CTA buttons skeleton */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2 sm:pt-4">
                    <div className="h-8 sm:h-10 lg:h-12 w-full sm:w-32 lg:w-36 bg-gray-300 rounded-lg"></div>
                    <div className="h-8 sm:h-10 lg:h-12 w-full sm:w-28 lg:w-32 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Media content skeleton - responsive visibility */}
                <div className="hidden md:flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                    <div className="w-full aspect-video bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation controls skeleton - responsive positioning */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Dots indicator skeleton - responsive positioning */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 lg:gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded-full"></div>
            ))}
          </div>
          
          {/* Progress bar skeleton */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-300/20">
            <div className="h-full w-1/3 bg-gray-300"></div>
          </div>
        </div>
        
        {/* Categories skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          {/* Mobile categories */}
          <div className="lg:hidden">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 px-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="text-center flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
          {/* Desktop categories */}
          <div className="hidden lg:flex justify-center gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Products skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 rounded mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`bg-white border border-gray-200 rounded-xl p-3 sm:p-4 ${
                  // Show different amounts based on screen size
                  i >= 4 ? 'hidden xl:block' : 
                  i >= 3 ? 'hidden lg:block' : 
                  i >= 2 ? 'hidden sm:block' : ''
                }`}
              >
                <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded"></div>
                  <div className="w-full h-8 sm:h-10 bg-gray-200 rounded-lg"></div>
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
      {/* <BrandsMarquee /> --- IGNORE */}
      
    </div>
  );
};
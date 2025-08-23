import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { BrandsMarqueeSkeleton } from "./ui/skeletons";

interface Brand {
  brand: string;
  productCount: number;
}

const BrandsMarquee: React.FC = () => {
  // Fetch real brands data
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ['brands-marquee'],
    queryFn: () => productsApi.getBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Extract brand names from API response
  const brands = brandsData?.brands?.map((brand: Brand) => brand.brand) || [];

  if (isLoading) {
    return <BrandsMarqueeSkeleton />;
  }

  if (error || !brands.length) {
    // Fallback to some default brands if API fails
    const fallbackBrands = [
      "Michelin", "Bridgestone", "Goodyear", "Continental", "Pirelli", "Dunlop", 
      "Hankook", "Yokohama", "Toyo", "BFGoodrich", "Firestone", "Cooper", 
      "Kumho", "Falken", "Nexen", "Sumitomo", "Vredestein", "Apollo", 
      "Maxxis", "Uniroyal"
    ];
    
    return (
      <div className="relative overflow-hidden w-full py-4 sm:py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        {/* Left blur overlay - responsive widths */}
        <div className="absolute left-0 top-0 w-8 sm:w-16 md:w-24 lg:w-32 h-full bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
        
        {/* Right blur overlay - responsive widths */}
        <div className="absolute right-0 top-0 w-8 sm:w-16 md:w-24 lg:w-32 h-full bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
        
        {/* Marquee content - improved mobile responsiveness */}
        <div className="whitespace-nowrap animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-sm sm:text-base md:text-lg font-semibold">
          {fallbackBrands.concat(fallbackBrands).map((brand, i) => (
            <span 
              key={i} 
              className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-primary transition-colors duration-300 cursor-pointer select-none whitespace-nowrap"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full py-4 sm:py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50">
      {/* Left blur overlay - responsive widths */}
      <div className="absolute left-0 top-0 w-8 sm:w-16 md:w-24 lg:w-32 h-full bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
      
      {/* Right blur overlay - responsive widths */}
      <div className="absolute right-0 top-0 w-8 sm:w-16 md:w-24 lg:w-32 h-full bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
      
      {/* Marquee content - improved mobile responsiveness */}
      <div className="whitespace-nowrap animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-sm sm:text-base md:text-lg font-semibold">
        {brands.concat(brands).map((brand, i) => (
          <span 
            key={i} 
            className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-primary transition-colors duration-300 cursor-pointer select-none whitespace-nowrap"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};

// Enhanced Tailwind animation for marquee
// Add this to your global CSS:
// .animate-marquee {
//   animation: marquee 45s linear infinite;
// }
// @keyframes marquee {
//   0% { 
//     transform: translateX(0); 
//   }
//   100% { 
//     transform: translateX(-50%); 
//   }
// }
// 
// /* Pause animation on hover */
// .animate-marquee:hover {
//   animation-play-state: paused;
// }
//
// /* Alternative smoother animation */
// @media (prefers-reduced-motion: no-preference) {
//   .animate-marquee {
//     animation: marquee 45s linear infinite;
//   }
// }

export default BrandsMarquee;
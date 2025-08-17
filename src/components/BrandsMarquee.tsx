import React, { useState, useEffect } from "react";
import { BrandsMarqueeSkeleton } from "./ui/skeletons";

const brands = [
  "Michelin", "Bridgestone", "Goodyear", "Continental", "Pirelli", "Dunlop", 
  "Hankook", "Yokohama", "Toyo", "BFGoodrich", "Firestone", "Cooper", 
  "Kumho", "Falken", "Nexen", "Sumitomo", "Vredestein", "Apollo", 
  "Maxxis", "Uniroyal"
];

const BrandsMarquee: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for brands data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <BrandsMarqueeSkeleton />;
  }

  return (
    <div className="relative overflow-hidden w-full py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50">
      {/* Left blur overlay */}
      <div className="absolute left-0 top-0 w-24 md:w-96 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      
      {/* Right blur overlay */}
      <div className="absolute right-0 top-0 w-24 md:w-96 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      
      {/* Marquee content */}
      <div className="whitespace-nowrap animate-marquee flex items-center gap-8 md:gap-12 text-base md:text-lg font-semibold">
        {brands.concat(brands).map((brand, i) => (
          <span 
            key={i} 
            className="inline-flex items-center px-3 md:px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-300 cursor-pointer select-none"
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
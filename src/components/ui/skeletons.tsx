import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Product Card Skeleton
export const ProductCardSkeleton = ({ index = 0 }: { index?: number }) => {
  const delayClass = `skeleton-delay-${(index % 5) + 1}`;
  
  return (
    <div className={`group bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 ${delayClass}`}>
      {/* Image skeleton */}
      <div className="relative mb-4">
        <Skeleton variant="shimmer" className="w-full h-48 rounded-lg" />
        {/* Wishlist button skeleton */}
        <Skeleton variant="wave" className="absolute top-2 right-2 w-8 h-8 rounded-full" />
      </div>
      
      {/* Product info skeleton */}
      <div className="space-y-3">
        {/* Brand and model */}
        <div className="space-y-2">
          <Skeleton variant="shimmer" className="h-4 w-3/4" />
          <Skeleton variant="shimmer" className="h-3 w-1/2" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="pulse" className="w-4 h-4 rounded" />
            ))}
          </div>
          <Skeleton variant="pulse" className="h-3 w-12" />
        </div>
        
        {/* Price and stock */}
        <div className="flex items-center justify-between">
          <Skeleton variant="shimmer" className="h-6 w-20" />
          <Skeleton variant="pulse" className="h-4 w-16" />
        </div>
        
        {/* Add to cart button */}
        <Skeleton variant="wave" className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton = ({ 
  sectionTitle = "Products", 
  itemCount = 6 
}: { 
  sectionTitle?: string; 
  itemCount?: number;
}) => {
  return (
    <div className="space-y-8">
      {/* Section header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="shimmer" className="h-8 w-48" />
          <Skeleton variant="shimmer" className="h-4 w-72" />
        </div>
        <Skeleton variant="wave" className="h-10 w-32 rounded-lg" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemCount)].map((_, index) => (
          <ProductCardSkeleton key={index} index={index} />
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <Skeleton variant="pulse" className="w-10 h-10 rounded-lg" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="pulse" className={`w-10 h-10 rounded-lg skeleton-delay-${i + 1}`} />
          ))}
        </div>
        <Skeleton variant="pulse" className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
};

// Hero Carousel Skeleton
export const HeroCarouselSkeleton = () => {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] rounded-none sm:rounded-2xl overflow-hidden">
      {/* Main image skeleton */}
      <Skeleton variant="shimmer" className="w-full h-full" />
      
      {/* Content overlay skeleton */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text content skeleton */}
            <div className="max-w-lg space-y-4 sm:space-y-6">
              {/* Badge skeleton */}
              <Skeleton variant="wave" className="h-6 sm:h-8 w-32 sm:w-40 rounded-full" />
              
              {/* Headline skeleton */}
              <div className="space-y-2 sm:space-y-3">
                <Skeleton variant="wave" className="h-8 sm:h-10 lg:h-12 w-full" />
                <Skeleton variant="wave" className="h-6 sm:h-8 lg:h-10 w-3/4 skeleton-delay-1" />
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-2">
                <Skeleton variant="shimmer" className="h-3 sm:h-4 w-full skeleton-delay-2" />
                <Skeleton variant="shimmer" className="h-3 sm:h-4 w-5/6 skeleton-delay-3" />
                <Skeleton variant="shimmer" className="h-3 sm:h-4 w-4/6 skeleton-delay-4" />
              </div>
              
              {/* CTA buttons skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Skeleton variant="wave" className="h-10 sm:h-12 w-full sm:w-36 rounded-lg skeleton-delay-5" />
                <Skeleton variant="pulse" className="h-10 sm:h-12 w-full sm:w-32 rounded-lg skeleton-delay-5" />
              </div>
            </div>
            
            {/* Media content skeleton - only visible on larger screens */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <Skeleton variant="shimmer" className="w-full max-w-[400px] lg:max-w-[500px] aspect-video rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation controls skeleton */}
      <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 flex flex-col md:flex-row gap-2 sm:gap-4">
        <Skeleton variant="pulse" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full" />
        <Skeleton variant="pulse" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full" />
      </div>
      
      {/* Dots indicator skeleton */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="pulse" className={`w-3 h-3 rounded-full skeleton-delay-${i + 1}`} />
        ))}
      </div>
      
      {/* Progress bar skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <Skeleton variant="shimmer" className="h-full w-1/3" />
      </div>
    </div>
  );
};

// Categories Section Skeleton
export const CategoriesSkeleton = () => {
  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          {/* Mobile Layout - Scrollable Skeleton */}
          <div className="lg:hidden relative">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 px-4 sm:px-8 scrollbar-hide">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex flex-col items-center min-w-[90px] flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Layout - Carousel Skeleton */}
          <div className="hidden lg:block relative">
            <div className="flex items-center justify-center gap-6 lg:gap-8 px-8 lg:px-12">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex flex-col items-center min-w-[90px]">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Carousel Dots Indicator Skeleton */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="w-2 h-2 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Brands Marquee Skeleton
export const BrandsMarqueeSkeleton = () => {
  return (
    <div className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
        
        {/* Brands strip */}
        <div className="overflow-hidden">
          <div className="flex gap-8 animate-pulse">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <Skeleton className="w-32 h-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Skeleton
export const FooterSkeleton = () => {
  return (
    <div className="w-full bg-background border-t border-border">
      {/* Trust badges skeleton */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            
            {/* Newsletter */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex">
                <Skeleton className="flex-1 h-10 rounded-l-lg" />
                <Skeleton className="w-24 h-10 rounded-r-lg" />
              </div>
            </div>
            
            {/* Social links */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="flex space-x-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-12 h-12 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Link sections */}
          {[...Array(4)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <Skeleton className="h-6 w-20" />
              <div className="space-y-3">
                {[...Array(5)].map((_, linkIndex) => (
                  <Skeleton key={linkIndex} className="h-4 w-32" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact info skeleton */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3 ml-8">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom bar skeleton */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Skeleton className="h-4 w-64" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header/Navbar Skeleton
export const HeaderSkeleton = () => {
  return (
    <div className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo skeleton */}
          <Skeleton className="h-10 w-40" />
          
          {/* Navigation links skeleton */}
          <div className="hidden md:flex items-center space-x-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Skeleton className="w-12 h-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Generic Content Skeleton
export const ContentSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

// Loading Screen Skeleton (Full page)
export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HeroCarouselSkeleton />
        <div className="mt-16">
          <CategoriesSkeleton />
        </div>
        <div className="mt-16">
          <ProductGridSkeleton />
        </div>
        <div className="mt-16">
          <BrandsMarqueeSkeleton />
        </div>
      </div>
      <FooterSkeleton />
    </div>
  );
};

// Cart Page Skeleton
export const CartSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className={`flex items-center gap-4 border-b pb-4 skeleton-delay-${index + 1}`}>
            <Skeleton variant="shimmer" className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="wave" className="h-5 w-3/4" />
              <Skeleton variant="pulse" className="h-4 w-1/2" />
              <Skeleton variant="pulse" className="h-4 w-1/4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-12 h-8" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  );
};

// Wishlist Page Skeleton
export const WishlistSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <ProductCardSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
};

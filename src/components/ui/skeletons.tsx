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
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
      {/* Main image skeleton */}
      <Skeleton variant="shimmer" className="w-full h-full" />
      
      {/* Content overlay skeleton */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-lg space-y-6">
            {/* Headline skeleton */}
            <Skeleton variant="wave" className="h-12 w-full" />
            <Skeleton variant="wave" className="h-8 w-3/4 skeleton-delay-1" />
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton variant="shimmer" className="h-4 w-full skeleton-delay-2" />
              <Skeleton variant="shimmer" className="h-4 w-5/6 skeleton-delay-3" />
              <Skeleton variant="shimmer" className="h-4 w-4/6 skeleton-delay-4" />
            </div>
            
            {/* CTA buttons skeleton */}
            <div className="flex gap-4">
              <Skeleton variant="wave" className="h-12 w-36 rounded-lg skeleton-delay-5" />
              <Skeleton variant="pulse" className="h-12 w-32 rounded-lg skeleton-delay-5" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation arrows skeleton */}
      <Skeleton variant="pulse" className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full" />
      <Skeleton variant="pulse" className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full" />
      
      {/* Dots indicator skeleton */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="pulse" className={`w-3 h-3 rounded-full skeleton-delay-${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

// Categories Section Skeleton
export const CategoriesSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      
      {/* Categories grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="text-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
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

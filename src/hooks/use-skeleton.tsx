import { ReactNode } from "react";
import {
  ProductGridSkeleton,
  ProductCardSkeleton,
  HeroCarouselSkeleton,
  CategoriesSkeleton,
  BrandsMarqueeSkeleton,
  FooterSkeleton,
  HeaderSkeleton,
  DashboardSkeleton,
  ContentSkeleton,
} from "@/components/ui/skeletons";

export interface UseSkeletonProps {
  isLoading: boolean;
  type: 
    | "product-grid" 
    | "product-card" 
    | "hero-carousel" 
    | "categories" 
    | "brands-marquee" 
    | "footer" 
    | "header" 
    | "dashboard" 
    | "content";
  children: ReactNode;
  skeletonProps?: any;
}

/**
 * Hook that returns either skeleton or actual content based on loading state
 */
export const useSkeleton = ({ 
  isLoading, 
  type, 
  children, 
  skeletonProps = {} 
}: UseSkeletonProps) => {
  if (!isLoading) {
    return children;
  }

  switch (type) {
    case "product-grid":
      return <ProductGridSkeleton {...skeletonProps} />;
    case "product-card":
      return <ProductCardSkeleton {...skeletonProps} />;
    case "hero-carousel":
      return <HeroCarouselSkeleton {...skeletonProps} />;
    case "categories":
      return <CategoriesSkeleton {...skeletonProps} />;
    case "brands-marquee":
      return <BrandsMarqueeSkeleton {...skeletonProps} />;
    case "footer":
      return <FooterSkeleton {...skeletonProps} />;
    case "header":
      return <HeaderSkeleton {...skeletonProps} />;
    case "dashboard":
      return <DashboardSkeleton {...skeletonProps} />;
    case "content":
    default:
      return <ContentSkeleton {...skeletonProps} />;
  }
};

/**
 * Higher-order component wrapper for skeleton loading
 */
export const withSkeleton = <P extends object>(
  Component: React.ComponentType<P>,
  skeletonType: UseSkeletonProps["type"],
  skeletonProps?: any
) => {
  return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
    const content = useSkeleton({
      isLoading,
      type: skeletonType,
      children: <Component {...(props as P)} />,
      skeletonProps,
    });

    return <>{content}</>;
  };
};

/**
 * Utility functions for common skeleton patterns
 */
export const skeletonUtils = {
  /**
   * Create multiple skeleton items with staggered animations
   */
  createStaggered: (count: number, SkeletonComponent: React.ComponentType<any>, baseProps = {}) => {
    return Array.from({ length: count }, (_, index) => (
      <SkeletonComponent
        key={index}
        index={index}
        {...baseProps}
      />
    ));
  },

  /**
   * Get skeleton props based on viewport size
   */
  getResponsiveProps: (mobile: any, tablet: any, desktop: any) => {
    if (typeof window === 'undefined') return desktop;
    
    const width = window.innerWidth;
    if (width < 768) return mobile;
    if (width < 1024) return tablet;
    return desktop;
  },

  /**
   * Generate skeleton grid based on screen size
   */
  getGridCount: (defaultCount = 6) => {
    if (typeof window === 'undefined') return defaultCount;
    
    const width = window.innerWidth;
    if (width < 640) return Math.min(2, defaultCount); // Mobile: 2 items
    if (width < 1024) return Math.min(4, defaultCount); // Tablet: 4 items
    return defaultCount; // Desktop: full count
  },
};

export default useSkeleton;

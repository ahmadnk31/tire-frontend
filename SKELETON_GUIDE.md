# Skeleton Loading Components

This guide shows how to use the skeleton loading components throughout the application.

## Available Skeleton Components

### 1. ProductCardSkeleton
Shows a loading state for individual product cards.

```tsx
import { ProductCardSkeleton } from "@/components/ui/skeletons";

<ProductCardSkeleton index={0} />
```

### 2. ProductGridSkeleton
Shows a loading state for the entire product grid section.

```tsx
import { ProductGridSkeleton } from "@/components/ui/skeletons";

<ProductGridSkeleton 
  sectionTitle="Featured Products" 
  itemCount={6} 
/>
```

### 3. HeroCarouselSkeleton
Shows a loading state for the hero carousel.

```tsx
import { HeroCarouselSkeleton } from "@/components/ui/skeletons";

<HeroCarouselSkeleton />
```

### 4. CategoriesSkeleton
Shows a loading state for the categories section.

```tsx
import { CategoriesSkeleton } from "@/components/ui/skeletons";

<CategoriesSkeleton />
```

### 5. BrandsMarqueeSkeleton
Shows a loading state for the brands marquee.

```tsx
import { BrandsMarqueeSkeleton } from "@/components/ui/skeletons";

<BrandsMarqueeSkeleton />
```

### 6. HeaderSkeleton & FooterSkeleton
Shows loading states for header and footer.

```tsx
import { HeaderSkeleton, FooterSkeleton } from "@/components/ui/skeletons";

<HeaderSkeleton />
<FooterSkeleton />
```

### 7. DashboardSkeleton
Shows a loading state for dashboard with stats cards, charts, and tables.

```tsx
import { DashboardSkeleton } from "@/components/ui/skeletons";

<DashboardSkeleton />
```

### 8. LoadingSkeleton
Shows a complete page loading state.

```tsx
import { LoadingSkeleton } from "@/components/ui/skeletons";

<LoadingSkeleton />
```

## Using with React Query

The most common pattern is to use skeletons with React Query loading states:

```tsx
import { useQuery } from '@tanstack/react-query';
import { ProductGridSkeleton } from "@/components/ui/skeletons";

function ProductsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <ProductGridSkeleton sectionTitle="Products" itemCount={8} />;
  }

  if (error) {
    return <div>Error loading products</div>;
  }

  return <ProductGrid products={data} />;
}
```

## Using the useSkeleton Hook

For more flexibility, use the `useSkeleton` hook:

```tsx
import { useSkeleton } from "@/hooks/use-skeleton";

function MyComponent() {
  const { data, isLoading } = useQuery(['data'], fetchData);
  
  const content = useSkeleton({
    isLoading,
    type: "product-grid",
    children: <ActualContent data={data} />,
    skeletonProps: { itemCount: 6, sectionTitle: "Products" }
  });

  return <div>{content}</div>;
}
```

## Using the withSkeleton HOC

For components that always need skeleton loading:

```tsx
import { withSkeleton } from "@/hooks/use-skeleton";

const ProductGridWithSkeleton = withSkeleton(
  ProductGrid, 
  "product-grid", 
  { itemCount: 6, sectionTitle: "Products" }
);

// Usage
<ProductGridWithSkeleton isLoading={isLoading} products={products} />
```

## Skeleton Animation Variants

The base `Skeleton` component supports different animation variants:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Default pulse animation
<Skeleton className="w-20 h-4" />

// Shimmer animation
<Skeleton variant="shimmer" className="w-20 h-4" />

// Wave animation
<Skeleton variant="wave" className="w-20 h-4" />

// Pulse animation (explicit)
<Skeleton variant="pulse" className="w-20 h-4" />
```

## Staggered Animations

For better UX, skeleton items have staggered animations:

```tsx
// Automatic staggering in grid components
<div className="grid grid-cols-3 gap-4">
  {[...Array(6)].map((_, index) => (
    <ProductCardSkeleton key={index} index={index} />
  ))}
</div>

// Manual delay classes
<Skeleton className="w-20 h-4 skeleton-delay-1" />
<Skeleton className="w-20 h-4 skeleton-delay-2" />
<Skeleton className="w-20 h-4 skeleton-delay-3" />
```

## Responsive Skeleton Counts

Use utility functions for responsive skeleton counts:

```tsx
import { skeletonUtils } from "@/hooks/use-skeleton";

function ResponsiveProductGrid() {
  const { isLoading } = useQuery(['products'], fetchProducts);
  const skeletonCount = skeletonUtils.getGridCount(8);

  if (isLoading) {
    return <ProductGridSkeleton itemCount={skeletonCount} />;
  }

  return <ProductGrid />;
}
```

## Best Practices

1. **Match the Structure**: Skeletons should closely match the final content structure
2. **Use Staggered Animations**: Prevents overwhelming pulse effects
3. **Responsive Design**: Adjust skeleton counts based on screen size
4. **Consistent Timing**: Keep loading times predictable (2-3 seconds max)
5. **Graceful Degradation**: Always have fallback content for errors

## Custom Skeleton Components

To create custom skeletons for new components:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export const CustomComponentSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className={`flex items-center space-x-4 skeleton-delay-${(index % 5) + 1}`}>
          <Skeleton variant="shimmer" className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="wave" className="h-4 w-3/4" />
            <Skeleton variant="pulse" className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Integration Examples

### Product Page
```tsx
function ProductPage() {
  const { data: product, isLoading } = useQuery(['product', id], fetchProduct);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="shimmer" className="w-full h-96 rounded-lg" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} />;
}
```

### Dashboard Page
```tsx
function Dashboard() {
  const { data, isLoading } = useQuery(['dashboard'], fetchDashboard);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <DashboardContent data={data} />;
}
```

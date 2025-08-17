import React from "react";
import {
  ProductGridSkeleton,
  HeroCarouselSkeleton,
  CategoriesSkeleton,
  BrandsMarqueeSkeleton,
  FooterSkeleton,
  HeaderSkeleton,
  DashboardSkeleton,
  LoadingSkeleton,
  ContentSkeleton
} from "@/components/ui/skeletons";

// Example component showing how to use skeletons with loading states
export const SkeletonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeDemo, setActiveDemo] = React.useState<string>("all");

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [activeDemo]);

  const handleDemoChange = (demo: string) => {
    setActiveDemo(demo);
    setIsLoading(true);
  };

  const demoOptions = [
    { value: "all", label: "Full Page Loading" },
    { value: "hero", label: "Hero Carousel" },
    { value: "products", label: "Product Grid" },
    { value: "categories", label: "Categories" },
    { value: "brands", label: "Brands Marquee" },
    { value: "dashboard", label: "Dashboard" },
    { value: "content", label: "Generic Content" },
    { value: "header", label: "Header" },
    { value: "footer", label: "Footer" }
  ];

  const renderSkeleton = () => {
    if (!isLoading) {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-primary mb-4">Content Loaded!</h2>
          <p className="text-muted-foreground">This would be your actual content.</p>
        </div>
      );
    }

    switch (activeDemo) {
      case "all":
        return <LoadingSkeleton />;
      case "hero":
        return <HeroCarouselSkeleton />;
      case "products":
        return <ProductGridSkeleton sectionTitle="Featured Products" itemCount={9} />;
      case "categories":
        return <CategoriesSkeleton />;
      case "brands":
        return <BrandsMarqueeSkeleton />;
      case "dashboard":
        return <DashboardSkeleton />;
      case "content":
        return <ContentSkeleton />;
      case "header":
        return <HeaderSkeleton />;
      case "footer":
        return <FooterSkeleton />;
      default:
        return <LoadingSkeleton />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary mb-6">Skeleton Loading Demos</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {demoOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDemoChange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeDemo === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Click any button above to see different skeleton loading states. Each demo resets the loading state for 3 seconds.
          </p>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderSkeleton()}
      </div>
    </div>
  );
};

export default SkeletonExamples;

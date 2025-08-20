import { ProductGrid } from "@/components/store/ProductGrid";
import { SEO } from "@/components/seo/SEO";
import { usePageSEO } from "@/hooks/useSEO";

const Products = () => {
  const seoConfig = usePageSEO();

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoConfig} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid />
      </main>
    </div>
  );
};

export default Products;

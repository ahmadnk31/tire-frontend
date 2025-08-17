import { ProductGrid } from "@/components/store/ProductGrid";

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid />
      </main>
    </div>
  );
};

export default Products;

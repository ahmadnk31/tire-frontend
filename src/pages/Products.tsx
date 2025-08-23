import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from "@/components/store/ProductGrid";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const featuredOnly = searchParams.get('featured') === 'true';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden p-4 border-b border-gray-200 bg-white">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2"
            >
              {isFilterOpen ? (
                <>
                  <X className="h-4 w-4" />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" />
                  Show Filters
                </>
              )}
            </Button>
          </div>
          
          {/* Products Grid */}
          <main className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
            <ProductGrid 
              sectionTitle={featuredOnly ? "Best Sellers" : "All Products"} 
              featuredOnly={featuredOnly}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

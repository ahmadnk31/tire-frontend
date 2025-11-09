import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ProductGrid } from "@/components/store/ProductGrid";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const featuredOnly = searchParams.get('featured') === 'true';
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <>
      <Helmet>
        <title>{featuredOnly ? t('seo.products.featuredTitle') : t('seo.products.title')}</title>
        <meta name="description" content={featuredOnly ? t('seo.products.featuredDescription') : t('seo.products.description')} />
        <meta name="keywords" content={t('seo.products.keywords')} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://arianabandencentralebv.be/products${featuredOnly ? '?featured=true' : ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={featuredOnly ? t('seo.products.featuredOgTitle') : t('seo.products.ogTitle')} />
        <meta property="og:description" content={featuredOnly ? t('seo.products.featuredOgDescription') : t('seo.products.ogDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://arianabandencentralebv.be/products${featuredOnly ? '?featured=true' : ''}`} />
        <meta property="og:locale" content={currentLang === 'nl' ? 'nl_BE' : 'en_US'} />
        
        {/* Twitter */}
        <meta name="twitter:title" content={featuredOnly ? t('seo.products.featuredTwitterTitle') : t('seo.products.twitterTitle')} />
        <meta name="twitter:description" content={featuredOnly ? t('seo.products.featuredTwitterDescription') : t('seo.products.twitterDescription')} />
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": featuredOnly ? "Best Selling Tires" : "All Tires & Wheels",
            "description": featuredOnly ? "Our most popular tire models" : "Complete collection of winter, summer, and all-season tires",
            "url": `https://arianabandencentralebv.be/products${featuredOnly ? '?featured=true' : ''}`,
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://arianabandencentralebv.be/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Products",
                  "item": "https://arianabandencentralebv.be/products"
                }
              ]
            }
          })}
        </script>
        
        {/* Multi-lingual / Alternate language versions */}
        <link rel="alternate" hrefLang="nl" href={`https://arianabandencentralebv.be/nl/products${featuredOnly ? '?featured=true' : ''}`} />
        <link rel="alternate" hrefLang="en" href={`https://arianabandencentralebv.be/en/products${featuredOnly ? '?featured=true' : ''}`} />
        <link rel="alternate" hrefLang="x-default" href={`https://arianabandencentralebv.be/products${featuredOnly ? '?featured=true' : ''}`} />
        <meta property="og:locale:alternate" content={currentLang === 'nl' ? 'en_US' : 'nl_BE'} />
      </Helmet>
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
    </>
  );
};

export default Products;

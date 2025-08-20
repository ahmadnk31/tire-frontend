import { Store } from "@/components/store/Store";
import { SEO } from "@/components/seo/SEO";
import { usePageSEO } from "@/hooks/useSEO";
import { createWebsiteSchema, createOrganizationSchema } from "@/components/seo/schema";

const Index = () => {
  const seoConfig = usePageSEO();
  
  const websiteSchema = createWebsiteSchema();
  const organizationSchema = createOrganizationSchema();
  
  // Combine schemas
  const combinedSchema = [websiteSchema, organizationSchema];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        {...seoConfig}
        schema={combinedSchema}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Store />
        
      </main>
    </div>
  );
};

export default Index;

import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: object;
}

export const useSEO = (config?: SEOConfig) => {
  const location = useLocation();
  const currentUrl = `https://ariana-bandencentraal.com${location.pathname}`;
  
  const defaultConfig: SEOConfig = {
    title: '',
    description: 'Find the perfect tires for your vehicle. Premium quality tires for cars, trucks, SUVs, and motorcycles. Expert installation and competitive prices.',
    keywords: 'tires, wheels, automotive, car tires, truck tires, tire installation, Ariana',
    image: '/logo.png',
    type: 'website',
    noIndex: false
  };

  return {
    ...defaultConfig,
    ...config,
    url: currentUrl,
    canonicalUrl: currentUrl
  };
};

// Hook for generating page-specific SEO based on route
export const usePageSEO = () => {
  const location = useLocation();
  
  const getPageSEO = (): SEOConfig => {
    const path = location.pathname;
    
    switch (true) {
      case path === '/':
        return {
          title: 'Premium Tire Store',
          description: 'Find the perfect tires for your vehicle. Premium quality tires for cars, trucks, SUVs, and motorcycles. Expert installation and competitive prices.',
          keywords: 'tires, wheels, automotive, car tires, truck tires, tire installation, premium tires, Ariana Bandencentraal',
          type: 'website'
        };
        
      case path.startsWith('/products') && !path.includes('/products/'):
        return {
          title: 'All Products - Tire Catalog',
          description: 'Browse our complete catalog of premium tires for all vehicle types. Find the perfect fit for your car, truck, SUV, or motorcycle.',
          keywords: 'tire catalog, all tires, car tires, truck tires, SUV tires, motorcycle tires',
          type: 'website'
        };
        
      case path.startsWith('/about'):
        return {
          title: 'About Us',
          description: 'Learn about Ariana Bandencentraal, your trusted premium tire store. Expert service, quality products, and customer satisfaction guaranteed.',
          keywords: 'about ariana bandencentraal, tire store, expert installation, customer service',
          type: 'website'
        };
        
      case path.startsWith('/contact'):
        return {
          title: 'Contact Us',
          description: 'Get in touch with Ariana Bandencentraal. Find our location, hours, and contact information for tire sales and installation services.',
          keywords: 'contact, tire store location, hours, phone, address',
          type: 'website'
        };
        
      case path.startsWith('/size-guide'):
        return {
          title: 'Tire Size Guide',
          description: 'Learn how to find the right tire size for your vehicle. Complete guide to understanding tire specifications and measurements.',
          keywords: 'tire size guide, tire measurements, tire specifications, how to find tire size',
          type: 'article'
        };
        
      case path.startsWith('/cart'):
        return {
          title: 'Shopping Cart',
          description: 'Review your selected tires and proceed to checkout. Secure payment and professional installation available.',
          keywords: 'shopping cart, checkout, tire purchase',
          type: 'website',
          noIndex: true
        };
        
      case path.startsWith('/wishlist'):
        return {
          title: 'Wishlist',
          description: 'Your saved tire selections. Keep track of products you\'re interested in and purchase when ready.',
          keywords: 'wishlist, saved tires, favorites',
          type: 'website',
          noIndex: true
        };
        
      case path.startsWith('/account'):
      case path.startsWith('/orders'):
      case path.startsWith('/settings'):
        return {
          title: 'My Account',
          description: 'Manage your Ariana Bandencentraal account, view orders, and update your preferences.',
          keywords: 'account, orders, user profile',
          type: 'website',
          noIndex: true
        };
        
      default:
        return {
          title: '',
          description: 'Find the perfect tires for your vehicle. Premium quality tires for cars, trucks, SUVs, and motorcycles. Expert installation and competitive prices.',
          keywords: 'tires, wheels, automotive, car tires, truck tires, tire installation, Ariana',
          type: 'website'
        };
    }
  };
  
  return useSEO(getPageSEO());
};
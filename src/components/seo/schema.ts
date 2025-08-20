// Schema.org utility functions for different content types

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  sku?: string;
  stock?: number;
  category?: string;
  specifications?: any;
  rating?: number;
  reviewCount?: number;
}

export const createProductSchema = (product: Product, baseUrl: string = 'https://ariana-bandencentraal.com') => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "sku": product.sku,
    "image": product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Ariana Bandencentraal"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "EUR",
      "availability": product.stock && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Ariana Bandencentraal",
        "url": baseUrl
      }
    },
    "category": product.category || "Tires"
  };

  // Add price comparison if available
  if (product.comparePrice && product.comparePrice > product.price) {
    (schema.offers as any) = {
      "@type": "AggregateOffer",
      "lowPrice": product.price,
      "highPrice": product.comparePrice,
      "offerCount": 1,
      "priceCurrency": "EUR",
      "availability": product.stock && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Ariana Bandencentraal",
        "url": baseUrl
      }
    };
  }

  // Add rating if available
  if (product.rating && product.reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "ratingCount": product.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return schema;
};

export const createBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>, baseUrl: string = 'https://ariana-bandencentraal.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
};

export const createOrganizationSchema = (baseUrl: string = 'https://ariana-bandencentraal.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Ariana Bandencentraal",
    "description": "Premium tire store offering quality tires for all vehicle types",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Dutch"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NL"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
};

export const createWebsiteSchema = (baseUrl: string = 'https://ariana-bandencentraal.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ariana Bandencentraal",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
};

export const createProductListSchema = (products: Product[], baseUrl: string = 'https://ariana-bandencentraal.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": createProductSchema(product, baseUrl)
    }))
  };
};
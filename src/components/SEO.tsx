import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = '/banden-og.png',
  url,
  type = 'website',
  structuredData
}) => {
  const { t, i18n } = useTranslation();
  
  const siteName = 'Ariana Banden Service';
  const defaultTitle = t('seo.defaultTitle');
  const defaultDescription = t('seo.defaultDescription');
  const defaultKeywords = t('seo.defaultKeywords');
  
  const fullTitle = title ? `${title} | ${siteName}` : `${defaultTitle} | ${siteName}`;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const currentUrl = url || window.location.href;
  const currentLanguage = i18n.language || 'en';
  const alternateLanguage = currentLanguage === 'en' ? 'nl' : 'en';
  
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ariana Banden Service",
    "url": "https://arianabandencentralebv.be",
    "logo": "https://arianabandencentralebv.be/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+32-467-66-21-97",
      "contactType": currentLanguage === 'en' ? "Customer Service" : "Klantenservice",
      "availableLanguage": currentLanguage === 'en' ? ["Dutch", "French", "English"] : ["Nederlands", "Frans", "Engels"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Provinciebaan 192A",
      "addressLocality": "Ledegem",
      "postalCode": "8880",
      "addressCountry": "BE"
    },
    "sameAs": [
      "https://facebook.com/bandenledegembandenledegem",
      "https://instagram.com/arianabandenservice",
      "https://tiktok.com/@arianabanden"
    ]
  };

  const localBusinessStructuredData = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Ariana Banden Service",
    "description": currentLanguage === 'en' 
      ? "Professional tire sales, installation, and automotive services in Ledegem, Belgium"
      : "Professionele bandenverkoop, installatie en automotive services in Ledegem, België",
    "url": "https://arianabandencentralebv.be",
    "telephone": "+32-467-66-21-97",
    "email": "info@ariana-bandencentraal.be",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Provinciebaan 192A",
      "addressLocality": "Ledegem",
      "postalCode": "8880",
      "addressCountry": "BE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "50.8786294",
      "longitude": "3.1125472"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-18:00"
    ],
    "priceRange": "$$",
    "paymentAccepted": currentLanguage === 'en' 
      ? ["Visa", "Mastercard", "PayPal", "Apple Pay", "Cash"]
      : ["Visa", "Mastercard", "PayPal", "Apple Pay", "Contant"],
    "currenciesAccepted": "EUR",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "120"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="Ariana Banden Service" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={currentLanguage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Alternate Language Links */}
      <link rel="alternate" hrefLang={currentLanguage} href={currentUrl} />
      <link rel="alternate" hrefLang={alternateLanguage} href={currentUrl.replace(`/${currentLanguage}/`, `/${alternateLanguage}/`)} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl.replace(`/${currentLanguage}/`, '/')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${window.location.origin}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLanguage === 'en' ? 'en_US' : 'nl_BE'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${window.location.origin}${image}`} />
      <meta name="twitter:image:alt" content={fullTitle} />
      
      {/* Mobile & Responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Theme & App */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessStructuredData)}
      </script>
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Additional Meta Tags for Business */}
      <meta name="geo.region" content="BE-VWV" />
      <meta name="geo.placename" content="Ledegem" />
      <meta name="geo.position" content="50.8786294;3.1125472" />
      <meta name="ICBM" content="50.8786294, 3.1125472" />
      
      {/* Business Information */}
      <meta name="business:contact_data:street_address" content="Provinciebaan 192A" />
      <meta name="business:contact_data:locality" content="Ledegem" />
      <meta name="business:contact_data:postal_code" content="8880" />
      <meta name="business:contact_data:country_name" content="Belgium" />
      <meta name="business:contact_data:phone_number" content="+32-467-66-21-97" />
      <meta name="business:contact_data:email" content="info@ariana-bandencentraal.be" />
    </Helmet>
  );
};

export default SEO;

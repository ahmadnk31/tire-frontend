import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  canonicalUrl?: string;
  schema?: object;
}

const DEFAULT_TITLE = 'Ariana Bandencentraal - Premium Tire Store';
const DEFAULT_DESCRIPTION = 'Find the perfect tires for your vehicle. Premium quality tires for cars, trucks, SUVs, and motorcycles. Expert installation and competitive prices.';
const DEFAULT_IMAGE = '/logo.png';
const DEFAULT_URL = 'https://ariana-bandencentraal.com';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
  type = 'website',
  noIndex = false,
  canonicalUrl,
  schema
}) => {
  const fullTitle = title ? `${title} | Ariana Bandencentraal` : DEFAULT_TITLE;
  const fullImageUrl = image.startsWith('http') ? image : `${DEFAULT_URL}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_URL}${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Ariana Bandencentraal" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@ariana_tires" />
      
      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
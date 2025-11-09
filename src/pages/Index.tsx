import { Store } from "@/components/store/Store";
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta name="keywords" content={t('seo.home.keywords')} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://arianabandencentralebv.be/" />
        
        {/* Alternate language versions */}
        <link rel="alternate" hrefLang="nl" href="https://arianabandencentralebv.be/nl" />
        <link rel="alternate" hrefLang="en" href="https://arianabandencentralebv.be/en" />
        <link rel="alternate" hrefLang="x-default" href="https://arianabandencentralebv.be/" />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('seo.home.ogTitle')} />
        <meta property="og:description" content={t('seo.home.ogDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://arianabandencentralebv.be/" />
        <meta property="og:locale" content={currentLang === 'nl' ? 'nl_BE' : 'en_US'} />
        
        {/* Twitter */}
        <meta name="twitter:title" content={t('seo.home.twitterTitle')} />
        <meta name="twitter:description" content={t('seo.home.twitterDescription')} />
        
        {/* Additional tire-specific meta */}
        <meta name="product" content="Autobanden, Winterbanden, Zomerbanden, All-season banden, Velgen" />
        <meta name="category" content="Automotive, Tires, Wheels, Car Parts" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Store />
      </div>
    </>
  );
};

export default Index;

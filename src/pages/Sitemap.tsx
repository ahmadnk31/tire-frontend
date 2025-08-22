import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FileText, ShoppingBag, Users, HelpCircle, Shield } from 'lucide-react';

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: { href: string; label: string; description?: string }[];
}

const Sitemap: React.FC = () => {
  const { t } = useTranslation();

  const sitemapSections: SitemapSection[] = [
    {
      title: t('sitemap.sections.main.title'),
      icon: <FileText className="h-6 w-6" />,
      links: [
        { href: '/', label: t('sitemap.sections.main.links.home'), description: t('sitemap.sections.main.descriptions.home') },
        { href: '/about', label: t('sitemap.sections.main.links.about'), description: t('sitemap.sections.main.descriptions.about') },
        { href: '/contact', label: t('sitemap.sections.main.links.contact'), description: t('sitemap.sections.main.descriptions.contact') },
      ]
    },
    {
      title: t('sitemap.sections.shop.title'),
      icon: <ShoppingBag className="h-6 w-6" />,
      links: [
        { href: '/products', label: t('sitemap.sections.shop.links.products'), description: t('sitemap.sections.shop.descriptions.products') },
        { href: '/categories', label: t('sitemap.sections.shop.links.categories'), description: t('sitemap.sections.shop.descriptions.categories') },
        { href: '/brands', label: t('sitemap.sections.shop.links.brands'), description: t('sitemap.sections.shop.descriptions.brands') },
        { href: '/cart', label: t('sitemap.sections.shop.links.cart'), description: t('sitemap.sections.shop.descriptions.cart') },
        { href: '/wishlist', label: t('sitemap.sections.shop.links.wishlist'), description: t('sitemap.sections.shop.descriptions.wishlist') },
        { href: '/checkout', label: t('sitemap.sections.shop.links.checkout'), description: t('sitemap.sections.shop.descriptions.checkout') },
      ]
    },
    {
      title: t('sitemap.sections.account.title'),
      icon: <Users className="h-6 w-6" />,
      links: [
        { href: '/login', label: t('sitemap.sections.account.links.login'), description: t('sitemap.sections.account.descriptions.login') },
        { href: '/register', label: t('sitemap.sections.account.links.register'), description: t('sitemap.sections.account.descriptions.register') },
        { href: '/account', label: t('sitemap.sections.account.links.account'), description: t('sitemap.sections.account.descriptions.account') },
        { href: '/orders', label: t('sitemap.sections.account.links.orders'), description: t('sitemap.sections.account.descriptions.orders') },
        { href: '/settings', label: t('sitemap.sections.account.links.settings'), description: t('sitemap.sections.account.descriptions.settings') },
      ]
    },
    {
      title: t('sitemap.sections.support.title'),
      icon: <HelpCircle className="h-6 w-6" />,
      links: [
        { href: '/faq', label: t('sitemap.sections.support.links.faq'), description: t('sitemap.sections.support.descriptions.faq') },
        { href: '/returns', label: t('sitemap.sections.support.links.returns'), description: t('sitemap.sections.support.descriptions.returns') },
        { href: '/shipping', label: t('sitemap.sections.support.links.shipping'), description: t('sitemap.sections.support.descriptions.shipping') },
        { href: '/size-guide', label: t('sitemap.sections.support.links.sizeGuide'), description: t('sitemap.sections.support.descriptions.sizeGuide') },
      ]
    },
    {
      title: t('sitemap.sections.company.title'),
      icon: <Users className="h-6 w-6" />,
      links: [
        { href: '/blog', label: t('sitemap.sections.company.links.blog'), description: t('sitemap.sections.company.descriptions.blog') },
        { href: '/careers', label: t('sitemap.sections.company.links.careers'), description: t('sitemap.sections.company.descriptions.careers') },
        { href: '/press', label: t('sitemap.sections.company.links.press'), description: t('sitemap.sections.company.descriptions.press') },
        { href: '/sustainability', label: t('sitemap.sections.company.links.sustainability'), description: t('sitemap.sections.company.descriptions.sustainability') },
      ]
    },
    {
      title: t('sitemap.sections.legal.title'),
      icon: <Shield className="h-6 w-6" />,
      links: [
        { href: '/privacy', label: t('sitemap.sections.legal.links.privacy'), description: t('sitemap.sections.legal.descriptions.privacy') },
        { href: '/terms', label: t('sitemap.sections.legal.links.terms'), description: t('sitemap.sections.legal.descriptions.terms') },
        { href: '/cookies', label: t('sitemap.sections.legal.links.cookies'), description: t('sitemap.sections.legal.descriptions.cookies') },
        { href: '/accessibility', label: t('sitemap.sections.legal.links.accessibility'), description: t('sitemap.sections.legal.descriptions.accessibility') },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('sitemap.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('sitemap.description')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sitemapSections.reduce((acc, section) => acc + section.links.length, 0)}
            </div>
            <div className="text-sm text-gray-600">{t('sitemap.stats.pages')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">6</div>
            <div className="text-sm text-gray-600">{t('sitemap.stats.sections')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">2</div>
            <div className="text-sm text-gray-600">{t('sitemap.stats.languages')}</div>
          </div>
        </div>

        {/* Sitemap Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sitemapSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="text-primary">{section.icon}</div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="group">
                    <a
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {link.label}
                        </div>
                        {link.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {link.description}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* XML Sitemap */}
        <div className="mt-12 bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('sitemap.xml.title')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('sitemap.xml.description')}
          </p>
          <div className="flex justify-center">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-5 w-5" />
              {t('sitemap.xml.download')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('sitemap.lastUpdated')}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Shield, Settings, Eye, BarChart, Calendar } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  enabled: boolean;
  cookies: Array<{
    name: string;
    purpose: string;
    duration: string;
    provider: string;
  }>;
}

const Cookies: React.FC = () => {
  const { t } = useTranslation();

  const [cookieCategories, setCookieCategories] = useState<CookieCategory[]>([
    {
      id: 'essential',
      name: t('cookies.categories.essential.name'),
      description: t('cookies.categories.essential.description'),
      essential: true,
      enabled: true,
      cookies: [
        {
          name: 'session_id',
          purpose: t('cookies.categories.essential.cookies.session.purpose'),
          duration: t('cookies.categories.essential.cookies.session.duration'),
          provider: 'Ariana Banden'
        },
        {
          name: 'csrf_token',
          purpose: t('cookies.categories.essential.cookies.csrf.purpose'),
          duration: t('cookies.categories.essential.cookies.csrf.duration'),
          provider: 'Ariana Banden'
        },
      ]
    },
    {
      id: 'functional',
      name: t('cookies.categories.functional.name'),
      description: t('cookies.categories.functional.description'),
      essential: false,
      enabled: true,
      cookies: [
        {
          name: 'language_preference',
          purpose: t('cookies.categories.functional.cookies.language.purpose'),
          duration: t('cookies.categories.functional.cookies.language.duration'),
          provider: 'Ariana Banden'
        },
        {
          name: 'theme_preference',
          purpose: t('cookies.categories.functional.cookies.theme.purpose'),
          duration: t('cookies.categories.functional.cookies.theme.duration'),
          provider: 'Ariana Banden'
        },
      ]
    },
    {
      id: 'analytics',
      name: t('cookies.categories.analytics.name'),
      description: t('cookies.categories.analytics.description'),
      essential: false,
      enabled: false,
      cookies: [
        {
          name: '_ga',
          purpose: t('cookies.categories.analytics.cookies.ga.purpose'),
          duration: t('cookies.categories.analytics.cookies.ga.duration'),
          provider: 'Google Analytics'
        },
        {
          name: '_gid',
          purpose: t('cookies.categories.analytics.cookies.gid.purpose'),
          duration: t('cookies.categories.analytics.cookies.gid.duration'),
          provider: 'Google Analytics'
        },
      ]
    },
    {
      id: 'marketing',
      name: t('cookies.categories.marketing.name'),
      description: t('cookies.categories.marketing.description'),
      essential: false,
      enabled: false,
      cookies: [
        {
          name: '_fbp',
          purpose: t('cookies.categories.marketing.cookies.fbp.purpose'),
          duration: t('cookies.categories.marketing.cookies.fbp.duration'),
          provider: 'Facebook'
        },
        {
          name: 'ads_preferences',
          purpose: t('cookies.categories.marketing.cookies.ads.purpose'),
          duration: t('cookies.categories.marketing.cookies.ads.duration'),
          provider: 'Ariana Banden'
        },
      ]
    },
  ]);

  const toggleCategory = (categoryId: string) => {
    setCookieCategories(prev =>
      prev.map(category =>
        category.id === categoryId && !category.essential
          ? { ...category, enabled: !category.enabled }
          : category
      )
    );
  };

  const savePreferences = () => {
    // Save cookie preferences to localStorage
    const preferences = cookieCategories.reduce((acc, category) => {
      acc[category.id] = category.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert(t('cookies.preferences.saved'));
  };

  const acceptAll = () => {
    setCookieCategories(prev =>
      prev.map(category => ({ ...category, enabled: true }))
    );
  };

  const rejectAll = () => {
    setCookieCategories(prev =>
      prev.map(category => ({ ...category, enabled: category.essential }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('cookies.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {t('cookies.description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {t('cookies.lastUpdated')}: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* What are cookies */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('cookies.what.title')}
            </h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('cookies.what.description')}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t('cookies.what.usage')}
            </p>
          </div>
        </div>

        {/* Cookie Preferences */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('cookies.preferences.title')}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                {t('cookies.preferences.acceptAll')}
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                {t('cookies.preferences.rejectAll')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {cookieCategories.map(category => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {category.name}
                      {category.essential && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {t('cookies.essential')}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      disabled={category.essential}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        category.enabled
                          ? 'bg-primary'
                          : 'bg-gray-200'
                      } ${category.essential ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          category.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Cookie Details */}
                <div className="space-y-3">
                  {category.cookies.map((cookie, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {t('cookies.details.name')}
                          </div>
                          <div className="text-gray-600">{cookie.name}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {t('cookies.details.purpose')}
                          </div>
                          <div className="text-gray-600">{cookie.purpose}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {t('cookies.details.duration')}
                          </div>
                          <div className="text-gray-600">{cookie.duration}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {t('cookies.details.provider')}
                          </div>
                          <div className="text-gray-600">{cookie.provider}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={savePreferences}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('cookies.preferences.save')}
            </button>
          </div>
        </div>

        {/* How to manage cookies */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('cookies.manage.title')}
            </h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('cookies.manage.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('cookies.manage.browser.title')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li>• <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li>• <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li>• <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('cookies.manage.thirdParty.title')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
                  <li>• <a href="https://www.facebook.com/help/568137493302217" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Facebook Cookie Settings</a></li>
                  <li>• <a href="http://www.youronlinechoices.eu/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('cookies.contact.title')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('cookies.contact.description')}
          </p>
          <div className="text-center">
            <a
              href="mailto:privacy@arianabanden.be"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Shield className="h-5 w-5" />
              privacy@arianabanden.be
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;

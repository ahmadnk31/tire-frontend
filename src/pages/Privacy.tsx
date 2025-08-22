import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Users, Mail, Calendar } from 'lucide-react';

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'information-collection',
      title: t('privacy.sections.collection.title'),
      icon: <Users className="h-6 w-6" />,
      content: t('privacy.sections.collection.content'),
    },
    {
      id: 'information-use',
      title: t('privacy.sections.use.title'),
      icon: <Eye className="h-6 w-6" />,
      content: t('privacy.sections.use.content'),
    },
    {
      id: 'information-sharing',
      title: t('privacy.sections.sharing.title'),
      icon: <Users className="h-6 w-6" />,
      content: t('privacy.sections.sharing.content'),
    },
    {
      id: 'data-security',
      title: t('privacy.sections.security.title'),
      icon: <Lock className="h-6 w-6" />,
      content: t('privacy.sections.security.content'),
    },
    {
      id: 'cookies',
      title: t('privacy.sections.cookies.title'),
      icon: <Shield className="h-6 w-6" />,
      content: t('privacy.sections.cookies.content'),
    },
    {
      id: 'your-rights',
      title: t('privacy.sections.rights.title'),
      icon: <Shield className="h-6 w-6" />,
      content: t('privacy.sections.rights.content'),
    },
  ];

  const dataTypes = [
    {
      type: t('privacy.dataTypes.personal.type'),
      description: t('privacy.dataTypes.personal.description'),
      examples: t('privacy.dataTypes.personal.examples'),
    },
    {
      type: t('privacy.dataTypes.technical.type'),
      description: t('privacy.dataTypes.technical.description'),
      examples: t('privacy.dataTypes.technical.examples'),
    },
    {
      type: t('privacy.dataTypes.usage.type'),
      description: t('privacy.dataTypes.usage.description'),
      examples: t('privacy.dataTypes.usage.examples'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {t('privacy.description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('privacy.overview.title')}
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              {t('privacy.overview.point1')}
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              {t('privacy.overview.point2')}
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              {t('privacy.overview.point3')}
            </li>
          </ul>
        </div>

        {/* Data Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('privacy.dataTypes.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataTypes.map((dataType, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {dataType.type}
                </h3>
                <p className="text-gray-600 mb-3">
                  {dataType.description}
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {t('privacy.examples')}:
                  </div>
                  <div className="text-sm text-gray-600">
                    {dataType.examples}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="text-primary">{section.icon}</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GDPR Rights */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('privacy.gdpr.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('privacy.gdpr.rights.title')}
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('privacy.gdpr.rights.access')}</li>
                <li>• {t('privacy.gdpr.rights.rectification')}</li>
                <li>• {t('privacy.gdpr.rights.erasure')}</li>
                <li>• {t('privacy.gdpr.rights.portability')}</li>
                <li>• {t('privacy.gdpr.rights.restriction')}</li>
                <li>• {t('privacy.gdpr.rights.objection')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('privacy.gdpr.exercise.title')}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {t('privacy.gdpr.exercise.description')}
              </p>
              <a
                href="mailto:privacy@arianabanden.be"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Mail className="h-4 w-4" />
                privacy@arianabanden.be
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('privacy.contact.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('privacy.contact.company')}
              </h3>
              <div className="text-gray-700 space-y-1">
                <div>Ariana Banden Service</div>
                <div>Provinciebaan 192A</div>
                <div>8880 Ledegem, Belgium</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('privacy.contact.dpo')}
              </h3>
              <div className="text-gray-700 space-y-1">
                <a
                  href="mailto:privacy@arianabanden.be"
                  className="flex items-center gap-2 text-primary hover:text-primary/80"
                >
                  <Mail className="h-4 w-4" />
                  privacy@arianabanden.be
                </a>
                <div>+32 56 51 28 29</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, Scale, AlertTriangle, Shield, Mail } from 'lucide-react';

const Terms: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      title: t('terms.sections.acceptance.title'),
      icon: <Scale className="h-6 w-6" />,
      content: t('terms.sections.acceptance.content'),
    },
    {
      id: 'definitions',
      title: t('terms.sections.definitions.title'),
      icon: <FileText className="h-6 w-6" />,
      content: t('terms.sections.definitions.content'),
    },
    {
      id: 'products-services',
      title: t('terms.sections.products.title'),
      icon: <Shield className="h-6 w-6" />,
      content: t('terms.sections.products.content'),
    },
    {
      id: 'orders-payment',
      title: t('terms.sections.orders.title'),
      icon: <FileText className="h-6 w-6" />,
      content: t('terms.sections.orders.content'),
    },
    {
      id: 'shipping-delivery',
      title: t('terms.sections.shipping.title'),
      icon: <FileText className="h-6 w-6" />,
      content: t('terms.sections.shipping.content'),
    },
    {
      id: 'returns-refunds',
      title: t('terms.sections.returns.title'),
      icon: <FileText className="h-6 w-6" />,
      content: t('terms.sections.returns.content'),
    },
    {
      id: 'warranty',
      title: t('terms.sections.warranty.title'),
      icon: <Shield className="h-6 w-6" />,
      content: t('terms.sections.warranty.content'),
    },
    {
      id: 'liability',
      title: t('terms.sections.liability.title'),
      icon: <AlertTriangle className="h-6 w-6" />,
      content: t('terms.sections.liability.content'),
    },
    {
      id: 'intellectual-property',
      title: t('terms.sections.intellectual.title'),
      icon: <Shield className="h-6 w-6" />,
      content: t('terms.sections.intellectual.content'),
    },
    {
      id: 'user-conduct',
      title: t('terms.sections.conduct.title'),
      icon: <AlertTriangle className="h-6 w-6" />,
      content: t('terms.sections.conduct.content'),
    },
    {
      id: 'termination',
      title: t('terms.sections.termination.title'),
      icon: <FileText className="h-6 w-6" />,
      content: t('terms.sections.termination.content'),
    },
    {
      id: 'governing-law',
      title: t('terms.sections.governing.title'),
      icon: <Scale className="h-6 w-6" />,
      content: t('terms.sections.governing.content'),
    },
  ];

  const keyPoints = [
    {
      title: t('terms.keyPoints.acceptance.title'),
      description: t('terms.keyPoints.acceptance.description'),
    },
    {
      title: t('terms.keyPoints.warranty.title'),
      description: t('terms.keyPoints.warranty.description'),
    },
    {
      title: t('terms.keyPoints.returns.title'),
      description: t('terms.keyPoints.returns.description'),
    },
    {
      title: t('terms.keyPoints.liability.title'),
      description: t('terms.keyPoints.liability.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {t('terms.description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {t('terms.lastUpdated')}: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('terms.keyPoints.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyPoints.map((point, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('terms.notice.title')}
              </h3>
              <p className="text-gray-700">
                {t('terms.notice.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('terms.tableOfContents')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-primary text-sm">{index + 1}.</span>
                <span className="text-gray-700 hover:text-primary transition-colors">
                  {section.title}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} id={section.id} className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="text-primary">{section.icon}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{index + 1}.</span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dispute Resolution */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('terms.dispute.title')}
          </h2>
          <div className="text-gray-700 space-y-3">
            <p>{t('terms.dispute.mediation')}</p>
            <p>{t('terms.dispute.arbitration')}</p>
            <p>{t('terms.dispute.jurisdiction')}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('terms.contact.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('terms.contact.company')}
              </h3>
              <div className="text-gray-700 space-y-1">
                <div>Ariana Banden Service BVBA</div>
                <div>BTW: BE 0123.456.789</div>
                <div>Provinciebaan 192A</div>
                <div>8880 Ledegem, Belgium</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('terms.contact.legal')}
              </h3>
              <div className="text-gray-700 space-y-1">
                <a
                  href="mailto:legal@arianabanden.be"
                  className="flex items-center gap-2 text-primary hover:text-primary/80"
                >
                  <Mail className="h-4 w-4" />
                  legal@arianabanden.be
                </a>
                <div>
                  +32 467 66 21 97
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Effective Date */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('terms.effective')}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Terms;

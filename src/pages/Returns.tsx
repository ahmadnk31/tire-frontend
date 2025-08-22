import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const Returns: React.FC = () => {
  const { t } = useTranslation();

  const returnSteps = [
    {
      icon: <Package className="h-8 w-8" />,
      title: t('returns.steps.initiate.title'),
      description: t('returns.steps.initiate.description'),
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: t('returns.steps.package.title'),
      description: t('returns.steps.package.description'),
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: t('returns.steps.ship.title'),
      description: t('returns.steps.ship.description'),
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: t('returns.steps.refund.title'),
      description: t('returns.steps.refund.description'),
    },
  ];

  const returnConditions = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      condition: t('returns.conditions.unused'),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      condition: t('returns.conditions.original'),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      condition: t('returns.conditions.within30'),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      condition: t('returns.conditions.receipt'),
    },
  ];

  const nonReturnableItems = [
    {
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      item: t('returns.nonReturnable.installed'),
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      item: t('returns.nonReturnable.damaged'),
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      item: t('returns.nonReturnable.custom'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('returns.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('returns.description')}
          </p>
        </div>

        {/* Return Policy Overview */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('returns.policy.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('returns.policy.timeframe.title')}</h3>
              <p className="text-gray-600">{t('returns.policy.timeframe.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('returns.policy.process.title')}</h3>
              <p className="text-gray-600">{t('returns.policy.process.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('returns.policy.refund.title')}</h3>
              <p className="text-gray-600">{t('returns.policy.refund.description')}</p>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('returns.process.title')}
          </h2>
          <div className="space-y-6">
            {returnSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('returns.conditions.title')}
            </h3>
            <div className="space-y-3">
              {returnConditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-3">
                  {condition.icon}
                  <span className="text-gray-700">{condition.condition}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('returns.nonReturnable.title')}
            </h3>
            <div className="space-y-3">
              {nonReturnableItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-gray-700">{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warranty Information */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('returns.warranty.title')}
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              {t('returns.warranty.description')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('returns.warranty.coverage.manufacturing')}</li>
              <li>{t('returns.warranty.coverage.materials')}</li>
              <li>{t('returns.warranty.coverage.workmanship')}</li>
            </ul>
            <p className="text-gray-600 mt-4">
              {t('returns.warranty.exclusions')}
            </p>
          </div>
        </div>

        {/* Contact for Returns */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('returns.contact.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('returns.contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Package className="h-5 w-5" />
              {t('returns.contact.button')}
            </a>
            <a
              href="mailto:returns@arianabanden.be"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t('returns.contact.email')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;

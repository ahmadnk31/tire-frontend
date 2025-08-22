import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Clock, MapPin, Package, Shield, Euro } from 'lucide-react';

const Shipping: React.FC = () => {
  const { t } = useTranslation();

  const shippingOptions = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: t('shipping.options.standard.title'),
      description: t('shipping.options.standard.description'),
      time: t('shipping.options.standard.time'),
      price: t('shipping.options.standard.price'),
      features: [
        t('shipping.options.standard.features.tracking'),
        t('shipping.options.standard.features.insurance'),
        t('shipping.options.standard.features.signature'),
      ]
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: t('shipping.options.express.title'),
      description: t('shipping.options.express.description'),
      time: t('shipping.options.express.time'),
      price: t('shipping.options.express.price'),
      features: [
        t('shipping.options.express.features.priority'),
        t('shipping.options.express.features.tracking'),
        t('shipping.options.express.features.insurance'),
      ]
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('shipping.options.pickup.title'),
      description: t('shipping.options.pickup.description'),
      time: t('shipping.options.pickup.time'),
      price: t('shipping.options.pickup.price'),
      features: [
        t('shipping.options.pickup.features.free'),
        t('shipping.options.pickup.features.appointment'),
        t('shipping.options.pickup.features.installation'),
      ]
    },
  ];

  const deliveryZones = [
    {
      zone: t('shipping.zones.belgium.title'),
      description: t('shipping.zones.belgium.description'),
      time: t('shipping.zones.belgium.time'),
      cost: t('shipping.zones.belgium.cost'),
    },
    {
      zone: t('shipping.zones.netherlands.title'),
      description: t('shipping.zones.netherlands.description'),
      time: t('shipping.zones.netherlands.time'),
      cost: t('shipping.zones.netherlands.cost'),
    },
    {
      zone: t('shipping.zones.france.title'),
      description: t('shipping.zones.france.description'),
      time: t('shipping.zones.france.time'),
      cost: t('shipping.zones.france.cost'),
    },
    {
      zone: t('shipping.zones.germany.title'),
      description: t('shipping.zones.germany.description'),
      time: t('shipping.zones.germany.time'),
      cost: t('shipping.zones.germany.cost'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('shipping.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('shipping.description')}
          </p>
        </div>

        {/* Shipping Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('shipping.options.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">{option.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {option.description}
                </p>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary">{option.price}</div>
                  <div className="text-sm text-gray-500">{option.time}</div>
                </div>
                <ul className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('shipping.zones.title')}
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {deliveryZones.map((zone, index) => (
                <div key={index} className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{zone.zone}</h3>
                  <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{zone.time}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Euro className="h-4 w-4" />
                      <span className="text-sm font-medium">{zone.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('shipping.info.processing.title')}
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>{t('shipping.info.processing.description')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('shipping.info.processing.items.cutoff')}</li>
                <li>{t('shipping.info.processing.items.weekends')}</li>
                <li>{t('shipping.info.processing.items.holidays')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('shipping.info.tracking.title')}
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>{t('shipping.info.tracking.description')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('shipping.info.tracking.items.email')}</li>
                <li>{t('shipping.info.tracking.items.realtime')}</li>
                <li>{t('shipping.info.tracking.items.delivery')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Special Items */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t('shipping.special.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('shipping.special.large.title')}
              </h4>
              <p className="text-gray-600 text-sm">
                {t('shipping.special.large.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('shipping.special.installation.title')}
              </h4>
              <p className="text-gray-600 text-sm">
                {t('shipping.special.installation.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Shipping */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('shipping.contact.title')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('shipping.contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Package className="h-5 w-5" />
              {t('shipping.contact.button')}
            </a>
            <a
              href="tel:+32 467 66 21 97"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-5 w-5" />
              +32 467 66 21 97
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

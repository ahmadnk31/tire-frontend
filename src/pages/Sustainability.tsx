import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Recycle, Shield, Target, TrendingUp, Award, Users, Globe } from 'lucide-react';

const Sustainability: React.FC = () => {
  const { t } = useTranslation();

  const initiatives = [
    {
      icon: <Recycle className="h-8 w-8" />,
      title: t('sustainability.initiatives.recycling.title'),
      description: t('sustainability.initiatives.recycling.description'),
      impact: t('sustainability.initiatives.recycling.impact'),
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: t('sustainability.initiatives.green.title'),
      description: t('sustainability.initiatives.green.description'),
      impact: t('sustainability.initiatives.green.impact'),
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('sustainability.initiatives.quality.title'),
      description: t('sustainability.initiatives.quality.description'),
      impact: t('sustainability.initiatives.quality.impact'),
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('sustainability.initiatives.community.title'),
      description: t('sustainability.initiatives.community.description'),
      impact: t('sustainability.initiatives.community.impact'),
    },
  ];

  const goals = [
    {
      year: '2025',
      target: t('sustainability.goals.2025.target'),
      description: t('sustainability.goals.2025.description'),
      progress: 75,
    },
    {
      year: '2027',
      target: t('sustainability.goals.2027.target'),
      description: t('sustainability.goals.2027.description'),
      progress: 45,
    },
    {
      year: '2030',
      target: t('sustainability.goals.2030.target'),
      description: t('sustainability.goals.2030.description'),
      progress: 20,
    },
  ];

  const partnerships = [
    {
      name: t('sustainability.partners.recycling.name'),
      description: t('sustainability.partners.recycling.description'),
      logo: '♻️',
    },
    {
      name: t('sustainability.partners.manufacturers.name'),
      description: t('sustainability.partners.manufacturers.description'),
      logo: '🏭',
    },
    {
      name: t('sustainability.partners.research.name'),
      description: t('sustainability.partners.research.description'),
      logo: '🔬',
    },
  ];

  const stats = [
    {
      value: '95%',
      label: t('sustainability.stats.recycled'),
      icon: <Recycle className="h-6 w-6" />,
    },
    {
      value: '40%',
      label: t('sustainability.stats.emissions'),
      icon: <Leaf className="h-6 w-6" />,
    },
    {
      value: '15+',
      label: t('sustainability.stats.certifications'),
      icon: <Award className="h-6 w-6" />,
    },
    {
      value: '500+',
      label: t('sustainability.stats.partnerships'),
      icon: <Globe className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('sustainability.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('sustainability.description')}
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('sustainability.mission.title')}
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg">
              {t('sustainability.mission.description')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-primary">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Initiatives */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('sustainability.initiatives.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-green-600">{initiative.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {initiative.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {initiative.description}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    {t('sustainability.impact')}
                  </div>
                  <div className="text-sm text-green-700">
                    {initiative.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Progress */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('sustainability.goals.title')}
          </h2>
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold text-primary">{goal.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {goal.target}
                    </h3>
                    <p className="text-gray-600">
                      {goal.description}
                    </p>
                  </div>
                  <div className="lg:w-1/3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('sustainability.progress')}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnerships */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('sustainability.partners.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnerships.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl mb-4">{partner.logo}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {partner.name}
                </h3>
                <p className="text-gray-600">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('sustainability.certifications.title')}
          </h2>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'ISO 14001', description: t('sustainability.certifications.iso14001') },
                { name: 'EU Ecolabel', description: t('sustainability.certifications.ecolabel') },
                { name: 'Carbon Neutral', description: t('sustainability.certifications.carbon') },
                { name: 'Green Business', description: t('sustainability.certifications.green') },
              ].map((cert, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('sustainability.cta.title')}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('sustainability.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Globe className="h-5 w-5" />
                {t('sustainability.cta.contact')}
              </a>
              <a
                href="/blog"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                {t('sustainability.cta.blog')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;

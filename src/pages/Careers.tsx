import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, Heart, Star, ChevronRight, Mail, Phone } from 'lucide-react';

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
}

const Careers: React.FC = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('careers.benefits.health.title'),
      description: t('careers.benefits.health.description'),
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: t('careers.benefits.flexibility.title'),
      description: t('careers.benefits.flexibility.description'),
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: t('careers.benefits.growth.title'),
      description: t('careers.benefits.growth.description'),
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('careers.benefits.team.title'),
      description: t('careers.benefits.team.description'),
    },
  ];

  const jobOpenings: JobOpening[] = [
    {
      id: '1',
      title: t('careers.jobs.mechanic.title'),
      department: t('careers.jobs.mechanic.department'),
      location: 'Menen, Belgium',
      type: t('careers.jobs.mechanic.type'),
      experience: t('careers.jobs.mechanic.experience'),
      description: t('careers.jobs.mechanic.description'),
      requirements: [
        t('careers.jobs.mechanic.requirements.experience'),
        t('careers.jobs.mechanic.requirements.license'),
        t('careers.jobs.mechanic.requirements.physical'),
        t('careers.jobs.mechanic.requirements.teamwork'),
      ]
    },
    {
      id: '2',
      title: t('careers.jobs.sales.title'),
      department: t('careers.jobs.sales.department'),
      location: 'Menen, Belgium',
      type: t('careers.jobs.sales.type'),
      experience: t('careers.jobs.sales.experience'),
      description: t('careers.jobs.sales.description'),
      requirements: [
        t('careers.jobs.sales.requirements.communication'),
        t('careers.jobs.sales.requirements.languages'),
        t('careers.jobs.sales.requirements.customer'),
        t('careers.jobs.sales.requirements.knowledge'),
      ]
    },
  ];

  const values = [
    {
      title: t('careers.values.excellence.title'),
      description: t('careers.values.excellence.description'),
    },
    {
      title: t('careers.values.integrity.title'),
      description: t('careers.values.integrity.description'),
    },
    {
      title: t('careers.values.innovation.title'),
      description: t('careers.values.innovation.description'),
    },
    {
      title: t('careers.values.community.title'),
      description: t('careers.values.community.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('careers.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('careers.description')}
          </p>
        </div>

        {/* Company Culture */}
        <div className="mb-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('careers.culture.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('careers.benefits.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="text-primary">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Openings */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('careers.openings.title')}
          </h2>
          {jobOpenings.length > 0 ? (
            <div className="space-y-6">
              {jobOpenings.map(job => (
                <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        {job.experience}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {job.description}
                  </p>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t('careers.requirements')}:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    {t('careers.apply')}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('careers.noOpenings.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('careers.noOpenings.description')}
              </p>
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                {t('careers.noOpenings.notify')}
              </button>
            </div>
          )}
        </div>

        {/* Application Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('careers.process.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`careers.process.step${step}.title`)}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(`careers.process.step${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('careers.contact.title')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('careers.contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:careers@arianabanden.be"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-5 w-5" />
              careers@arianabanden.be
            </a>
            <a
              href="tel:+32 56 51 28 29"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone className="h-5 w-5" />
              +32 56 51 28 29
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;

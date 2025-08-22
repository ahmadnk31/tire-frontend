import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar, ExternalLink, Mail, Phone, Image as ImageIcon, FileText } from 'lucide-react';

interface PressRelease {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  downloadUrl?: string;
}

interface MediaKit {
  type: string;
  name: string;
  description: string;
  downloadUrl: string;
  size: string;
}

const Press: React.FC = () => {
  const { t } = useTranslation();

  const pressReleases: PressRelease[] = [
    {
      id: '1',
      title: t('press.releases.expansion.title'),
      date: '2024-11-01',
      summary: t('press.releases.expansion.summary'),
      content: t('press.releases.expansion.content'),
      downloadUrl: '/press/ariana-banden-expansion-2024.pdf'
    },
    {
      id: '2',
      title: t('press.releases.sustainability.title'),
      date: '2024-10-15',
      summary: t('press.releases.sustainability.summary'),
      content: t('press.releases.sustainability.content'),
      downloadUrl: '/press/ariana-banden-sustainability-2024.pdf'
    },
    {
      id: '3',
      title: t('press.releases.partnership.title'),
      date: '2024-09-20',
      summary: t('press.releases.partnership.summary'),
      content: t('press.releases.partnership.content'),
      downloadUrl: '/press/ariana-banden-partnership-2024.pdf'
    }
  ];

  const mediaKit: MediaKit[] = [
    {
      type: 'logo',
      name: t('press.mediaKit.logo.name'),
      description: t('press.mediaKit.logo.description'),
      downloadUrl: '/press/ariana-banden-logo-kit.zip',
      size: '2.3 MB'
    },
    {
      type: 'photos',
      name: t('press.mediaKit.photos.name'),
      description: t('press.mediaKit.photos.description'),
      downloadUrl: '/press/ariana-banden-photos.zip',
      size: '15.7 MB'
    },
    {
      type: 'factsheet',
      name: t('press.mediaKit.factsheet.name'),
      description: t('press.mediaKit.factsheet.description'),
      downloadUrl: '/press/ariana-banden-factsheet.pdf',
      size: '450 KB'
    }
  ];

  const awards = [
    {
      year: '2024',
      title: t('press.awards.excellence.title'),
      organization: t('press.awards.excellence.organization'),
      description: t('press.awards.excellence.description')
    },
    {
      year: '2023',
      title: t('press.awards.service.title'),
      organization: t('press.awards.service.organization'),
      description: t('press.awards.service.description')
    },
    {
      year: '2022',
      title: t('press.awards.safety.title'),
      organization: t('press.awards.safety.organization'),
      description: t('press.awards.safety.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('press.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('press.description')}
          </p>
        </div>

        {/* Media Contact */}
        <div className="bg-white rounded-xl p-8 mb-12 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('press.contact.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('press.contact.media')}</h3>
              <p className="text-gray-600 mb-3">{t('press.contact.mediaDescription')}</p>
              <a
                href="mailto:press@arianabanden.be"
                className="text-primary hover:text-primary/80 font-medium"
              >
                press@arianabanden.be
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('press.contact.phone')}</h3>
              <p className="text-gray-600 mb-3">{t('press.contact.phoneDescription')}</p>
              <a
                href="tel:+32 56 51 28 29"
                className="text-primary hover:text-primary/80 font-medium"
              >
                +32 56 51 28 29
              </a>
            </div>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('press.releases.title')}
          </h2>
          <div className="space-y-6">
            {pressReleases.map(release => (
              <div key={release.id} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {release.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(release.date).toLocaleDateString()}
                    </div>
                  </div>
                  {release.downloadUrl && (
                    <a
                      href={release.downloadUrl}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mt-4 lg:mt-0"
                    >
                      <Download className="h-4 w-4" />
                      {t('press.releases.download')}
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  {release.summary}
                </p>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    {release.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('press.mediaKit.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mediaKit.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {item.type === 'logo' && <ImageIcon className="h-6 w-6 text-primary" />}
                  {item.type === 'photos' && <ImageIcon className="h-6 w-6 text-primary" />}
                  {item.type === 'factsheet' && <FileText className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.size}</span>
                  <a
                    href={item.downloadUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {t('press.mediaKit.download')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('press.awards.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((award, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-lg font-bold text-primary mb-2">{award.year}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {award.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {award.organization}
                </p>
                <p className="text-gray-600">
                  {award.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Facts */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('press.facts.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-gray-600">{t('press.facts.experience')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5000+</div>
              <div className="text-gray-600">{t('press.facts.customers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">{t('press.facts.brands')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">{t('press.facts.support')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Press;

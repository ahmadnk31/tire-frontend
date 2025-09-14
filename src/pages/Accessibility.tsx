import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Ear, Hand, Brain, Keyboard, Monitor, Volume2, Type, Calendar, Mail, Phone } from 'lucide-react';

const Accessibility: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Keyboard className="h-8 w-8" />,
      title: t('accessibility.features.keyboard.title'),
      description: t('accessibility.features.keyboard.description'),
      details: [
        t('accessibility.features.keyboard.details.tab'),
        t('accessibility.features.keyboard.details.enter'),
        t('accessibility.features.keyboard.details.escape'),
        t('accessibility.features.keyboard.details.arrows'),
      ]
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: t('accessibility.features.visual.title'),
      description: t('accessibility.features.visual.description'),
      details: [
        t('accessibility.features.visual.details.contrast'),
        t('accessibility.features.visual.details.resize'),
        t('accessibility.features.visual.details.screen'),
        t('accessibility.features.visual.details.alt'),
      ]
    },
    {
      icon: <Ear className="h-8 w-8" />,
      title: t('accessibility.features.audio.title'),
      description: t('accessibility.features.audio.description'),
      details: [
        t('accessibility.features.audio.details.captions'),
        t('accessibility.features.audio.details.transcripts'),
        t('accessibility.features.audio.details.visual'),
        t('accessibility.features.audio.details.controls'),
      ]
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('accessibility.features.cognitive.title'),
      description: t('accessibility.features.cognitive.description'),
      details: [
        t('accessibility.features.cognitive.details.clear'),
        t('accessibility.features.cognitive.details.consistent'),
        t('accessibility.features.cognitive.details.simple'),
        t('accessibility.features.cognitive.details.help'),
      ]
    },
  ];

  const guidelines = [
    {
      level: 'AA',
      title: t('accessibility.wcag.aa.title'),
      description: t('accessibility.wcag.aa.description'),
      status: t('accessibility.wcag.aa.status'),
      color: 'bg-green-100 text-green-800',
    },
    {
      level: 'AAA',
      title: t('accessibility.wcag.aaa.title'),
      description: t('accessibility.wcag.aaa.description'),
      status: t('accessibility.wcag.aaa.status'),
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  const assistiveTech = [
    {
      name: t('accessibility.assistive.screenReaders.name'),
      description: t('accessibility.assistive.screenReaders.description'),
      supported: ['JAWS', 'NVDA', 'VoiceOver', 'TalkBack'],
    },
    {
      name: t('accessibility.assistive.voice.name'),
      description: t('accessibility.assistive.voice.description'),
      supported: ['Dragon NaturallySpeaking', 'Windows Speech Recognition', 'Voice Control'],
    },
    {
      name: t('accessibility.assistive.switch.name'),
      description: t('accessibility.assistive.switch.description'),
      supported: ['Switch Access', 'Head Mouse', 'Eye Tracking'],
    },
    {
      name: t('accessibility.assistive.magnification.name'),
      description: t('accessibility.assistive.magnification.description'),
      supported: ['ZoomText', 'Windows Magnifier', 'macOS Zoom'],
    },
  ];

  const shortcuts = [
    { key: 'Tab', description: t('accessibility.shortcuts.tab') },
    { key: 'Shift + Tab', description: t('accessibility.shortcuts.shiftTab') },
    { key: 'Enter', description: t('accessibility.shortcuts.enter') },
    { key: 'Space', description: t('accessibility.shortcuts.space') },
    { key: 'Escape', description: t('accessibility.shortcuts.escape') },
    { key: 'Arrow Keys', description: t('accessibility.shortcuts.arrows') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('accessibility.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t('accessibility.description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {t('accessibility.lastUpdated')}: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Commitment Statement */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('accessibility.commitment.title')}
          </h2>
          <p className="text-gray-700 text-center max-w-3xl mx-auto">
            {t('accessibility.commitment.description')}
          </p>
        </div>

        {/* WCAG Compliance */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accessibility.wcag.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    WCAG 2.1 Level {guideline.level}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${guideline.color}`}>
                    {guideline.status}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {guideline.title}
                </h4>
                <p className="text-gray-600">
                  {guideline.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accessibility.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accessibility.shortcuts.title')}
          </h2>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <kbd className="px-3 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                  <div className="text-gray-700 text-sm">
                    {shortcut.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assistive Technology */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accessibility.assistive.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assistiveTech.map((tech, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {tech.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {tech.description}
                </p>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t('accessibility.assistive.supported')}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tech.supported.map((item, itemIndex) => (
                      <span key={itemIndex} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Known Issues */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accessibility.issues.title')}
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              {t('accessibility.issues.description')}
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                {t('accessibility.issues.item1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                {t('accessibility.issues.item2')}
              </li>
            </ul>
          </div>
        </div>

        {/* Feedback and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('accessibility.feedback.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('accessibility.feedback.description')}
            </p>
            <a
              href="mailto:accessibility@arianabanden.be"
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              <Mail className="h-4 w-4" />
              accessibility@arianabanden.be
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('accessibility.support.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('accessibility.support.description')}
            </p>
            <div className="space-y-2">
              <a
                href="tel:+32 467 66 21 97"
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Phone className="h-4 w-4" />
                +32 467 66 21 97
              </a>
              <a
                href="mailto:support@arianabanden.be"
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Mail className="h-4 w-4" />
                support@arianabanden.be
              </a>
            </div>
          </div>
        </div>

        {/* Alternative Formats */}
        <div className="mt-8 bg-primary/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('accessibility.formats.title')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('accessibility.formats.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:accessibility@arianabanden.be?subject=Alternative Format Request"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Type className="h-5 w-5" />
              {t('accessibility.formats.request')}
            </a>
            <a
              href="/accessibility.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Monitor className="h-5 w-5" />
              {t('accessibility.formats.pdf')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;

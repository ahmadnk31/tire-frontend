import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './auth-layout-animations.css';

const testimonials = [
  {
    name: 'Patrick De Vlieger',
    text: 'Zeer vriendelijke en professionele service. Snelle afhandeling en goede prijzen. Aanrader!',
    avatar: '/public/avatar1.png',
    rating: 5,
  },
  {
    name: 'Johan Van De Velde',
    text: 'Uitstekende service en advies. Ze weten waar ze over praten en zijn eerlijk over wat je nodig hebt.',
    avatar: '/public/avatar2.png',
    rating: 5,
  },
  {
    name: 'Marie-Claire Dubois',
    text: 'Zeer tevreden over de service. Snelle levering en goede kwaliteit banden. Komt zeker terug!',
    avatar: '/public/avatar3.png',
    rating: 5,
  },
  {
    name: 'Tom Janssens',
    text: 'Professioneel team, goede prijzen en snelle service. Echt een aanrader voor al je banden behoeften.',
    avatar: '/public/avatar4.png',
    rating: 5,
  },
  {
    name: 'Sofie Maertens',
    text: 'Vriendelijke bediening en goede advies. Ze nemen de tijd om je te helpen met de juiste keuze.',
    avatar: '/public/avatar5.png',
    rating: 5,
  },
  {
    name: 'Luc Peeters',
    text: 'Uitstekende ervaring van begin tot eind. Kwaliteitsbanden tegen goede prijzen. Zeer aanbevolen!',
    avatar: '/public/avatar6.png',
    rating: 5,
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [testimonialIdx, setTestimonialIdx] = useState(0);


  const testimonialRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTestimonialIdx(idx => (idx + 1) % testimonials.length);
    }, 3500);
    return () => clearTimeout(timer);
  }, [testimonialIdx]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary/10 to-accent/10">
      {/* Testimonials Section */}
      <div className="hidden md:flex flex-col justify-center items-center w-full md:w-1/2 bg-white/80 px-8 py-16 border-r border-primary/20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">{t('auth.testimonials.title')}</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>
            <span className="text-sm text-gray-600">{t('auth.testimonials.rating')}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-sm text-gray-600">{t('auth.testimonials.googleReviews')}</span>
          </div>
        </div>
        <SwitchTransition mode="out-in">
          <CSSTransition key={testimonialIdx} classNames="slide-fade" timeout={500} nodeRef={testimonialRef}>
            <div ref={testimonialRef} className="w-full max-w-md">
              <div className="flex items-start gap-4 bg-white rounded-xl shadow-lg p-6 border border-primary/10">
                <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="w-14 h-14 rounded-full object-cover border border-primary/30 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-base mb-3 leading-relaxed">{testimonials[testimonialIdx].text}</p>
                  <span className="text-sm font-semibold text-primary">{testimonials[testimonialIdx].name}</span>
                </div>
              </div>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
      {/* Auth Form Section */}
      <SwitchTransition mode="out-in">
        <CSSTransition key={location.pathname} classNames="fade" timeout={400} nodeRef={formRef}>
          <div ref={formRef} className="flex flex-col justify-center items-center w-full md:w-1/2 py-16 px-4">
            {children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

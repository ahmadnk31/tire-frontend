import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import './auth-layout-animations.css';

const testimonials = [
  {
    name: 'Sarah A.',
    text: 'Tyre Vision made buying tyres so easy. Fast delivery and great prices! Highly recommended.',
    avatar: '/public/avatar1.png',
  },
  {
    name: 'Mike T.',
    text: 'Customer service was top notch. I found exactly what I needed for my car.',
    avatar: '/public/avatar2.png',
  },
  {
    name: 'Priya S.',
    text: 'The website is super user-friendly and the selection is amazing.',
    avatar: '/public/avatar3.png',
  },
    {
        name: 'John D.',
        text: 'I love the variety of brands available. Tyre Vision is my go-to for all my tyre needs.',
        avatar: '/public/avatar4.png',
    },
    {
        name: 'Emily R.',
        text: 'Great experience from start to finish. Will definitely shop here again!',
        avatar: '/public/avatar5.png',
    },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
        <h2 className="text-2xl font-bold text-primary mb-8">What our users say</h2>
        <SwitchTransition mode="out-in">
          <CSSTransition key={testimonialIdx} classNames="slide-fade" timeout={500} nodeRef={testimonialRef}>
            <div ref={testimonialRef} className="w-full max-w-md">
              <div className="flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-primary/10">
                <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="w-12 h-12 rounded-full object-cover border border-primary/30" />
                <div>
                  <p className="text-gray-700 text-base mb-2">{testimonials[testimonialIdx].text}</p>
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

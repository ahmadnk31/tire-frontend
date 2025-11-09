import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, User, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { submitContactForm, ContactFormData } from "../lib/api/contact";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Branch information
  const branches = [
    {
      id: 1,
      name: "Ariana Banden Service - Ledegem",
      street: "Provinciebaan 192A",
      city: "8880 Ledegem",
      country: "Belgium",
      phone: "+32 467 66 21 97",
      email: "info@ariana-bandencentraal.com",
      whatsapp: "+32 467 66 21 97",
      mapsLink: "https://maps.app.goo.gl/qF2wt1aMPQ2QiV9t7",
      isMain: true
    },
    {
      id: 2,
      name: "Ariana Banden Service - Ghent",
      street: "Dendermondsesteenweg 128",
      city: "9040 Gent",
      country: "Belgium",
      phone: "+32 467 66 21 97",
      email: "info@ariana-bandencentraal.com",
      whatsapp: "+32 467 66 21 97",
      mapsLink: "https://maps.app.goo.gl/yDF8wa7QvBtVtjB26",
      isMain: false
    },
    {
      id: 3,
      name: "Ariana Banden Service - England",
      street: "78 Newlands, Hull",
      city: "HU3 6RJ",
      country: "England",
      phone: "+44 668 335 50 19",
      email: "info@ariana-bandencentraal.com",
      whatsapp: "+44 668 335 50 19",
      mapsLink: "https://maps.app.goo.gl/9PJsj6oNCZM8TbaDA",
      isMain: false
    }
  ];

  // Main contact info (using the main branch)
  const contactInfo = branches.find(branch => branch.isMain) || branches[0];

  // Handle URL parameters for order tracking
  useEffect(() => {
    const subject = searchParams.get('subject');
    const inquiryType = searchParams.get('inquiryType');
    
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subject: subject
      }));
    }
    
    if (inquiryType) {
      setFormData(prev => ({
        ...prev,
        inquiryType: inquiryType
      }));
    }

    // If it's an order tracking inquiry, pre-fill the message
    if (subject === 'order-tracking') {
      setFormData(prev => ({
        ...prev,
        message: `I would like to track my recent order. Please provide me with the current status and any tracking information available.`
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      await submitContactForm(formData as ContactFormData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general"
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contact.form.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLang = i18n.language;
  const pageTitle = searchParams.get('subject') === 'order-tracking' 
    ? 'Track Your Order | Ariana Bandencentraal'
    : 'Contact Ons - Banden Expert België | Ariana Bandencentraal';
  const pageDescription = searchParams.get('subject') === 'order-tracking'
    ? 'Track your tire order status. Get real-time updates on your delivery and installation schedule.'
    : 'Neem contact op met Ariana Bandencentraal. 3 vestigingen in België en Engeland. Expert advies over banden, montage service, prijsoffertes. Telefonisch, email of WhatsApp bereikbaar.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="contact, banden advies, bandenwinkel locatie, openingstijden, telefoonnummer, email, WhatsApp, vestigingen België, Ledegem, Gent, bandenservice contact" />
        
        <link rel="canonical" href="https://arianabandencentralebv.be/contact" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content="https://arianabandencentralebv.be/contact" />
        <meta property="og:locale" content={currentLang === 'nl' ? 'nl_BE' : 'en_US'} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact - Ariana Bandencentraal",
            "description": "Contact informatie voor Ariana Bandencentraal vestigingen",
            "url": "https://arianabandencentralebv.be/contact",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "Ariana Bandencentraal",
              "image": "https://arianabandencentralebv.be/logo.png",
              "telephone": "+32 467 66 21 97",
              "email": "info@arianabandencentralebv.be",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Provinciebaan 192A",
                "addressLocality": "Ledegem",
                "postalCode": "8880",
                "addressCountry": "BE"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "09:00",
                  "closes": "18:00"
                }
              ],
              "priceRange": "€€",
              "areaServed": "Belgium"
            }
          })}
        </script>
        
        {/* Multi-lingual / Alternate language versions */}
        <link rel="alternate" hrefLang="nl" href="https://arianabandencentralebv.be/nl/contact" />
        <link rel="alternate" hrefLang="en" href="https://arianabandencentralebv.be/en/contact" />
        <link rel="alternate" hrefLang="x-default" href="https://arianabandencentralebv.be/contact" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {searchParams.get('subject') === 'order-tracking' 
              ? t('contact.orderTracking.title') 
              : t('contact.title')
            }
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {searchParams.get('subject') === 'order-tracking'
              ? t('contact.orderTracking.description')
              : t('contact.description')
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Store Locations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">{t('contact.location.title')}</h2>
              </div>
              
              <div className="space-y-6">
                {branches.map((branch, index) => (
                  <div key={branch.id} className={`p-4 rounded-lg border ${branch.isMain ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {branch.name}
                          {branch.isMain && (
                            <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                              {t('contact.location.mainBranch')}
                            </span>
                          )}
                        </h3>
                        <div className="space-y-1 text-gray-600 text-sm">
                          <p>{branch.street}</p>
                          <p>{branch.city}</p>
                          <p>{branch.country}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => window.open(`tel:${branch.phone}`, '_self')}
                        className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {branch.phone}
                      </button>
                      
                      {branch.mapsLink !== '#' && (
                        <button 
                          onClick={() => window.open(branch.mapsLink, '_blank')}
                          className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 hover:underline"
                        >
                          <MapPin className="w-4 h-4" />
                          {t('contact.location.directions')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('contact.details.title')}</h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
                  className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.phone')}</p>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    const subject = encodeURIComponent('Contact Inquiry - Ariana Bandencentraal');
                    const body = encodeURIComponent('Hello,\n\nI would like to inquire about your services.\n\nBest regards,');
                    window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_self');
                  }}
                  className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.email')}</p>
                    <p className="text-gray-600">{contactInfo.email}</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    const cleanNumber = contactInfo.whatsapp.replace(/[\s\-\(\)]/g, '');
                    const message = encodeURIComponent('Hello! I would like to inquire about your tire services.');
                    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
                  }}
                  className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.whatsapp')}</p>
                    <p className="text-gray-600">{contactInfo.whatsapp}</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {t('contact.location.helpText')}
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">{t('contact.hours.title')}</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.weekdays')}</span>
                  <span className="font-medium text-gray-900">{t('contact.hours.weekdayTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.saturday')}</span>
                  <span className="font-medium text-gray-900">{t('contact.hours.saturdayTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.sunday')}</span>
                  <span className="font-medium text-gray-900">{t('contact.hours.closed')}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">{t('contact.hours.emergency')}:</span> {t('contact.hours.emergencyDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Send className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">{t('contact.form.title')}</h2>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('contact.form.success')}</h3>
                  <p className="text-gray-600">
                    {t('contact.form.successMessage')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.inquiryType')}
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="general">{t('contact.form.options.general')}</option>
                      <option value="quote">{t('contact.form.options.quote')}</option>
                      <option value="appointment">{t('contact.form.options.appointment')}</option>
                      <option value="warranty">{t('contact.form.options.warranty')}</option>
                      <option value="complaint">{t('contact.form.options.complaint')}</option>
                      <option value="support">{t('contact.form.options.support')}</option>
                    </select>
                  </div>

                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
{t('contact.form.fullName')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.fullName')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        {t('contact.form.emailAddress')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.email')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone and Subject Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        {t('contact.form.phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.phone')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {t('contact.form.subject')} *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.subject')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-1" />
                      {t('contact.form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                                              placeholder={t('contact.form.placeholders.message')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                      {t('contact.form.required')}
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('contact.form.sendMessage')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
            className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          >
            <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.call')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.callDesc')}</p>
          </button>

          <button 
            onClick={() => {
              const cleanNumber = contactInfo.whatsapp.replace(/[\s\-\(\)]/g, '');
              const message = encodeURIComponent('Hello! I would like to inquire about your tire services.');
              window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
            }}
            className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          >
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.whatsapp')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.whatsappDesc')}</p>
          </button>

          <button 
            onClick={() => {
              const subject = encodeURIComponent('Contact Inquiry - Ariana Bandencentraal');
              const body = encodeURIComponent('Hello,\n\nI would like to inquire about your services.\n\nBest regards,');
              window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_self');
            }}
            className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          >
            <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.email')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.emailDesc')}</p>
          </button>

          <button 
            onClick={() => window.open(contactInfo.mapsLink, '_blank')}
            className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          >
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.visit')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.visitDesc')}</p>
          </button>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">{t('contact.emergency.title')}</h2>
          <p className="text-red-800 mb-4">
            {t('contact.emergency.description')}
          </p>
          <button 
            onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            {t('contact.emergency.callButton')}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, User, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { submitContactForm, ContactFormData } from "../lib/api/contact";

const Contact = () => {
  const { t } = useTranslation();
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Store Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">{t('contact.location.title')}</h2>
              </div>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium">{t('contact.location.businessName')}</p>
                <p>{t('contact.location.street')}</p>
                <p>{t('contact.location.cityPostal')}</p>
                <p>{t('contact.location.country')}</p>
              </div>
              <div className="mt-4">
                <a 
                  href="https://www.google.com/maps/place/Ariana+banden+service/@50.8789553,3.1101877,17.51z/data=!4m8!3m7!1s0x47c33587cb851f77:0xcdd1d0f8da2f0893!8m2!3d50.8786294!4d3.1125472!9m1!1b1!16s%2Fg%2F11l7b6g4hg?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  {t('contact.location.directions')} →
                </a>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('contact.details.title')}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.phone')}</p>
                    <p className="text-gray-600">{t('contact.details.phoneNumber')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.email')}</p>
                    <p className="text-gray-600">{t('contact.details.emailAddress')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.details.whatsapp')}</p>
                    <p className="text-gray-600">{t('contact.details.whatsappNumber')}</p>
                  </div>
                </div>
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
          <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.call')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.callDesc')}</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.whatsapp')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.whatsappDesc')}</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.email')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.emailDesc')}</p>
          </div>

          <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{t('contact.quickContact.visit')}</h3>
            <p className="text-sm text-gray-600">{t('contact.quickContact.visitDesc')}</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">{t('contact.emergency.title')}</h2>
          <p className="text-red-800 mb-4">
            {t('contact.emergency.description')}
          </p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            {t('contact.emergency.callButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;

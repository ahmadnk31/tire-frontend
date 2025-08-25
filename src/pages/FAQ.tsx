import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Phone } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: t('faq.categories.all') },
    { id: 'orders', name: t('faq.categories.orders') },
    { id: 'shipping', name: t('faq.categories.shipping') },
    { id: 'returns', name: t('faq.categories.returns') },
    { id: 'products', name: t('faq.categories.products') },
    { id: 'payment', name: t('faq.categories.payment') },
    { id: 'technical', name: t('faq.categories.technical') },
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: t('faq.items.deliveryTime.question'),
      answer: t('faq.items.deliveryTime.answer'),
      category: 'shipping'
    },
    {
      id: '2',
      question: t('faq.items.returnPolicy.question'),
      answer: t('faq.items.returnPolicy.answer'),
      category: 'returns'
    },
    {
      id: '3',
      question: t('faq.items.paymentMethods.question'),
      answer: t('faq.items.paymentMethods.answer'),
      category: 'payment'
    },
    {
      id: '4',
      question: t('faq.items.installation.question'),
      answer: t('faq.items.installation.answer'),
      category: 'technical'
    },
    {
      id: '5',
      question: t('faq.items.warranty.question'),
      answer: t('faq.items.warranty.answer'),
      category: 'products'
    },
    {
      id: '6',
      question: t('faq.items.orderTracking.question'),
      answer: t('faq.items.orderTracking.answer'),
      category: 'orders'
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('faq.description')}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('faq.noResults')}
              </h3>
              <p className="text-gray-600">
                {t('faq.noResultsDesc')}
              </p>
            </div>
          ) : (
            filteredFAQs.map(item => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 pb-4">
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t('faq.stillNeedHelp')}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {t('faq.contactDescription')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/contact"
              className="flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium text-gray-900">{t('faq.contactUs')}</div>
                <div className="text-sm text-gray-600">{t('faq.contactDesc')}</div>
              </div>
            </a>
            <a
              href="tel:+32 467 66 21 97"
              className="flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium text-gray-900">{t('faq.callUs')}</div>
                <div className="text-sm text-gray-600">+32 56 51 28 29</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

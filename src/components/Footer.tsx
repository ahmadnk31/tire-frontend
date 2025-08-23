import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { subscribeToNewsletter } from '../lib/api/contact';
import BrandsMarquee from "./BrandsMarquee";
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Truck, 
  RotateCcw, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Video, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CreditCard,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const footerLinks = {
    shop: [
      { href: "/products", label: t('footer.shop.allProducts') },
      { href: "/categories", label: t('footer.shop.categories') },
      { href: "/brands", label: t('footer.shop.brands') },
      { href: "/new-arrivals", label: t('footer.shop.newArrivals') },
      { href: "/sale", label: t('footer.shop.saleItems') },
    ],
    support: [
      { href: "/contact", label: t('footer.support.contactUs') },
      { href: "/faq", label: t('footer.support.faq') },
      { href: "/returns", label: t('footer.support.returnsWarranty') },
      { href: "/shipping", label: t('footer.support.shippingInfo') },
      { href: "/size-guide", label: t('footer.support.tyreSizeGuide') },
    ],
    company: [
      { href: "/about", label: t('footer.company.aboutUs') },
      { href: "/blog", label: t('footer.company.blog') },
      { href: "/careers", label: t('footer.company.careers') },
      { href: "/press", label: t('footer.company.press') },
      { href: "/sustainability", label: t('footer.company.sustainability') },
    ],
    legal: [
      { href: "/privacy", label: t('footer.legal.privacyPolicy') },
      { href: "/terms", label: t('footer.legal.termsOfService') },
      { href: "/cookies", label: t('footer.legal.cookiePolicy') },
      { href: "/accessibility", label: t('footer.legal.accessibility') },
    ],
  };

const socialLinks = [
  { href: "https://facebook.com/share/1FTeGU4ujx", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com/bandenledegem", label: "Instagram", icon: Instagram },
  { href: "https://tiktok.com/@arianabanden", label: "TikTok", icon: Video },
];

  const trustBadges = [
    { icon: Shield, text: t('footer.trustBadges.sslSecured') },
    { icon: Truck, text: t('footer.trustBadges.freeShipping') },
    { icon: RotateCcw, text: t('footer.trustBadges.easyReturns') },
    { icon: MessageCircle, text: t('footer.trustBadges.support247') },
  ];

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t('footer.newsletter.emailRequired'),
        description: t('footer.newsletter.emailRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubscribing(true);
      await subscribeToNewsletter({ 
        email: email.trim(),
        source: 'footer'
      });
      
      toast({
        title: t('footer.newsletter.subscribedSuccess'),
        description: t('footer.newsletter.subscribedDesc'),
      });
      
      setEmail(''); // Clear the input
    } catch (error) {
      toast({
        title: t('footer.newsletter.subscriptionFailed'),
        description: error instanceof Error ? error.message : "Failed to subscribe to newsletter",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border">
      {/* Trust Badges Section */}
      <BrandsMarquee />
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="flex items-center justify-center space-x-3 text-center group">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="font-bold text-3xl mb-4 text-primary">
                Ariana Banden
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                {t('footer.description')}
              </p>
              
              {/* Newsletter Signup */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-foreground">{t('footer.newsletter.stayUpdated')}</h3>
                <form onSubmit={handleNewsletterSubscribe} className="flex max-w-md">
                  <Input
                    type="email"
                    placeholder={t('footer.newsletter.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-r-none focus:ring-primary focus:border-primary"
                    disabled={isSubscribing}
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubscribing}
                    className="rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
                  >
                    {isSubscribing ? t('footer.newsletter.subscribing') : t('footer.newsletter.subscribe')}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('footer.newsletter.description')}
                </p>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">{t('footer.social.followUs')}</h3>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-12 h-12 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md"
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">{t('footer.shop.title')}</h3>
            <nav aria-label="Shop Links">
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:cursor-pointer hover:underline text-sm transition-colors inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">{t('footer.support.title')}</h3>
            <nav aria-label="Support Links">
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:cursor-pointer hover:underline text-sm inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">{t('footer.company.title')}</h3>
            <nav aria-label="Company Links">
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:underline hover:cursor-pointer text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">{t('footer.legal.title')}</h3>
            <nav aria-label="Legal Links">
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground  text-sm hover:underline hover:cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </span>
                {t('footer.contact.contactInfo')}
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground ml-8">
                <p className="flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@arianatires.com" className="hover:underline">info@arianatires.com</a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+1234567890" className="hover:underline">+32 467 66 21 97</a>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Provinciebaan 192A, Ledegem
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </span>
                {t('footer.contact.businessHours')}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground ml-8">
                <div className="flex justify-between">
                  <span>{t('footer.contact.mondayFriday')}</span>
                  <span className="font-medium">{t('footer.contact.hours')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('footer.contact.saturday')}</span>
                  <span className="font-medium">{t('footer.contact.hours')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('footer.contact.sunday')}</span>
                  <span className="font-medium">
                    {t('footer.contact.withAppointmentOnly')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </span>
                {t('footer.contact.paymentMethods')}
              </h3>
              <div className="flex flex-wrap gap-3 ml-8">
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Visa
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Mastercard
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> PayPal
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Apple Pay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Ariana Banden. {t('footer.bottom.allRightsReserved')}</p>
              <div className="hidden md:block w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
              <p className="flex items-center gap-1">
                {t('footer.bottom.builtWithLove')} <Heart className="w-4 h-4 text-red-500 animate-pulse fill-current" /> {t('footer.bottom.forAutomotiveEnthusiasts')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a 
                href="/sitemap" 
                className="text-muted-foreground hover:text-accent transition-colors duration-300 hover:underline"
              >
                {t('footer.bottom.sitemap')}
              </a>
              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
              <a 
                href="/accessibility" 
                className="text-muted-foreground hover:text-accent transition-colors duration-300 hover:underline"
              >
                {t('footer.legal.accessibility')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import BrandsMarquee from "./BrandsMarquee";

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/categories", label: "Categories" },
    { href: "/brands", label: "Brands" },
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/sale", label: "Sale Items" },
  ],
  support: [
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/returns", label: "Returns & Warranty" },
    { href: "/shipping", label: "Shipping Info" },
    { href: "/size-guide", label: "Tyre Size Guide" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press" },
    { href: "/sustainability", label: "Sustainability" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/accessibility", label: "Accessibility" },
  ],
};

const socialLinks = [
  { href: "https://facebook.com/tyrevision", label: "Facebook", icon: "📘" },
  { href: "https://twitter.com/tyrevision", label: "Twitter", icon: "🐦" },
  { href: "https://instagram.com/tyrevision", label: "Instagram", icon: "📷" },
  { href: "https://youtube.com/tyrevision", label: "YouTube", icon: "📺" },
  { href: "https://linkedin.com/company/tyrevision", label: "LinkedIn", icon: "💼" },
];

const trustBadges = [
  { icon: "🔒", text: "SSL Secured" },
  { icon: "🚚", text: "Free Shipping" },
  { icon: "↩️", text: "Easy Returns" },
  { icon: "💬", text: "24/7 Support" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border">
      {/* Trust Badges Section */}
      <BrandsMarquee />
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 text-center group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <span className="text-xl text-primary group-hover:text-accent transition-colors duration-300" role="img" aria-hidden="true">{badge.icon}</span>
                </div>
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">{badge.text}</span>
              </div>
            ))}
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
                Ariana Tires
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Your trusted partner for premium tyres, wheels, and automotive accessories. 
                We deliver quality, expertise, and exceptional service to keep you moving safely.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Stay Updated</h3>
                <div className="flex max-w-md">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-r-none focus:ring-primary focus:border-primary"
                  />
                  <Button className="rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Get exclusive deals and updates. Unsubscribe anytime.
                </p>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">Follow Us</h3>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-12 h-12 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md"
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="text-lg" role="img" aria-hidden="true">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">Shop</h3>
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
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">Support</h3>
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
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">Company</h3>
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
            <h3 className="font-semibold text-lg text-primary border-b border-primary/20 pb-2">Legal</h3>
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
                  📞
                </span>
                Contact Info
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground ml-8">
                <p className="flex items-center gap-2  transition-colors">
                  <span>✉️</span>
                  <a href="mailto:info@arianatires.com" className="hover:underline">info@arianatires.com</a>
                </p>
                <p className="flex items-center gap-2 ">
                  <span>📱</span>
                  <a href="tel:+1234567890" className="hover:underline">+1 (234) 567-8900</a>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>123 Tyre Street, Auto City, AC 12345</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  🕒
                </span>
                Business Hours
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground ml-8">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium">10:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  💳
                </span>
                Payment Methods
              </h3>
              <div className="flex flex-wrap gap-3 ml-8">
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <span>💳</span> Visa
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <span>💳</span> Mastercard
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <span>🅿️</span> PayPal
                </div>
                <div className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:shadow-md transition-shadow duration-300 flex items-center gap-1">
                  <span>🍎</span> Apple Pay
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
              <p>© {currentYear} Ariana Tires. All rights reserved.</p>
              <div className="hidden md:block w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
              <p className="flex items-center gap-1">
                Built with <span className="text-red-500 animate-pulse">❤️</span> for automotive enthusiasts
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a 
                href="/sitemap" 
                className="text-muted-foreground hover:text-accent transition-colors duration-300 hover:underline"
              >
                Sitemap
              </a>
              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
              <a 
                href="/accessibility" 
                className="text-muted-foreground hover:text-accent transition-colors duration-300 hover:underline"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
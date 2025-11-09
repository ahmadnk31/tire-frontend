import React from "react";
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Users, Truck, Globe, Shield, Award, Heart } from "lucide-react";

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  return (
    <>
      <Helmet>
        <title>Over Ons - Familie Bedrijf | Ariana Bandencentraal België</title>
        <meta name="description" content="Leer het verhaal kennen van Ariana Bandencentraal. Familie-bedrijf gerund door twee broers met passie voor banden en klantservice. Expertise, kwaliteit en persoonlijke service sinds 2020." />
        <meta name="keywords" content="over ons, familie bedrijf, bandenwinkel, banden expert, Ariana Bandencentraal, klantservice, expertise, betrouwbaar, lokaal bedrijf België" />
        
        <link rel="canonical" href="https://arianabandencentralebv.be/about" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Over Ons - Familie Bedrijf | Ariana Bandencentraal" />
        <meta property="og:description" content="Ontdek het verhaal achter Ariana Bandencentraal. Familie-bedrijf met passie voor banden en service." />
        <meta property="og:url" content="https://arianabandencentralebv.be/about" />
        <meta property="og:locale" content={currentLang === 'nl' ? 'nl_BE' : 'en_US'} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Over Ons - Ariana Bandencentraal" />
        <meta name="twitter:description" content="Familie-bedrijf met passie voor banden en klantservice" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "Over Ons - Ariana Bandencentraal",
            "description": "Familie-bedrijf gespecialiseerd in premium banden en velgen",
            "url": "https://arianabandencentralebv.be/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "Ariana Bandencentraal",
              "description": "Familie bandenwinkel gerund door twee broers",
              "foundingDate": "2020",
              "founders": [
                {
                  "@type": "Person",
                  "name": "Ahmadullah",
                  "jobTitle": "Digital Operations Manager"
                },
                {
                  "@type": "Person",
                  "name": "Amirjan",
                  "jobTitle": "Logistics & Supply Manager"
                }
              ]
            }
          })}
        </script>
        
        {/* Multi-lingual / Alternate language versions */}
        <link rel="alternate" hrefLang="nl" href="https://arianabandencentralebv.be/nl/about" />
        <link rel="alternate" hrefLang="en" href="https://arianabandencentralebv.be/en/about" />
        <link rel="alternate" hrefLang="x-default" href="https://arianabandencentralebv.be/about" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Our Story
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to Arianabanden - where family values meet automotive excellence. 
            We're two brothers passionate about keeping you safe on the road with 
            the best tires and exceptional service.
          </p>
        </div>

        {/* Brothers Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Meet the Brothers Behind Arianabanden
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ahmadullah - The Digital Expert
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      I handle all the online operations, from website management to customer 
                      service. My passion for technology and customer experience drives our 
                      digital presence, ensuring you have a seamless shopping experience 
                      from browsing to checkout.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Amirjan - The Logistics Master
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      My big brother Amirjan manages all logistics and supply chain operations. 
                      With years of experience in the tire industry, he ensures we source the 
                      highest quality tires and deliver them to your doorstep efficiently and 
                      safely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Partnership
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Growing up, we always shared a passion for cars and the automotive industry. 
                When we decided to start Arianabanden, we knew our complementary skills would 
                create something special. Amirjan's logistics expertise combined with my 
                digital know-how allows us to provide a complete tire solution.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-gray-600">Family Owned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To provide families with safe, reliable, and affordable tire solutions 
              while maintaining the highest standards of customer service. We believe 
              every family deserves quality tires that keep them safe on the road.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To become the most trusted family-owned tire retailer, known for our 
              personal touch, expert advice, and commitment to customer safety. 
              We want every customer to feel like part of our family.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Arianabanden?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Trust</h3>
              <p className="text-gray-600">
                As brothers, we treat every customer like family. Your safety and 
                satisfaction are our top priorities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                We only stock premium tires from trusted brands, ensuring you get 
                the best performance and safety.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Amirjan's logistics expertise ensures your tires arrive quickly 
                and safely, right to your doorstep.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Advice</h3>
              <p className="text-gray-600">
                Get personalized recommendations from our team of tire experts 
                who understand your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Service</h3>
              <p className="text-gray-600">
                Experience the difference of dealing with a family business. 
                We're here to help, not just sell.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Whether you need help choosing tires or have questions about 
                your order, we're always here for you.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Get in Touch with the Brothers
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Ahmadullah - Online Operations</h3>
              <p className="mb-4 opacity-90">
                Need help with your online order or have questions about our website? 
                I'm here to assist you with all digital aspects of your tire shopping experience.
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> ahmadullah@arianabanden.be</p>
                <p><strong>Online Support:</strong> Available 24/7</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Amirjan - Logistics & Supply</h3>
              <p className="mb-4 opacity-90">
                Questions about delivery, tire availability, or need expert advice on 
                tire selection? My brother Amirjan handles all logistics and technical inquiries.
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> amirjan@arianabanden.be</p>
                <p><strong>Phone:</strong> +32 467 66 21 97</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-lg opacity-90">
              <strong>Address:</strong> 
              Arianabanden, Provinciebaan 192A,Ledegem, Belgium 
            </p>
            <p className="opacity-90 mt-2">
              <strong>Business Hours:</strong> Monday - Friday: 9AM - 6PM | Saturday: 9AM - 6PM | Sunday: Only with appointment
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutPage;

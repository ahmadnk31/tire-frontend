import { Button } from "@/components/ui/button";
import heroTyre from "@/assets/hero-tyre.jpg";

export const HeroSection = () => {
  return (
  <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-secondary via-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
  <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full opacity-20"></div>
  <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full opacity-10"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 lg:py-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium shadow-lg">
                🔥 Limited Time Offer
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Premium Car Tyres</span>
                <span className="block text-gray-900 mt-2">For Every Drive</span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl">
              Discover our extensive range of high-performance tyres from top brands. 
              Quality, safety, and performance guaranteed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-primary hover:bg-accent text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-border text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200"
              >
                Find My Size
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $299</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-lg">★</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Top Brands</p>
                  <p className="text-sm text-gray-600">Michelin, Bridgestone & more</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Fast Installation</p>
                  <p className="text-sm text-gray-600">Professional service</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75"></div>
              <img 
                src={heroTyre} 
                alt="Premium car tyre" 
                className="relative max-w-lg w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">50%</p>
                  <p className="text-xs text-gray-600">OFF</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Premium</p>
                  <p className="text-xs text-gray-600">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
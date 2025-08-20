import React from "react";
import { SEO } from "@/components/seo/SEO";
import { usePageSEO } from "@/hooks/useSEO";

const AboutPage = () => {
  const seoConfig = usePageSEO();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <SEO {...seoConfig} />
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to Tire Store! We are dedicated to providing the best quality tires
          and exceptional customer service. Our mission is to keep you safe on the
          road with reliable and affordable tire solutions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Mission</h2>
            <p className="text-gray-600">
              To deliver top-notch tire products and services that ensure safety,
              reliability, and value for our customers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Vision</h2>
            <p className="text-gray-600">
              To be the leading tire provider, recognized for our commitment to
              quality and customer satisfaction.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600 mb-6">
            At Tire Store, we pride ourselves on offering:
          </p>
          <ul className="list-disc list-inside text-left text-gray-600 space-y-2">
            <li>High-quality tires from trusted brands</li>
            <li>Competitive pricing to fit your budget</li>
            <li>Expert advice and personalized recommendations</li>
            <li>Fast and reliable service to get you back on the road</li>
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-600 mb-6">
            Have questions or need assistance? Reach out to us:
          </p>
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>Email:</strong> support@tirestore.com
            </p>
            <p className="text-gray-600">
              <strong>Phone:</strong> +1 (800) 123-4567
            </p>
            <p className="text-gray-600">
              <strong>Address:</strong> 123 Tire Street, Auto City, USA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

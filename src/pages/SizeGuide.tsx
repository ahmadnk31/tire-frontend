import React, { useState } from "react";
import { Search, Info, Ruler, Car, Truck, Bike } from "lucide-react";

const SizeGuide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("car");

  const vehicleTypes = [
    { id: "car", name: "Car", icon: Car },
    { id: "suv", name: "SUV/Truck", icon: Truck },
    { id: "motorcycle", name: "Motorcycle", icon: Bike },
  ];

  const commonSizes = {
    car: [
      "195/65R15", "205/55R16", "215/60R16", "225/50R17", "235/45R18",
      "185/60R15", "195/50R15", "205/60R15", "215/55R17", "225/45R17",
      "185/65R14", "195/60R15", "205/50R17", "215/45R17", "225/40R18"
    ],
    suv: [
      "235/70R16", "245/65R17", "255/60R18", "265/50R20", "275/45R20",
      "225/75R16", "235/65R17", "245/60R18", "255/55R18", "265/45R21",
      "215/80R16", "225/70R16", "235/60R18", "245/55R19", "255/50R19"
    ],
    motorcycle: [
      "120/70-17", "160/60-17", "180/55-17", "190/50-17", "200/55-17",
      "110/80-17", "130/70-17", "150/60-17", "170/60-17", "190/55-17",
      "100/90-19", "120/60-17", "140/70-17", "160/70-17", "180/60-16"
    ]
  };

  const filteredSizes = commonSizes[selectedVehicleType as keyof typeof commonSizes]
    .filter(size => size.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tire Size Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find the right tire size for your vehicle. Learn how to read tire markings 
            and find compatible sizes for your car, SUV, or motorcycle.
          </p>
        </div>

        {/* Vehicle Type Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {vehicleTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedVehicleType(type.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedVehicleType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="max-sm:hidden">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - How to Read Tire Size */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ruler className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">How to Read Tire Size</h2>
            </div>

            {/* Tire Size Example */}
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 text-center mb-4">
                <span className="text-3xl font-mono font-bold text-gray-900">
                  225/50R17 94H
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-8 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-sm">
                    225
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Width</h3>
                    <p className="text-sm text-gray-600">Tire width in millimeters</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold text-sm">
                    50
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Aspect Ratio</h3>
                    <p className="text-sm text-gray-600">Sidewall height as % of width</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Construction</h3>
                    <p className="text-sm text-gray-600">R = Radial construction</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-8 bg-purple-500 text-white rounded flex items-center justify-center font-bold text-sm">
                    17
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rim Diameter</h3>
                    <p className="text-sm text-gray-600">Wheel diameter in inches</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-8 bg-red-500 text-white rounded flex items-center justify-center font-bold text-sm">
                    94H
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Load & Speed</h3>
                    <p className="text-sm text-gray-600">Load index & speed rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Important Notes</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Always replace tires with the same size as original equipment</li>
                    <li>• Check your vehicle manual for approved tire sizes</li>
                    <li>• Consider load and speed ratings for your driving needs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Size Finder */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Find Your Size</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label htmlFor="size-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search tire sizes
              </label>
              <input
                id="size-search"
                type="text"
                placeholder="e.g., 225/50R17 or just 225"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Common Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Common {vehicleTypes.find(t => t.id === selectedVehicleType)?.name} Sizes
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {filteredSizes.map((size, index) => (
                  <button
                    key={index}
                    className="p-3 text-sm font-mono bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                    onClick={() => {
                      // You can add functionality to search for this specific size
                      console.log(`Selected size: ${size}`);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {filteredSizes.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No sizes found matching "{searchTerm}"</p>
                </div>
              )}
            </div>

            {/* Where to Find Size */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Where to Find Your Tire Size</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Check the sidewall of your current tire</li>
                <li>• Look in your vehicle's owner manual</li>
                <li>• Check the driver's side door jamb sticker</li>
                <li>• Glove compartment documentation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Speed Rating Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Speed Rating Guide</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Speed Symbol</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Max Speed (km/h)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Max Speed (mph)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Typical Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="px-4 py-3 font-mono font-bold">Q</td><td className="px-4 py-3">160</td><td className="px-4 py-3">99</td><td className="px-4 py-3">Winter tires</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">S</td><td className="px-4 py-3">180</td><td className="px-4 py-3">112</td><td className="px-4 py-3">Family cars</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">T</td><td className="px-4 py-3">190</td><td className="px-4 py-3">118</td><td className="px-4 py-3">Family cars</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">H</td><td className="px-4 py-3">210</td><td className="px-4 py-3">130</td><td className="px-4 py-3">Sport sedans</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">V</td><td className="px-4 py-3">240</td><td className="px-4 py-3">149</td><td className="px-4 py-3">Sports cars</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">W</td><td className="px-4 py-3">270</td><td className="px-4 py-3">168</td><td className="px-4 py-3">Exotic sports cars</td></tr>
                <tr><td className="px-4 py-3 font-mono font-bold">Y</td><td className="px-4 py-3">300</td><td className="px-4 py-3">186</td><td className="px-4 py-3">High-performance</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-primary text-primary-foreground rounded-xl p-6 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="mb-4">
            Our tire experts are here to help you find the perfect tire size for your vehicle.
          </p>
          <button onClick={() => window.location.href = "/contact"} className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Our Experts
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;

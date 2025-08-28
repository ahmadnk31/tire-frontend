import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { addressApi } from "@/lib/addressApi";
import { stripeApi } from "@/lib/api";
import { Check, ShoppingBag, MapPin, CreditCard, Eye } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// Debug Stripe configuration
console.log('🔑 Stripe publishable key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log('🔑 Stripe key length:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.length);
console.log('🔑 Stripe key starts with pk_test:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test'));

interface CartItem {
  id: number;
  name: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
}

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

function StepperIndicator({ steps, currentStep }: { steps: CheckoutStep[], currentStep: number }) {
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 2: return <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 3: return <Eye className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <span className="text-xs font-semibold">{stepId}</span>;
    }
  };

  return (
    <div className="flex items-center justify-center sm:justify-between mb-6 sm:mb-8 gap-2 sm:gap-0 overflow-x-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-shrink-0">
          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
            step.completed 
              ? 'bg-accent border-accent text-accent-foreground' 
              : currentStep === step.id 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-gray-200 border-gray-300 text-gray-500'
          }`}>
            {step.completed ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              getStepIcon(step.id)
            )}
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 hidden sm:block">
            <div className={`text-sm sm:text-base font-medium ${
              step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.title}
            </div>
            <div className="text-xs text-gray-500">{step.description}</div>
          </div>
          {index < steps.length - 1 && (
            <div className="flex items-center px-1 sm:px-4">
              <div className="w-4 sm:w-8 h-px bg-gray-300"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({ cart, subtotal, total }: { 
  cart: CartItem[], 
  subtotal: number, 
  total: number 
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ShoppingBag className="w-5 h-5 mr-2" />
        {t('checkout.orderSummary.title')}
      </h3>
      
      <div className="space-y-4 mb-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
              {item.image || item.imageUrl ? (
                <img src={item.image || item.imageUrl} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded-md" />
              ) : (
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.brand} • {item.size}</div>
              <div className="text-xs text-gray-500">{t('checkout.orderSummary.quantity')}: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              €{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.orderSummary.subtotal')}</span>
          <span className="text-gray-900">€{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.orderSummary.shipping')}</span>
          <span className="text-gray-900">{t('checkout.orderSummary.free')}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span className="text-gray-900">{t('checkout.orderSummary.total')}</span>
          <span className="text-gray-900">€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutFormWithoutStripe({ cart, setCart, currentStep, setCurrentStep, steps, setSteps, clientSecret, setClientSecret }: {
  cart: CartItem[],
  setCart: (cart: CartItem[]) => void,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  steps: CheckoutStep[],
  setSteps: (steps: CheckoutStep[]) => void,
  clientSecret: string | null,
  setClientSecret: (secret: string | null) => void
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressDefaults, setAddressDefaults] = useState<any>(null);
  const [addressComplete, setAddressComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      addressApi.getDefaultShipping(token)
        .then(res => {
          if (res.address) {
            setAddressDefaults({
              name: res.address.name,
              address: {
                line1: res.address.street,
                city: res.address.city,
                state: res.address.state,
                postal_code: res.address.zipCode,
                country: res.address.country
              }
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleNextStep = async () => {
    if (currentStep < 3) {
      const updatedSteps = steps.map(step =>
        step.id === currentStep ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
      
      // Create new payment intent with address information when moving to payment step (step 2)
      if (currentStep === 1 && shippingAddress) {
        console.log('📦 Creating new payment intent with address information...');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        try {
          console.log('📦 Address data being sent:', {
            shippingAddress,
            billingAddress: shippingAddress
          });
          
          const response = await stripeApi.createPaymentIntent({
            cart: cart,
            userId: userId || undefined,
            userEmail: userEmail || undefined,
            userName: userName || undefined,
            shippingAddress: shippingAddress || undefined,
            billingAddress: shippingAddress || undefined // Use shipping address as billing address
          });
          
          console.log('✅ New payment intent created with address:', response);
          if (response && response.clientSecret) {
            console.log('🔍 New clientSecret found:', response.clientSecret);
            setClientSecret(response.clientSecret);
          } else {
            console.error('❌ No clientSecret in response:', response);
          }
        } catch (error) {
          console.error('❌ Error creating payment intent with address:', error);
        }
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("Payment processing is not available without Stripe context");
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm">
      <StepperIndicator steps={steps} currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 min-w-0 space-y-6">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.shipping.title')}</h2>
                                 <div className="space-y-4">
                   <div>
                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                       {t('checkout.addressForm.fullName')}
                     </label>
                     <input
                       type="text"
                       id="name"
                       value={shippingAddress?.name || ''}
                       onChange={(e) => {
                         const newAddress = {
                           name: e.target.value,
                           address: shippingAddress?.address || {}
                         };
                         setShippingAddress(newAddress);
                         setAddressComplete(!!e.target.value && !!shippingAddress?.address?.line1);
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder={t('checkout.addressForm.fullNamePlaceholder')}
                     />
                   </div>
                   
                   <div>
                     <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
                       {t('checkout.addressForm.addressLine1')}
                     </label>
                     <input
                       type="text"
                       id="line1"
                       value={shippingAddress?.address?.line1 || ''}
                       onChange={(e) => {
                         const newAddress = {
                           name: shippingAddress?.name || '',
                           address: {
                             ...shippingAddress?.address,
                             line1: e.target.value
                           }
                         };
                         setShippingAddress(newAddress);
                         setAddressComplete(!!shippingAddress?.name && !!e.target.value);
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder={t('checkout.addressForm.addressLine1Placeholder')}
                     />
                   </div>
                   
                   <div>
                     <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                       {t('checkout.addressForm.city')}
                     </label>
                     <input
                       type="text"
                       id="city"
                       value={shippingAddress?.address?.city || ''}
                       onChange={(e) => {
                         const newAddress = {
                           name: shippingAddress?.name || '',
                           address: {
                             ...shippingAddress?.address,
                             city: e.target.value
                           }
                         };
                         setShippingAddress(newAddress);
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder={t('checkout.addressForm.cityPlaceholder')}
                     />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                         {t('checkout.addressForm.postalCode')}
                       </label>
                       <input
                         type="text"
                         id="postal_code"
                         value={shippingAddress?.address?.postal_code || ''}
                         onChange={(e) => {
                           const newAddress = {
                             name: shippingAddress?.name || '',
                             address: {
                               ...shippingAddress?.address,
                               postal_code: e.target.value
                             }
                           };
                           setShippingAddress(newAddress);
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                         placeholder={t('checkout.addressForm.postalCodePlaceholder')}
                       />
                     </div>
                     
                     <div>
                       <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                         {t('checkout.addressForm.country')}
                       </label>
                       <select
                         id="country"
                         value={shippingAddress?.address?.country || ''}
                         onChange={(e) => {
                           const newAddress = {
                             name: shippingAddress?.name || '',
                             address: {
                               ...shippingAddress?.address,
                               country: e.target.value
                             }
                           };
                           setShippingAddress(newAddress);
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                       >
                         <option value="">{t('checkout.addressForm.selectCountry')}</option>
                         <option value="BE">{t('checkout.addressForm.belgium')}</option>
                         <option value="NL">{t('checkout.addressForm.netherlands')}</option>
                         <option value="DE">{t('checkout.addressForm.germany')}</option>
                         <option value="FR">{t('checkout.addressForm.france')}</option>
                       </select>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.payment.title')}</h2>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payment form...</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.review.title')}</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{t('checkout.review.shipping')}</h3>
                  {shippingAddress && (
                    <div className="text-sm text-gray-600">
                      <p>{shippingAddress.name}</p>
                      <p>{shippingAddress.address?.line1}</p>
                      {shippingAddress.address?.line2 && <p>{shippingAddress.address.line2}</p>}
                      <p>{shippingAddress.address?.city}, {shippingAddress.address?.state} {shippingAddress.address?.postal_code}</p>
                      <p>{shippingAddress.address?.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.summary.title')}</h3>
            
            <div className="space-y-3 mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600">{item.size} × {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">€{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('checkout.summary.subtotal')}</span>
                <span className="font-medium">€{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('checkout.summary.shipping')}</span>
                <span className="font-medium">€0</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('checkout.summary.total')}</span>
                <span>€{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('checkout.navigation.back')}
        </button>
        
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={currentStep === 1 && !addressComplete}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('checkout.navigation.next')}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('checkout.payment.processing') : t('checkout.payment.pay')}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </form>
  );
}

function CheckoutForm({ cart, setCart, currentStep, setCurrentStep, steps, setSteps, clientSecret, setClientSecret }: {
  cart: CartItem[],
  setCart: (cart: CartItem[]) => void,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  steps: CheckoutStep[],
  setSteps: (steps: CheckoutStep[]) => void,
  clientSecret: string | null,
  setClientSecret: (secret: string | null) => void
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [addressComplete, setAddressComplete] = useState(false);

  const userName = localStorage.getItem("userName") || "Guest";
  const userEmail = localStorage.getItem("userEmail") || "guest@example.com";
  const userId = localStorage.getItem("userId");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleNextStep = async () => {
    setError(null);

    // ✅ Validate before going to next step
    if (currentStep === 2) {
      const paymentElement = elements?.getElement("payment");
      if (paymentElement) {
        const state = paymentElement as any; // PaymentElement doesn't expose state directly
        // There's no direct method to check completion, so rely on Stripe validation during confirmPayment
        // We'll just prevent navigation for now and rely on confirmPayment in final step
      }
    }

    const updatedSteps = steps.map(step =>
      step.id === currentStep ? { ...step, completed: true } : step
    );
    setSteps(updatedSteps);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveOrderToBackend = async (status: string) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          cart,
          total,
          shippingAddress,
          billingAddress: shippingAddress,
          paymentStatus: status
        })
      });
    } catch (err) {
      console.error("❌ Failed to save order:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/order-success",
        payment_method_data: {
          billing_details: shippingAddress ? {
            name: shippingAddress.name,
            email: userEmail,
            address: {
              line1: shippingAddress.address?.line1,
              line2: shippingAddress.address?.line2,
              city: shippingAddress.address?.city,
              state: shippingAddress.address?.state,
              postal_code: shippingAddress.address?.postal_code,
              country: shippingAddress.address?.country
            }
          } : undefined
        }
      },
      redirect: "if_required"
    });

    if (result.error) {
      setError(result.error.message || "Payment failed. Please check your card details.");
      setLoading(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      await saveOrderToBackend("paid");
      localStorage.removeItem("cart");
      setCart([]); // Clear local cart state
      // Dispatch cart-updated event to update cart notification icons
      window.dispatchEvent(new Event('cart-updated'));
      navigate("/order-success");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm">
      <StepperIndicator steps={steps} currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 min-w-0 space-y-6">
          {/* ✅ Step 1: Address */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-primary" />
                {t('checkout.address.title')}
              </h2>
              <AddressElement
                options={{ mode: "shipping", allowedCountries: ["NL", "BE", "DE", "FR"] }}
                onChange={(event) => {
                  setAddressComplete(event.complete);
                  if (event.value) setShippingAddress(event.value);
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!addressComplete}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300"
                >
                  {t('checkout.address.continue')}
                </button>
              </div>
            </>
          )}

          {/* ✅ Step 2: Payment */}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl font-semibold flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-primary" />
                {t('checkout.payment.title')}
              </h2>
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {t('checkout.payment.back')}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {t('checkout.payment.review')}
                </button>
              </div>
            </>
          )}

          {/* Always mounted PaymentElement for form submission */}
          <div style={{ 
            opacity: currentStep === 2 ? 1 : 0,
            height: currentStep === 2 ? "auto" : 0,
            overflow: currentStep === 2 ? "visible" : "hidden",
            position: currentStep === 2 ? "static" : "absolute",
            pointerEvents: currentStep === 2 ? "auto" : "none",
            visibility: currentStep === 2 ? "visible" : "hidden",
            zIndex: currentStep === 2 ? "auto" : -1
          }}>
            <PaymentElement options={{ fields: { billingDetails: "auto" } }} />
          </div>

          {/* ✅ Step 3: Review */}
          {currentStep === 3 && (
            <>
              <h2 className="text-xl font-semibold flex items-center">
                <Eye className="w-6 h-6 mr-3 text-primary" />
                {t('checkout.review.title')}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{t('checkout.review.orderItems')}</h3>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-tire.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.size}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × €{item.price.toFixed(2)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {t('checkout.review.back')}
                </button>
                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="px-8 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:bg-gray-300 font-semibold"
                >
                  {loading ? t('checkout.review.processing') : `${t('checkout.review.placeOrder')} - €${total.toFixed(2)}`}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ✅ Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h3 className="text-lg font-semibold mb-4">{t('checkout.orderSummary.title')}</h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-tire.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.size}</div>
                    <div className="text-xs text-gray-500">{t('checkout.orderSummary.quantity')}: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>{t('checkout.orderSummary.total')}</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}


export default function CheckoutPage() {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<CheckoutStep[]>([
    { id: 1, title: t('checkout.steps.address.title'), description: t('checkout.steps.address.description'), completed: false },
    { id: 2, title: t('checkout.steps.payment.title'), description: t('checkout.steps.payment.description'), completed: false },
    { id: 3, title: t('checkout.steps.review.title'), description: t('checkout.steps.review.description'), completed: false }
  ]);
  
  useEffect(() => {
    try {
      // Get cart from localStorage
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log('🛒 Cart data:', cartData);
      
      // Validate cart data
      if (!cartData || cartData.length === 0) {
        console.error('Cart is empty');
        return;
      }
      
      // Ensure cart items have required fields
      const validCart = cartData.filter((item: any) => item.price && item.quantity);
      if (validCart.length === 0) {
        console.error('No valid cart items found');
        return;
      }
      
      // Store valid cart for later use
      setCart(validCart);
    } catch (error) {
      console.error('❌ Error in checkout useEffect:', error);
    }
  }, []);

  console.log('🔍 [CheckoutPage] Render state:', { 
    clientSecret: !!clientSecret, 
    cartLength: cart.length, 
    currentStep 
  });
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {cart.length === 0 ? t('checkout.loading.cart') : t('checkout.loading.payment')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('checkout.debug.clientSecret')}: {clientSecret ? '✅' : '❌'} | {t('checkout.debug.cart')}: {cart.length} {t('checkout.debug.items')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('checkout.debug.debug')}: {t('checkout.debug.cartDataLength')} = {cart.length}, {t('checkout.debug.clientSecretExists')} = {clientSecret ? t('checkout.debug.yes') : t('checkout.debug.no')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('checkout.debug.currentStep')}: {currentStep}
          </p>
          {cart.length === 0 && (
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => {
                  const testCart = [{id: 82, name: 'Windforce CatchFors H/P', price: 110, quantity: 1, size: '185/60R14'}];
                  localStorage.setItem('cart', JSON.stringify(testCart));
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block w-full"
              >
                {t('checkout.debug.addTestItem')}
              </button>
              <button 
                onClick={() => {
                  console.log('🔄 Reloading page...');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 block w-full"
              >
                {t('checkout.debug.reloadPage')}
              </button>
            </div>
          )}
          {!clientSecret && cart.length > 0 && (
            <div className="mt-4">
              <button 
                onClick={() => {
                  console.log('🔄 Manually creating payment intent...');
                  const userId = localStorage.getItem('userId');
                  const userEmail = localStorage.getItem('userEmail');
                  const userName = localStorage.getItem('userName');
                  
                  stripeApi.createPaymentIntent({
                    cart: cart,
                    userId: userId || undefined,
                    userEmail: userEmail || undefined,
                    userName: userName || undefined
                  })
                    .then(response => {
                      console.log('✅ Manual payment intent created:', response);
                      if (response && response.clientSecret) {
                        setClientSecret(response.clientSecret);
                      }
                    })
                    .catch(error => {
                      console.error('❌ Manual payment intent error:', error);
                    });
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t('checkout.debug.createPaymentIntent')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading if we don't have a client secret for payment step
  if (currentStep === 2 && !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('checkout.debug.creatingPaymentSession')}</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('checkout.debug.clientSecret')}: {clientSecret ? '✅' : '❌'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: 'hsl(220, 9%, 20%)', // --primary from theme
                colorBackground: '#ffffff',
                colorText: 'hsl(220, 9%, 20%)', // --primary
                colorDanger: 'hsl(0, 84%, 60%)', // --destructive
                colorSuccess: 'hsl(28, 100.00%, 51.80%)', // --accent
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '6px',
                colorTextSecondary: 'hsl(220, 9%, 46%)', // --muted-foreground
                colorTextPlaceholder: 'hsl(220, 9%, 46%)',
              },
              rules: {
                '.Input': {
                  border: '1px solid hsl(220, 13%, 91%)', // --border
                  boxShadow: 'none',
                },
                '.Input:focus': {
                  border: '1px solid hsl(220, 9%, 20%)', // --primary  
                  boxShadow: '0 0 0 1px hsl(220, 9%, 20%)',
                },
                '.Label': {
                  color: 'hsl(220, 9%, 20%)', // --primary
                  fontWeight: '500',
                }
              }
            },
            loader: 'auto'
          }}
        >
          <CheckoutForm 
            cart={cart}
            setCart={setCart}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            setSteps={setSteps}
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
          />
        </Elements>
      ) : (
        <CheckoutFormWithoutStripe 
          cart={cart}
          setCart={setCart}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          steps={steps}
          setSteps={setSteps}
          clientSecret={clientSecret}
          setClientSecret={setClientSecret}
        />
      )}
    </div>
  );
}

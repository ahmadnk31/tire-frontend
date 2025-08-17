import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { addressApi } from "@/lib/addressApi";
import { stripeApi } from "@/lib/api";
import { Check, ChevronRight, ShoppingBag, MapPin, CreditCard, Eye } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  id: number;
  name: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
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

function OrderSummary({ cart, subtotal, tax, total }: { 
  cart: CartItem[], 
  subtotal: number, 
  tax: number, 
  total: number 
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ShoppingBag className="w-5 h-5 mr-2" />
        Order Summary
      </h3>
      
      <div className="space-y-4 mb-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
              ) : (
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.brand} • {item.size}</div>
              <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              €{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">€{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">Free</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ cart, currentStep, setCurrentStep, steps, setSteps }: {
  cart: CartItem[],
  currentStep: number,
  setCurrentStep: (step: number) => void,
  steps: CheckoutStep[],
  setSteps: (steps: CheckoutStep[]) => void
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressDefaults, setAddressDefaults] = useState<any>(null);
  const [addressComplete, setAddressComplete] = useState(false);

  useEffect(() => {
    // Fetch default shipping address if logged in
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

  const handleNextStep = () => {
    if (currentStep < 3) {
      // Mark current step as completed
      const updatedSteps = steps.map(step => 
        step.id === currentStep ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
        return_url: window.location.origin + "/order-success"
      },
      redirect: "if_required"
    });
    
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Payment failed");
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      // Mark final step as completed
      const updatedSteps = steps.map(step => ({ ...step, completed: true }));
      setSteps(updatedSteps);
      // Clear cart
      localStorage.removeItem('cart');
      // Redirect to success page
      navigate("/order-success");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.21; // 21% VAT
  const total = subtotal + tax;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm">
      <StepperIndicator steps={steps} currentStep={currentStep} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 min-w-0">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-primary" />
                <span className="hidden sm:inline">Shipping Address</span>
                <span className="sm:hidden">Address</span>
              </h2>
              <AddressElement 
                options={{ 
                  mode: "shipping", 
                  defaultValues: addressDefaults || undefined,
                  allowedCountries: ['NL', 'BE', 'DE', 'FR']
                }}
                onChange={(event) => {
                  setAddressComplete(event.complete);
                }}
              />
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!addressComplete}
                  className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-primary" />
                <span className="hidden sm:inline">Payment Method</span>
                <span className="sm:hidden">Payment</span>
              </h2>
              <PaymentElement 
                options={{
                  fields: {
                    billingDetails: 'never'
                  }
                }}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Eye className="w-6 h-6 mr-3 text-primary" />
                <span className="hidden sm:inline">Review & Place Order</span>
                <span className="sm:hidden">Review</span>
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keep PaymentElement mounted but hidden for Stripe */}
              <div style={{ display: 'none' }}>
                <PaymentElement 
                  options={{
                    fields: {
                      billingDetails: 'never'
                    }
                  }}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Payment
                </button>
                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full sm:w-auto px-8 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? "Processing..." : `Place Order - €${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary cart={cart} subtotal={subtotal} tax={tax} total={total} />
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<CheckoutStep[]>([
    { id: 1, title: 'Address', description: 'Shipping information', completed: false },
    { id: 2, title: 'Payment', description: 'Payment method', completed: false },
    { id: 3, title: 'Review', description: 'Review & place order', completed: false }
  ]);
  
  useEffect(() => {
    // Get cart from localStorage
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
    
    // Fetch PaymentIntent client secret from backend
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
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
    
    console.log('Creating payment intent with cart:', validCart);
    
    stripeApi.createPaymentIntent({
      cart: validCart,
      userId: userId || undefined,
      userEmail: userEmail || undefined,
      userName: userName || undefined
    })
      .then(data => {
        console.log('Payment intent created:', data);
        setClientSecret(data.clientSecret);
      })
      .catch(error => {
        console.error('Error creating payment intent:', error);
      });
  }, []);

  if (!clientSecret || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {cart.length === 0 ? 'Loading cart...' : 'Initializing payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
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
              colorSuccess: 'hsl(142, 76%, 36%)', // --accent
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
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          steps={steps}
          setSteps={setSteps}
        />
      </Elements>
    </div>
  );
}

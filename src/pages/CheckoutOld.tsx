import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { addressApi } from "@/lib/addressApi";
import apiClient from "@/lib/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressDefaults, setAddressDefaults] = useState<any>(null);

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
      // Redirect to success page
      navigate("/order-success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <AddressElement options={{ mode: "shipping", defaultValues: addressDefaults || undefined }} />
      <PaymentElement />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" disabled={!stripe || loading} className="w-full py-3 bg-primary text-white rounded-xl font-semibold mt-4 hover:bg-primary/90 transition">
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch PaymentIntent client secret from backend
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    apiClient.post("/create-payment-intent", { 
      cart: cart,
      userId: userId,
      userEmail: userEmail,
      userName: userName
    })
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => setError("Failed to initialize payment"));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div>Loading payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

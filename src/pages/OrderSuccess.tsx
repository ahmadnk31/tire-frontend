import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, UserPlus, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Clear cart after successful payment
    localStorage.removeItem('cart');
    // Dispatch cart-updated event to update cart notification icons
    window.dispatchEvent(new Event('cart-updated'));
  }, []);

  const handleTrackOrder = () => {
    // For guest users, redirect to contact page with order tracking info
    // The contact page will handle the order tracking inquiry
    navigate('/contact?subject=order-tracking&inquiryType=support');
  };

  const handleCreateAccount = () => {
    navigate('/register?redirect=orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">{t('checkout.orderComplete')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {t('checkout.thankYou')} {t('checkout.orderPlaced')}
            </p>
            <p className="text-sm text-gray-500">
              {t('checkout.emailConfirmation')}
            </p>
            
            <div className="space-y-3">
              {isLoggedIn ? (
                // Logged in user - can view orders
                <Button 
                  onClick={() => navigate('/orders')} 
                  className="w-full"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('checkout.viewMyOrders')}
                </Button>
              ) : (
                // Guest user - show different options
                <div className="space-y-2">
                  <Button 
                    onClick={handleTrackOrder}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {t('checkout.trackOrderByEmail')}
                  </Button>
                  <Button 
                    onClick={handleCreateAccount}
                    variant="outline"
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('checkout.createAccountToTrack')}
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')} 
                className="w-full"
              >
                {t('checkout.continueShopping')}
              </Button>
            </div>

            {!isLoggedIn && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>{t('checkout.guestUserTip')}</strong><br />
                  {t('checkout.guestUserTipText')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

export default function EmailNotVerified() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { email = '' } = location.state || {};
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleResend = async () => {
    setError('');
    setResent(false);
    try {
      await authApi.resendVerification(email, i18n.language);
      setResent(true);
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AuthLayout>
          <Card className="w-full max-w-md shadow-2xl border border-primary/30">
            <CardContent className="py-8 px-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-primary mb-2">Tyre Vision</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Email not verified</h2>
              <div className="text-center text-gray-700 mb-4">
                Please verify your email to continue.
              </div>
              {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
              <Button type="button" variant="outline" className="text-primary underline text-sm mb-2" onClick={handleResend}>
                Resend verification email
              </Button>
              {resent && <div className="text-green-600 text-xs mt-1">Verification email resent!</div>}
              <Button type="button" className="mt-6 w-full" onClick={() => navigate('/login')}>Back to Login</Button>
            </CardContent>
          </Card>
        </AuthLayout>
      </main>
    </div>
  );
}

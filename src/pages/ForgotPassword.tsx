import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // You need to implement this endpoint in your backend
      await authApi.forgotPassword(email, i18n.language);
      setMessage(t('auth.forgotPassword.success'));
    } catch (err: any) {
      setError(err.error || t('auth.forgotPassword.failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {t('auth.backToHome')}
      </Button>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">{t('auth.brandName')}</span>
            <h2 className="text-xl font-semibold text-gray-900">{t('auth.forgotPassword.title')}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center">{message}</div>}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">{t('auth.forgotPassword.button')}</Button>
          </form>
          <div className="mt-6 text-sm text-center">
            <button className="text-primary underline font-medium" onClick={() => navigate('/login')}>{t('auth.forgotPassword.backToLogin')}</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

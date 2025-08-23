import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import AuthLayout from '@/components/AuthLayout';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Remove unverified/resent state, handled in EmailNotVerified page
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent, resend = false) => {
    e.preventDefault();
    setError('');
  //
    try {
      const res = await authApi.login({ email, password, resendVerification: resend, language: i18n.language });
      if (res.token) {
        await setAuthToken(res.token, res.user);
        navigate('/');
      } else if (res.unverified) {
        // Redirect to EmailNotVerified page, pass email in state
        navigate('/email-not-verified', { state: { email } });
      }
    } catch (err: any) {
      if (err.unverified) {
        navigate('/email-not-verified', { state: { email } });
      } else {
        setError(err.error || err.message || t('auth.login.failed'));
      }
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">
              {t('auth.brandName')}
            </span>
            <h2 className="text-xl font-semibold text-gray-900">{t('auth.login.title')}</h2>
          </div>
          <form onSubmit={e => handleLogin(e)} className="space-y-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {/* Unverified logic moved to EmailNotVerified page */}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">{t('auth.login.button')}</Button>
          </form>
          <div className="mt-4 text-sm text-center">
            <button className="text-primary underline font-medium" onClick={() => navigate('/forgot-password')}>{t('auth.login.forgotPassword')}</button>
          </div>
          <div className="mt-6 text-sm text-center">
            <span>{t('auth.login.noAccount')} </span>
            <button className="text-primary underline font-medium" onClick={() => navigate('/register')}>{t('auth.login.register')}</button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

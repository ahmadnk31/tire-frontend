import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

export default function Register() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarning('');
    try {
      const response = await authApi.register({ name, email, password, language: i18n.language });
      setSuccess(true);
      if (response.warning) {
        setWarning(response.warning);
      }
    } catch (err: any) {
      setError(err.error || t('auth.register.failed'));
    }
  };

  return (
  <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">{t('auth.brandName')}</span>
            <h2 className="text-xl font-semibold text-gray-900">{t('auth.register.title')}</h2>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.name')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {warning && <div className="text-yellow-600 text-sm text-center">{warning}</div>}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">{t('auth.register.button')}</Button>
          </form>
          {success && <div className="text-green-600 mt-6 text-center">{t('auth.register.checkEmail')}</div>}
          <div className="mt-6 text-sm text-center">
            <span>{t('auth.register.haveAccount')} </span>
            <button className="text-primary underline font-medium" onClick={() => navigate('/login')}>{t('auth.register.login')}</button>
          </div>
        </CardContent>
      </Card>
  </AuthLayout>
  );
}

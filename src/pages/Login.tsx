import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import AuthLayout from '@/components/AuthLayout';

export default function Login() {
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
      const res = await authApi.login({ email, password, resendVerification: resend });
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          window.dispatchEvent(new Event('login'));
        }
        navigate('/');
      } else if (res.unverified) {
        // Redirect to EmailNotVerified page, pass email in state
        navigate('/email-not-verified', { state: { email } });
      }
    } catch (err: any) {
      if (err.unverified) {
        navigate('/email-not-verified', { state: { email } });
      } else {
        setError(err.error || err.message || 'Login failed');
      }
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">Tyre Vision</span>
            <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
          </div>
          <form onSubmit={e => handleLogin(e)} className="space-y-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {/* Unverified logic moved to EmailNotVerified page */}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">Login</Button>
          </form>
          <div className="mt-4 text-sm text-center">
            <button className="text-primary underline font-medium" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
          </div>
          <div className="mt-6 text-sm text-center">
            <span>Don't have an account? </span>
            <button className="text-primary underline font-medium" onClick={() => navigate('/register')}>Register</button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

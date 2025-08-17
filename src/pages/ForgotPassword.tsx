import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // You need to implement this endpoint in your backend
      await authApi.forgotPassword(email);
      setMessage('If your email exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">Tyre Vision</span>
            <h2 className="text-xl font-semibold text-gray-900">Forgot Password</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center">{message}</div>}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">Send Reset Link</Button>
          </form>
          <div className="mt-6 text-sm text-center">
            <button className="text-primary underline font-medium" onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

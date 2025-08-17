import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.register({ name, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.error || 'Registration failed');
    }
  };

  return (
  <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-bold text-primary mb-2">Tyre Vision</span>
            <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow hover:bg-accent transition-all">Register</Button>
          </form>
          {success && <div className="text-green-600 mt-6 text-center">Check your email to verify your account.</div>}
          <div className="mt-6 text-sm text-center">
            <span>Already have an account? </span>
            <button className="text-primary underline font-medium" onClick={() => navigate('/login')}>Login</button>
          </div>
        </CardContent>
      </Card>
  </AuthLayout>
  );
}

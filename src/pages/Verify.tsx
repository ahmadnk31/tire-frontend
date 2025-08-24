import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/components/AuthLayout';

export default function Verify() {
  const [status, setStatus] = useState('Verifying...');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const token = params.get('token');
    if (email && token) {
      authApi.verify(email, token)
        .then(() => {
          setStatus('Email verified! You can now login.');
          setTimeout(() => navigate('/login'), 2000);
        })
        .catch(() => setStatus('Verification failed.'));
    } else {
      setStatus('Invalid verification link.');
    }
  }, [location, navigate]);

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border border-primary/30">
        <CardContent className="py-8 px-6 text-center">
          <span className="text-3xl font-bold text-primary mb-2 block">Tyre Vision</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Verification</h2>
          <div className="text-base text-gray-700 mb-2">{status}</div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

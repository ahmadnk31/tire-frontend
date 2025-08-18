import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const token = searchParams.get('token');

    if (!emailParam) {
      setStatus('invalid');
      setMessage('Invalid unsubscribe link. Email parameter is missing.');
      return;
    }

    setEmail(emailParam);
    handleUnsubscribe(emailParam, token);
  }, [searchParams]);

  const handleUnsubscribe = async (email: string, token: string | null) => {
    try {
      setStatus('loading');

      const requestBody: any = { email };
      if (token) {
        requestBody.token = token;
      }

      const response = await fetch(`${API_BASE_URL}/contact/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unsubscribe');
      }

      setStatus('success');
      setMessage(data.message || 'You have been successfully unsubscribed from our newsletter.');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to unsubscribe. Please try again.');
    }
  };

  const handleRetry = () => {
    const token = searchParams.get('token');
    handleUnsubscribe(email, token);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      case 'invalid':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      default:
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'invalid':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`shadow-lg ${getStatusColor()}`}>
          <CardHeader className="text-center pb-2">
            <div className="flex flex-col items-center">
              {getStatusIcon()}
              <CardTitle className="text-2xl font-bold text-foreground">
                {status === 'loading' && 'Unsubscribing...'}
                {status === 'success' && 'Unsubscribed Successfully'}
                {status === 'error' && 'Unsubscribe Failed'}
                {status === 'invalid' && 'Invalid Link'}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {email && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{email}</span>
              </div>
            )}

            <CardDescription className="text-center">
              {message}
            </CardDescription>

            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  You will no longer receive newsletter emails from us. If you change your mind, 
                  you can always subscribe again from our website.
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  If this problem persists, please contact our support team for assistance.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              {status === 'error' && (
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                  variant="default"
                >
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/')}
                variant={status === 'error' ? 'outline' : 'default'}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              If you have any questions, please contact us at{' '}
              <a href="mailto:support@tirestore.com" className="text-primary hover:underline">
                support@tirestore.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unsubscribe;

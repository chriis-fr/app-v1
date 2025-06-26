import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Mail, Shield, Lock, Users, Database, BarChart, Settings, Globe, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

function getEmailFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('email');
}

export default function ActivatePage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { setUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlToken = getTokenFromUrl();
    const urlEmail = getEmailFromUrl();
    setToken(urlToken);
    setEmail(urlEmail);
  }, []);

  const showActivationForm = token && email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Invalid activation link. Please check your email for the correct link.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/users/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, email })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Activation failed');
      }
      
      const data = await response.json();
      
      // Store the token in localStorage for the auth context
      localStorage.setItem('token', data.token);
      
      // Update auth context with the user data
      setUser({
        ...data.user,
        isOwner: data.user.role === 'owner',
        organization: data.user.organization,
        moduleAccess: data.user.moduleAccess || [],
        permissions: data.user.permissions || []
      });
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => setLocation('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  // If no token, show message to check email
  if (!showActivationForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 text-blue-200/30">
            <Database size={60} />
          </div>
          <div className="absolute top-40 right-20 text-indigo-200/30">
            <BarChart size={50} />
          </div>
          <div className="absolute bottom-40 left-20 text-purple-200/30">
            <Users size={70} />
          </div>
          <div className="absolute bottom-20 right-10 text-blue-200/30">
            <Settings size={40} />
          </div>
          <div className="absolute top-1/2 left-1/4 text-indigo-200/20">
            <Globe size={80} />
          </div>
          <div className="absolute top-1/3 right-1/3 text-purple-200/20">
            <Zap size={45} />
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <img src="https://chains-erp.com/chainsnobg.png" 
                    alt="Chains ERP Logo" 
                    className='border rounded-2xl'
                   />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Chains ERP&trade;
                </h1>
                <p className="text-gray-600 text-sm">Enterprise Resource Planning</p>
              </div>

              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Check Your Email</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We've sent you an activation link. Please check your email and click the link to activate your account and unlock the full power of Chains ERP.
              </p>
              
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertTitle className="text-blue-800">Activation Required</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Your account needs to be activated before you can access the platform. Please check your email for the activation link.
                </AlertDescription>
              </Alert>
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/auth')}
                className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-blue-200/30">
          <Database size={60} />
        </div>
        <div className="absolute top-40 right-20 text-indigo-200/30">
          <BarChart size={50} />
        </div>
        <div className="absolute bottom-40 left-20 text-purple-200/30">
          <Users size={70} />
        </div>
        <div className="absolute bottom-20 right-10 text-blue-200/30">
          <Settings size={40} />
        </div>
        <div className="absolute top-1/2 left-1/4 text-indigo-200/20">
          <Globe size={80} />
        </div>
        <div className="absolute top-1/3 right-1/3 text-purple-200/20">
          <Zap size={45} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <img
                src="https://chains-erp.com/chainsnobg.png"
                alt="Chains ERP Logo"
                className="w-full h-full object-contain border rounded-2xl"
               />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Chains ERP&trade;
            </h1>
            <p className="text-gray-600 text-sm">Empowering Businesses, driving growth</p>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Activate Your Account</h2>
          
          {success ? (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 inline" />
              <AlertTitle className="text-green-800">Account Activated!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your account is now active. Welcome to Chains ERP! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <XCircle className="h-5 w-5 text-red-600 mr-2 inline" />
                  <AlertTitle className="text-red-800">Activation Error</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Enter a strong password"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Re-enter your password"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                    Activating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 inline" />
                    Activate Account
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <Lock className="h-4 w-4 inline mr-1" />
                Your account will be secured with industry-standard encryption
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
} 
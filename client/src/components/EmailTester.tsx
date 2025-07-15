import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailTester() {
  const [email, setEmail] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/test-email-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
        toast({
          title: '✅ Email Service Ready',
          description: 'Email service is configured and working correctly.',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: '❌ Email Service Error',
          description: 'Email service is not configured properly.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: '❌ Connection Failed',
        description: 'Failed to test email service connection.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: '❌ Email Required',
        description: 'Please enter an email address to send a test email.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Test Email Sent',
          description: `Test email sent successfully to ${email}`,
        });
      } else {
        toast({
          title: '❌ Email Send Failed',
          description: data.error || 'Failed to send test email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Request Failed',
        description: 'Failed to send test email request.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Email Service Tester</h3>
      </div>
      
      <div className="space-y-4">
        {/* Connection Test */}
        <div>
          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            variant="outline"
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                {connectionStatus === 'success' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                {connectionStatus === 'error' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                Test Email Connection
              </>
            )}
          </Button>
        </div>

        {/* Test Email */}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter email to send test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button 
            onClick={sendTestEmail} 
            disabled={isSendingTest || !email}
            className="w-full"
          >
            {isSendingTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        {/* Status Display */}
        {connectionStatus !== 'idle' && (
          <div className={`p-3 rounded-md text-sm ${
            connectionStatus === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {connectionStatus === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Email service is ready
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Email service needs configuration
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 
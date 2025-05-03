import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Credential {
  id: string;
  type: 'education' | 'certification' | 'experience';
  title: string;
  issuer: string;
  date: string;
  blockchainHash?: string;
  verified: boolean;
}

interface CredentialVerificationProps {
  credentials: Credential[];
  onVerify: (credentialId: string) => Promise<void>;
}

export function CredentialVerification({ credentials, onVerify }: CredentialVerificationProps) {
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleVerify = async (credentialId: string) => {
    setVerifying(credentialId);
    try {
      await onVerify(credentialId);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Blockchain-Verified Credentials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {credentials.map((credential) => (
            <div key={credential.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{credential.title}</div>
                <div className="text-sm text-muted-foreground">
                  {credential.issuer} • {credential.date}
                </div>
                {credential.blockchainHash && (
                  <div className="text-xs text-muted-foreground">
                    Hash: {credential.blockchainHash.slice(0, 8)}...{credential.blockchainHash.slice(-8)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {credential.verified ? (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(credential.id)}
                    disabled={verifying === credential.id}
                  >
                    {verifying === credential.id ? 'Verifying...' : 'Verify on Blockchain'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
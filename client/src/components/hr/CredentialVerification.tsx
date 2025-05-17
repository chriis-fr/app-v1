import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'education':
        return '🎓';
      case 'certification':
        return '📜';
      case 'experience':
        return '💼';
      default:
        return '📄';
    }
  };

  const getCredentialColor = (type: string) => {
    switch (type) {
      case 'education':
        return 'bg-blue-100 text-blue-700';
      case 'certification':
        return 'bg-purple-100 text-purple-700';
      case 'experience':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {credentials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No credentials found for this employee
        </div>
      ) : (
        credentials.map((credential) => (
          <Card key={credential.id} className="overflow-hidden">
            <div className={`h-1 ${getCredentialColor(credential.type)}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getCredentialColor(credential.type)}`}>
                    <span className="text-2xl">{getCredentialIcon(credential.type)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{credential.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {credential.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {credential.issuer} • {credential.date}
                    </p>
                    {credential.blockchainHash && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          Hash: {credential.blockchainHash.slice(0, 8)}...{credential.blockchainHash.slice(-8)}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View on blockchain explorer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {credential.verified ? (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </Badge>
                  ) : verifying === credential.id ? (
                    <div className="flex items-center space-x-2">
                      <Progress value={33} className="w-24" />
                      <span className="text-sm text-muted-foreground">Verifying...</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(credential.id)}
                      disabled={verifying === credential.id}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Verify on Blockchain
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 
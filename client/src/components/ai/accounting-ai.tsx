import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/use-modules';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const recentPredictions = [
  {
    id: 1,
    type: 'Transaction',
    description: 'Suggested categorization for invoice #1234',
    confidence: 98,
    status: 'accepted'
  },
  {
    id: 2,
    type: 'Anomaly',
    description: 'Unusual expense pattern detected',
    confidence: 92,
    status: 'pending'
  },
  {
    id: 3,
    type: 'Forecast',
    description: 'Cash flow prediction for Q2',
    confidence: 85,
    status: 'pending'
  }
];

export function AccountingAI() {
  const { loading, error, fetchAIFeatures, syncModule } = useModules();
  const [features, setFeatures] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const data = await fetchAIFeatures();
        setFeatures(data);
      } catch (err) {
        console.error('Failed to load AI features:', err);
      }
    };

    loadFeatures();
  }, []);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await syncModule('ai');
    } catch (err) {
      console.error('Failed to process data:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Accounting Assistant</CardTitle>
          <CardDescription>
            AI-powered features for smarter accounting operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features" className="space-y-4">
            <TabsList>
              <TabsTrigger value="features">AI Features</TabsTrigger>
              <TabsTrigger value="predictions">Recent Predictions</TabsTrigger>
              <TabsTrigger value="training">Model Training</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <Card key={feature.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        <CardTitle>{feature.name}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Accuracy</span>
                          <span className="text-sm font-medium">{feature.accuracy}%</span>
                        </div>
                        <Progress value={feature.accuracy} />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className={`text-sm ${
                            feature.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                          }`}>
                            {feature.status === 'active' ? 'Active' : 'Training'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <div className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <Card key={prediction.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle>{prediction.type}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {prediction.status === 'accepted' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      <CardDescription>{prediction.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Confidence</span>
                          <div className="text-sm font-medium">{prediction.confidence}%</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Training</CardTitle>
                  <CardDescription>
                    Train and improve AI models with new data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Process New Data'
                        )}
                      </Button>
                      <Button variant="outline">
                        View Training History
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Training</span>
                        <span className="text-sm">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Next Scheduled</span>
                        <span className="text-sm">In 22 hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/use-modules';
import { 
  Database, 
  FileText, 
  BarChart2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const reports = [
  {
    id: 1,
    name: 'Financial Overview',
    type: 'Dashboard',
    lastUpdated: '2024-03-15 14:30:00',
    size: '2.5 MB'
  },
  {
    id: 2,
    name: 'Transaction Analysis',
    type: 'Report',
    lastUpdated: '2024-03-15 14:25:00',
    size: '1.8 MB'
  },
  {
    id: 3,
    name: 'Performance Metrics',
    type: 'Analytics',
    lastUpdated: '2024-03-15 14:20:00',
    size: '3.2 MB'
  }
];

export function DataWarehouse() {
  const { loading, error, fetchDataSources, fetchAnalytics, syncModule } = useModules();
  const [sources, setSources] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sourcesData, analyticsData] = await Promise.all([
          fetchDataSources(),
          fetchAnalytics()
        ]);
        setSources(sourcesData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncModule('bi');
    } catch (err) {
      console.error('Failed to sync data:', err);
    } finally {
      setIsSyncing(false);
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
          <CardTitle>Data Warehouse & BI</CardTitle>
          <CardDescription>
            Manage data sources and generate reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="space-y-4">
                {sources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          <CardTitle>{source.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {source.status === 'connected' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      <CardDescription>{source.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <div className="text-sm">{source.lastSync}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Size</span>
                          <div className="text-sm">{source.size}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSync}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            'Sync Now'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle>{report.name}</CardTitle>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                      <CardDescription>Type: {report.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Last Updated</span>
                          <div className="text-sm">{report.lastUpdated}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Size</span>
                          <div className="text-sm">{report.size}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Real-time insights and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5" />
                            <CardTitle>Data Processing</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-medium">{analytics?.dataProcessing}%</span>
                            </div>
                            <Progress value={analytics?.dataProcessing} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <CardTitle>Report Generation</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-medium">{analytics?.reportGeneration}%</span>
                            </div>
                            <Progress value={analytics?.reportGeneration} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            <CardTitle>Data Quality</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Score</span>
                              <span className="text-sm font-medium">{analytics?.dataQuality}%</span>
                            </div>
                            <Progress value={analytics?.dataQuality} />
                          </div>
                        </CardContent>
                      </Card>
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
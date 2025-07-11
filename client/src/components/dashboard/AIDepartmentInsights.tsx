import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  MessageCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { AIChatBox } from '@/components/ai/AIChatBox';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  department: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  chatContext?: string;
  metrics?: {
    current?: number;
    target?: number;
    change?: number;
    unit?: string;
  };
  timestamp: Date;
  expiresAt?: Date;
}

export interface DepartmentInsights {
  department: string;
  insights: AIInsight[];
  lastUpdated: Date;
  nextUpdate: Date;
}

interface AIDepartmentInsightsProps {
  department?: string;
  showAllDepartments?: boolean;
  className?: string;
}

export function AIDepartmentInsights({ 
  department, 
  showAllDepartments = false,
  className = ''
}: AIDepartmentInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<DepartmentInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Check if AI is enabled for the organization
  const isAIEnabled = user?.organization?.settings?.ai?.isEnabled ?? false;

  useEffect(() => {
    if (!isAIEnabled || !user?.organizationId) return;
    
    fetchInsights();
  }, [department, showAllDepartments, user?.organizationId, isAIEnabled]);

  const fetchInsights = async (forceRefresh = false) => {
    if (!user?.organizationId) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching insights:', { department, showAllDepartments, forceRefresh });
      
      let response;
      if (department && !showAllDepartments) {
        console.log('📡 Fetching department-specific insights');
        response = await api.get(`/ai/insights/${department}?forceRefresh=${forceRefresh}`);
        console.log('✅ Department insights response:', response);
        setInsights(response ? [response] : []);
      } else {
        console.log('📡 Fetching all insights');
        response = await api.get(`/ai/insights?forceRefresh=${forceRefresh}`);
        console.log('✅ All insights response:', response);
        setInsights(response || []);
      }
    } catch (error) {
      console.error('❌ Error fetching AI insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights(true);
    setRefreshing(false);
  };

  const handleInsightClick = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsChatOpen(true);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Don't render if AI is disabled
  if (!isAIEnabled) {
    return null;
  }

  // Don't render if still loading or insights is undefined
  if (loading || insights === undefined) {
    return (
      <Card className={`border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-600">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">
                {department ? `${department} AI Insights` : 'AI Insights'}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="ml-1">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    console.log('🧪 Testing AI service...');
                    const response = await api.get('/ai/test-ai-service');
                    console.log('✅ AI service test response:', response);
                    alert('AI service is working! Check console for details.');
                  } catch (error) {
                    console.error('❌ AI service test failed:', error);
                    alert('AI service test failed. Check console for details.');
                  }
                }}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1">Test AI</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    console.log('🧪 Testing direct fetch...');
                    const response = await fetch('/api/ai/test-ai-service', {
                      credentials: 'include'
                    });
                    const data = await response.json();
                    console.log('✅ Direct fetch response:', data);
                    alert('Direct fetch working! Check console for details.');
                  } catch (error) {
                    console.error('❌ Direct fetch failed:', error);
                    alert('Direct fetch failed. Check console for details.');
                  }
                }}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1">Test Fetch</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!insights || insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No insights available at the moment.</p>
              <p className="text-sm">Insights are generated every 4 hours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((deptInsights) => (
                <div key={deptInsights.department} className="space-y-3">
                  {showAllDepartments && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {deptInsights.department}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          Updated {new Date(deptInsights.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-3">
                    {(deptInsights.insights || []).map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getTypeColor(insight.type)}`}
                        onClick={() => handleInsightClick(insight)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(insight.priority)}`}
                                >
                                  {insight.priority}
                                </Badge>
                                {insight.actionable && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    Actionable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                              
                              {insight.metrics && (
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  {insight.metrics.current && (
                                    <span>Current: {insight.metrics.current}{insight.metrics.unit}</span>
                                  )}
                                  {insight.metrics.target && (
                                    <span>Target: {insight.metrics.target}{insight.metrics.unit}</span>
                                  )}
                                  {insight.metrics.change && (
                                    <span className={insight.metrics.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                      {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Chat Box */}
      {isChatOpen && selectedInsight && (
        <AIChatBox
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedInsight(null);
          }}
          userRole={user?.role}
          organizationId={user?.organizationId}
          initialMessage={`I'd like to discuss this insight: "${selectedInsight.title}" for the ${selectedInsight.department} department. ${selectedInsight.chatContext || ''}`}
        />
      )}
    </>
  );
} 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Users, Clock, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AIChatBox } from './AIChatBox';
import { useAIChat } from '@/contexts/AIChatContext';

interface HRInsight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics?: {
    current?: number;
    target?: number;
    change?: number;
    unit?: string;
  };
}

interface HRInsightsData {
  department: string;
  insights: HRInsight[];
  lastUpdated: Date;
}

export function AIDepartmentInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<HRInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { isChatOpen, openChat, closeChat, initialMessage } = useAIChat();

  useEffect(() => {
    if (user?.organization?.id) {
      fetchHRInsights();
    }
  }, [user?.organization?.id]);

  const fetchHRInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/insights/hr`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights.slice(0, 3)); // Show only top 3 insights
        }
      }
    } catch (error) {
      console.error('Error fetching HR insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightClick = (insight: HRInsight) => {
    openChat(`Tell me more about: ${insight.title}`);
  };

  const handleAskAIAssistant = () => {
    openChat();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'error':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      default:
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.organization?.id) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-900">HR AI Insights</CardTitle>
                <p className="text-blue-700 text-sm">AI-powered recommendations for your HR operations</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHRInsights}
              disabled={loading}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-blue-600">Loading insights...</span>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getInsightColor(insight.type)}`}
                  onClick={() => handleInsightClick(insight)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Actionable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                        {insight.metrics && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No HR insights available</p>
              <p className="text-sm text-gray-500">AI will generate insights based on your HR data</p>
            </div>
          )}

          <div className="pt-4 border-t border-blue-200">
            <Button
              onClick={handleAskAIAssistant}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Ask HR AI Assistant
            </Button>
          </div>
        </CardContent>
      </Card>

      {isChatOpen && (
        <AIChatBox
          isOpen={isChatOpen}
          onClose={closeChat}
          userRole={user?.role}
          organizationId={user?.organization?.id}
          initialMessage={initialMessage || undefined}
        />
      )}
    </>
  );
} 
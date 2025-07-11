import { useState } from 'react';
import { AIComprehensiveSummary } from '@/components/ai/AIComprehensiveSummary';
import { AIChatBox } from '@/components/ai/AIChatBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  Brain, 
  Bell, 
  Calendar, 
  ShoppingCart, 
  Activity,
  MessageCircle,
  Settings,
  TrendingUp
} from 'lucide-react';

export default function AIComprehensiveTestPage() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string>('');

  const handleOpenChat = (context?: string) => {
    setChatContext(context || '');
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Comprehensive Test</h1>
              <p className="text-gray-600">Testing AI awareness of notifications, meetings, procurements, and organizational data</p>
            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Comprehensive Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Notifications</h3>
                </div>
                <p className="text-sm text-gray-600">
                  AI is aware of all notifications, their priority levels, read status, and department associations.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Meetings</h3>
                </div>
                <p className="text-sm text-gray-600">
                  AI tracks upcoming meetings, organizers, virtual/in-person status, and department scheduling.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Procurements</h3>
                </div>
                <p className="text-sm text-gray-600">
                  AI monitors procurement requests, approval status, budgets, and department spending.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  AI provides insights on employee data, department performance, and organizational trends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Controls */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Chat Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleOpenChat('Summarize all notifications and alerts')}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ask about Notifications
              </Button>

              <Button 
                onClick={() => handleOpenChat('Analyze upcoming meetings and scheduling conflicts')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ask about Meetings
              </Button>

              <Button 
                onClick={() => handleOpenChat('Review pending procurement requests and approval workflow')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ask about Procurements
              </Button>

              <Button 
                onClick={() => handleOpenChat('Analyze employee data and department performance')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Ask about Analytics
              </Button>

              <Button 
                onClick={() => handleOpenChat('Provide comprehensive organizational overview and insights')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Ask for Overview
              </Button>

              <Button 
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open AI Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Summary */}
        <AIComprehensiveSummary onOpenChat={handleOpenChat} />

        {/* Test Instructions */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-2">What to Test:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  <li>Ask the AI to summarize notifications and their priority levels</li>
                  <li>Request analysis of upcoming meetings and scheduling conflicts</li>
                  <li>Ask about pending procurement requests and approval status</li>
                  <li>Request insights on employee data and department performance</li>
                  <li>Ask for cross-department coordination recommendations</li>
                  <li>Request alerts and priority item summaries</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-green-900 mb-2">Expected AI Capabilities:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  <li>Real-time awareness of all organizational data</li>
                  <li>Context-aware responses based on user role and department</li>
                  <li>Ability to summarize and prioritize information</li>
                  <li>Cross-reference between different data types</li>
                  <li>Actionable recommendations based on current state</li>
                  <li>Department-specific insights and alerts</li>
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  AI Aware
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Real-time Data
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Context-aware
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  Actionable
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Box */}
      {isChatOpen && (
        <AIChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userRole={user?.role}
          organizationId={user?.organizationId}
          initialMessage={chatContext}
        />
      )}
    </div>
  );
} 
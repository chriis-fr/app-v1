import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  Tag, 
  TrendingUp, 
  BarChart2, 
  PieChart, 
  LineChart,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function CRMPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Determine which features to show based on user role
  const isAdmin = user?.role === 'admin';
  const isSales = user?.role === 'sales';
  const isMarketing = user?.role === 'marketing';

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/dashboard')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">CRM</h1>
                <p className="text-sm text-gray-500">Customer Relationship Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/dashboard/crm/info')}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              Module Info
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('leads')}
            >
              Leads
            </button>
            {isAdmin && (
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            )}
          </div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Contacts</p>
                    <p className="text-2xl font-semibold mt-1">1,250</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Leads</p>
                    <p className="text-2xl font-semibold mt-1">450</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <UserPlus className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-semibold mt-1">32%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Response Time</p>
                    <p className="text-2xl font-semibold mt-1">2.5h</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contacts Content */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Contacts</h2>
              <p className="text-gray-500 mb-4">Manage your contacts and customer information.</p>
              <Button onClick={() => console.log('View contacts')}>View Contacts</Button>
            </div>
          )}

          {/* Leads Content */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Leads</h2>
              <p className="text-gray-500 mb-4">Track and manage your sales leads.</p>
              <Button onClick={() => console.log('View leads')}>View Leads</Button>
            </div>
          )}

          {/* Settings Content */}
          {activeTab === 'settings' && isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">CRM Settings</h2>
              <p className="text-gray-500 mb-4">Configure your CRM settings and preferences.</p>
              <Button onClick={() => console.log('Open settings')}>Open Settings</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactSidebar from '@/components/layout/CompactSidebar';
import ViewSwitcher, { ViewType } from '@/components/view-switcher';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Building2,
  Wallet,
  BarChart,
  Shield,
  Receipt,
  Briefcase,
  Calendar,
  Factory,
  Truck,
  ShoppingCart,
  Users2,
  ClipboardList,
  FileBarChart,
  PieChart,
  FileCheck,
  FileWarning,
  Workflow,
  CheckCircle,
  ArrowLeft,
  Download,
  TrendingUp,
  Settings2,
  BookOpen,
  BarChart2,
  LineChart,
  Table2,
  FileSpreadsheet,
  FileText,
  FileJson
} from 'lucide-react';
import POSInfoPage from './modules/pos-info';
import HRInfoPage from './modules/hr-info';
import InventoryInfoPage from './modules/inventory-info';
import CRMInfoPage from './modules/crm-info';
import AccountingInfoPage from './modules/accounting-info';
import { useState } from 'react';

// Dummy data for analytics
const analyticsData = {
  pos: {
    dailySales: [
      { date: '2024-03-01', amount: 12500 },
      { date: '2024-03-02', amount: 14200 },
      { date: '2024-03-03', amount: 13800 },
      { date: '2024-03-04', amount: 15600 },
      { date: '2024-03-05', amount: 16800 },
      { date: '2024-03-06', amount: 14500 },
      { date: '2024-03-07', amount: 17200 }
    ],
    topProducts: [
      { name: 'Product A', sales: 245, revenue: 12250 },
      { name: 'Product B', sales: 189, revenue: 9450 },
      { name: 'Product C', sales: 156, revenue: 7800 },
      { name: 'Product D', sales: 134, revenue: 6700 },
      { name: 'Product E', sales: 98, revenue: 4900 }
    ],
    paymentMethods: [
      { method: 'Credit Card', percentage: 45 },
      { method: 'Cash', percentage: 25 },
      { method: 'Mobile Payment', percentage: 20 },
      { method: 'Bank Transfer', percentage: 10 }
    ],
    customerMetrics: {
      totalCustomers: 1250,
      newCustomers: 45,
      returningCustomers: 380,
      averageOrderValue: 125.50
    }
  },
  hr: {
    employeeStats: {
      totalEmployees: 150,
      activeEmployees: 145,
      onLeave: 5,
      newHires: 8,
      turnoverRate: 2.5
    },
    departmentDistribution: [
      { department: 'Sales', count: 45 },
      { department: 'Engineering', count: 35 },
      { department: 'Marketing', count: 25 },
      { department: 'Operations', count: 30 },
      { department: 'Finance', count: 15 }
    ],
    attendance: {
      present: 142,
      absent: 3,
      late: 5,
      earlyLeave: 2
    },
    performance: {
      excellent: 35,
      good: 75,
      satisfactory: 25,
      needsImprovement: 10
    }
  },
  inventory: {
    stockLevels: {
      totalItems: 1250,
      lowStock: 45,
      outOfStock: 12,
      overstocked: 8
    },
    categoryDistribution: [
      { category: 'Electronics', count: 450 },
      { category: 'Clothing', count: 350 },
      { category: 'Food', count: 250 },
      { category: 'Furniture', count: 200 }
    ],
    turnoverRate: {
      current: 4.2,
      previous: 3.8,
      target: 4.5
    },
    valueMetrics: {
      totalValue: 125000,
      averageCost: 100,
      holdingCost: 12500
    }
  },
  crm: {
    contactStats: {
      totalContacts: 1250,
      activeLeads: 450,
      customers: 380,
      prospects: 420
    },
    leadSources: [
      { source: 'Email', count: 350 },
      { source: 'Website', count: 250 },
      { source: 'Referral', count: 180 },
      { source: 'Social', count: 120 },
      { source: 'Other', count: 80 }
    ],
    conversionRates: {
      leadToCustomer: 32,
      prospectToLead: 45,
      leadToProposal: 28
    },
    responseMetrics: {
      averageResponseTime: 2.5,
      firstContactResolution: 78,
      customerSatisfaction: 92
    }
  }
};

// Map of module IDs to their info page components
const moduleInfoPages: Record<string, React.ComponentType> = {
  pos: POSInfoPage,
  hr: HRInfoPage,
  inventory: InventoryInfoPage,
  crm: CRMInfoPage,
  accounting: AccountingInfoPage
};

export default function ModuleInfoPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<ViewType>('admin');
  
  // Extract module ID from URL - fix the extraction logic
  const pathParts = location.split('/');
  const moduleId = pathParts[pathParts.length - 2]; // Get the second-to-last part of the URL
  
  // Get the specific module info page component
  const ModuleInfoComponent = moduleInfoPages[moduleId as keyof typeof moduleInfoPages];
  
  if (!ModuleInfoComponent) {
    return (
      <div className="flex min-h-screen">
        <CompactSidebar />
        <div className="flex-1 p-8 ml-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Module Not Found</h1>
            <p className="text-gray-600 mb-4">The requested module could not be found.</p>
            <Button onClick={() => setLocation('/dashboard/modules')}>Return to Modules</Button>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">
                  {moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} Module
                </h1>
                <p className="text-sm text-gray-500">Module Information and Analytics</p>
              </div>
            </div>
            <ViewSwitcher
              moduleId={moduleId}
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
          <ModuleInfoComponent />
        </div>
      </div>
    </div>
  );
} 
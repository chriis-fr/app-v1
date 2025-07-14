import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  ShoppingCart, 
  FileText, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Package,
  Shield,
  Bell,
  AlertCircle,
  CheckCircle2,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import ProcurementAnalytics from './ProcurementAnalytics';
import ProcurementPolicyManager from './ProcurementPolicyManager';
import ProcurementCommitteeManager from './ProcurementCommitteeManager';
import ProcurementNotifications from './ProcurementNotifications';
import ProcurementAuditTrail from './ProcurementAuditTrail';
import RFPManager from './RFPManager';
import ContractManager from './ContractManager';
import GRNManager from './GRNManager';
import VendorPerformanceManager from './VendorPerformanceManager';
import { useToast } from '@/components/ui/use-toast';

interface ProcurementRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedAmount?: number;
  estimatedCost?: number;
  priority: string;
  status: string;
  department: string;
  justification: string;
  createdAt: string;
  requestor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  comments: ProcurementComment[];
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  orderDate: string;
  expectedDelivery?: string;
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  category?: string;
  rating?: number;
  status: string;
  paymentTerms?: string;
}

interface ExpenseRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  department: string;
  justification: string;
  createdAt: string;
  requestor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ProcurementComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
  department?: string;
  category?: string;
  spentAmount: number;
  remainingAmount: number;
  status: string;
}

export default function ProcurementMain() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const { toast } = useToast();

  // Role-based access control
  const canCreateRequest = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'hr_admin' || user?.isOwner;
  const canApproveRequest = user?.role === 'admin' || user?.role === 'executive' || user?.role === 'accounting' || user?.isOwner;
  const isHRUser = user?.role === 'hr' || user?.role === 'hr_admin';
  const canManagePolicies = user?.role === 'admin' || user?.isOwner;
  const canManageCommittee = user?.role === 'admin' || user?.isOwner;
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'executive' || user?.isOwner;

  // Form states
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    estimatedAmount: '',
    priority: 'Medium',
    department: '',
    justification: '',
    urgency: 'normal',
    expectedDeliveryDate: '',
    preferredSupplier: '',
    budgetCode: '',
    specialRequirements: '',
    impactOnOperations: '',
    alternativesConsidered: '',
    riskAssessment: ''
  });

  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    department: '',
    justification: '',
    expenseDate: '',
    currency: 'USD',
    receipts: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: '',
    paymentTerms: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    description: '',
    amount: '',
    period: 'Monthly',
    startDate: '',
    endDate: '',
    department: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, ordersRes, suppliersRes, expensesRes, budgetsRes] = await Promise.all([
        fetch('/api/procurement/requests', { credentials: 'include' }),
        fetch('/api/procurement/purchase-orders', { credentials: 'include' }),
        fetch('/api/procurement/suppliers', { credentials: 'include' }),
        fetch('/api/procurement/expenses', { credentials: 'include' }),
        fetch('/api/procurement/budgets', { credentials: 'include' })
      ]);

      console.log('Procurement API Responses:', {
        requests: requestsRes.status,
        orders: ordersRes.status,
        suppliers: suppliersRes.status,
        expenses: expensesRes.status,
        budgets: budgetsRes.status
      });

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        console.log('Procurement Main - Raw requests data:', requestsData);
        const processedRequests = requestsData.requests || requestsData;
        console.log('Procurement Main - Processed requests:', processedRequests);
        console.log('Procurement Main - Requests count:', processedRequests.length);
        setProcurementRequests(processedRequests);
      } else {
        console.error('Procurement Main - Requests response not ok:', requestsRes.status);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.log('Purchase Orders Data:', ordersData);
        setPurchaseOrders(ordersData.purchaseOrders || ordersData);
      }
      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        console.log('Suppliers Data:', suppliersData);
        setSuppliers(suppliersData);
      }
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        console.log('Expenses Data:', expensesData);
        setExpenseRequests(expensesData.expenses || expensesData);
      }
      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        console.log('Budgets Data:', budgetsData);
        setBudgets(budgetsData);
      }
    } catch (error) {
      console.error('Error fetching procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      // Convert department to departments array for backend compatibility
      const requestData = {
        ...newRequest,
        departments: [newRequest.department], // Send as array for multi-department support
        estimatedAmount: parseFloat(newRequest.estimatedAmount) || 0
      };
      const response = await fetch('/api/procurement/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        setShowCreateRequest(false);
        setNewRequest({
          title: '',
          description: '',
          category: '',
          estimatedAmount: '',
          priority: 'Medium',
          department: '',
          justification: '',
          urgency: 'normal',
          expectedDeliveryDate: '',
          preferredSupplier: '',
          budgetCode: '',
          specialRequirements: '',
          impactOnOperations: '',
          alternativesConsidered: '',
          riskAssessment: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating procurement request:', error);
    }
  };

  const handleCreateExpense = async () => {
    try {
      // Convert department to departments array for backend compatibility
      const expenseData = {
        ...newExpense,
        departments: [newExpense.department], // Send as array for multi-department support
        amount: parseFloat(newExpense.amount) || 0
      };
      const response = await fetch('/api/procurement/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(expenseData)
      });
      if (response.ok) {
        setShowCreateExpense(false);
        setNewExpense({
          title: '',
          description: '',
          amount: '',
          category: '',
          department: '',
          justification: '',
          expenseDate: '',
          currency: 'USD',
          receipts: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating expense request:', error);
    }
  };

  const handleCreateSupplier = async () => {
    try {
      const response = await fetch('/api/procurement/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSupplier)
      });
      if (response.ok) {
        setShowCreateSupplier(false);
        setNewSupplier({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          category: '',
          paymentTerms: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleCreateBudget = async () => {
    try {
      const response = await fetch('/api/procurement/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newBudget)
      });
      if (response.ok) {
        setShowCreateBudget(false);
        setNewBudget({
          name: '',
          description: '',
          amount: '',
          period: 'Monthly',
          startDate: '',
          endDate: '',
          department: '',
          category: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleApproveRequest = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/procurement/requests/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleApproveExpense = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/procurement/expenses/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      setPdfLoading(id);
      
      // Show loading state
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your procurement request PDF...',
      });

      const response = await fetch(`/api/procurement/requests/${id}/pdf`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `procurement-request-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show success message
        toast({
          title: 'PDF Downloaded',
          description: 'Procurement request PDF has been downloaded successfully.',
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to download PDF:', errorData);
        toast({
          title: 'Download Failed',
          description: errorData.error || 'Failed to generate PDF. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Error',
        description: 'An error occurred while downloading the PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPdfLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'Submitted': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'In Progress': { color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
      'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['Medium']}>
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Compliance Banner */}
        {complianceStatus && (
          <div className={`p-4 rounded-lg border ${
            complianceStatus.status === 'compliant' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {complianceStatus.status === 'compliant' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {complianceStatus.status === 'compliant' ? 'Compliance Status: Compliant' : 'Compliance Issues Detected'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {complianceStatus.message}
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div key={index} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-muted-foreground">{notification.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Procurement Management
            </h1>
            <p className="text-muted-foreground">
              Manage purchase requests, suppliers, and expense approvals with comprehensive tracking
            </p>
          </div>
          <div className="flex gap-2">
            {canCreateRequest && (
              <Button 
                onClick={() => setShowCreateRequest(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            )}
            {canCreateRequest && (
              <Button 
                variant="outline" 
                onClick={() => setShowCreateExpense(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Receipt className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Requests</CardTitle>
              <div className="bg-blue-600 text-white rounded-full p-2">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{procurementRequests.length}</div>
              <p className="text-xs text-blue-600 font-medium">
                ${procurementRequests.reduce((sum, r) => sum + (r.estimatedCost || r.estimatedAmount || 0), 0).toLocaleString()} total value
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Purchase Orders</CardTitle>
              <div className="bg-green-600 text-white rounded-full p-2">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{purchaseOrders.length}</div>
              <p className="text-xs text-green-600 font-medium">
                ${purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString()} total value
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Suppliers</CardTitle>
              <div className="bg-purple-600 text-white rounded-full p-2">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{suppliers.length}</div>
              <p className="text-xs text-purple-600 font-medium">
                {suppliers.filter(s => s.status === 'Active').length} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Total Expenses</CardTitle>
              <div className="bg-orange-600 text-white rounded-full p-2">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                ${expenseRequests.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-orange-600 font-medium">
                {expenseRequests.filter(e => e.status === 'approved').length} approved
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Requests ({procurementRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rfps" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              RFPs (0)
            </TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Contracts (0)
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Orders ({purchaseOrders.length})
            </TabsTrigger>
            <TabsTrigger value="grns" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              GRNs (0)
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Suppliers ({suppliers.length})
            </TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Vendors (0)
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Expenses ({expenseRequests.length})
            </TabsTrigger>
            <TabsTrigger value="budgets" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Budgets ({budgets.length})
            </TabsTrigger>
            {canManagePolicies && (
              <TabsTrigger value="policies" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                Policies
              </TabsTrigger>
            )}
            {canManageCommittee && (
              <TabsTrigger value="committee" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                Committee
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Audit
            </TabsTrigger>
            {canViewAnalytics && (
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                Analytics
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Procurement Requests</h2>
                <p className="text-sm text-gray-600">
                  {user?.role === 'accounting' ? 'Review and approve procurement requests for fund disbursement' : 'Manage and track all procurement requests'}
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateRequest(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            {/* Accounting Summary for Accounting Users */}
            {user?.role === 'accounting' && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fund Disbursement Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        ${procurementRequests
                          .filter(r => r.status === 'pending')
                          .reduce((sum, r) => sum + (r.estimatedCost || r.estimatedAmount || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-yellow-700 font-medium">Pending Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${procurementRequests
                          .filter(r => r.status === 'approved')
                          .reduce((sum, r) => sum + (r.estimatedCost || r.estimatedAmount || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700 font-medium">Approved Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ${procurementRequests
                          .filter(r => r.status === 'rejected')
                          .reduce((sum, r) => sum + (r.estimatedCost || r.estimatedAmount || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-red-700 font-medium">Rejected Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {procurementRequests.length}
                      </div>
                      <div className="text-sm text-blue-700 font-medium">Total Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {procurementRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-all duration-300 border-2 border-gray-100">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-gray-900">{request.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">Category:</span> 
                        <span className="text-gray-600">{request.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">Amount:</span> 
                        <span className="text-green-600 font-semibold">${(request.estimatedCost || request.estimatedAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">Department:</span> 
                        <span className="text-gray-600">{request.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">Requestor:</span> 
                        <span className="text-gray-600">{request.requestor?.firstName} {request.requestor?.lastName}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-800">Justification:</span>
                      <p className="text-sm text-blue-700 mt-1">{request.justification}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(request.id)}
                          disabled={pdfLoading === request.id}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          {pdfLoading === request.id ? (
                            <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <Download className="w-4 h-4 mr-1" />
                          )}
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rfps" className="space-y-4">
            <RFPManager />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <ContractManager />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Purchase Orders</h2>
            </div>

            <div className="grid gap-4">
              {purchaseOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">PO: {order.poNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {order.supplier.name}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Amount:</span> ${order.totalAmount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Currency:</span> {order.currency}
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {order.items.length}
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium">Items:</span>
                      <div className="mt-2 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.productName}</span>
                            <span>{item.quantity} x ${item.unitPrice} = ${item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grns" className="space-y-4">
            <GRNManager />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suppliers</h2>
              <Button onClick={() => setShowCreateSupplier(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Supplier
              </Button>
            </div>

            <div className="grid gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                      </div>
                      <Badge className={supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {supplier.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Contact:</span> {supplier.contactPerson || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {supplier.phone || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {supplier.category || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Payment Terms:</span> {supplier.paymentTerms || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span> {supplier.rating ? `${supplier.rating}/5` : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Expense Requests</h2>
              <Button onClick={() => setShowCreateExpense(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            </div>

            <div className="grid gap-4">
              {expenseRequests.map((expense) => (
                <Card key={expense.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{expense.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(expense.status)}
                        <Badge variant="outline">${expense.amount.toLocaleString()}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {expense.category}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {expense.department}
                      </div>
                      <div>
                        <span className="font-medium">Requestor:</span> {expense.requestor.firstName} {expense.requestor.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Currency:</span> {expense.currency}
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium">Justification:</span>
                      <p className="text-sm text-muted-foreground mt-1">{expense.justification}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(expense.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {expense.status === 'Submitted' && canApproveRequest && expense.requestor?.id !== user?.id && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveExpense(expense.id, 'Approved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveExpense(expense.id, 'Rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Budgets</h2>
              <Button onClick={() => setShowCreateBudget(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Budget
              </Button>
            </div>

            <div className="grid gap-4">
              {budgets.map((budget) => (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{budget.description}</p>
                      </div>
                      <Badge className={budget.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {budget.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span> ${budget.amount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Spent:</span> ${budget.spentAmount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Remaining:</span> ${budget.remainingAmount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Period:</span> {budget.period}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progress</span>
                        <span>{((budget.spentAmount / budget.amount) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(budget.spentAmount / budget.amount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <VendorPerformanceManager />
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <ProcurementPolicyManager />
          </TabsContent>

          <TabsContent value="committee" className="space-y-4">
            <ProcurementCommitteeManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <ProcurementNotifications />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <ProcurementAuditTrail />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <ProcurementAnalytics />
          </TabsContent>
        </Tabs>

        {/* Create Procurement Request Dialog */}
        <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Create Procurement Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Request Title *</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      placeholder="e.g., Office Equipment for Marketing Team"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select value={newRequest.department} onValueChange={(value) => setNewRequest({ ...newRequest, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Provide a detailed description of what is needed, specifications, quantities, etc."
                    rows={4}
                  />
                </div>
              </div>

              {/* Category and Cost */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Category & Cost
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newRequest.category} onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                        <SelectItem value="Software Licenses">Software Licenses</SelectItem>
                        <SelectItem value="Training Materials">Training Materials</SelectItem>
                        <SelectItem value="Travel & Accommodation">Travel & Accommodation</SelectItem>
                        <SelectItem value="Marketing Materials">Marketing Materials</SelectItem>
                        <SelectItem value="IT Infrastructure">IT Infrastructure</SelectItem>
                        <SelectItem value="Professional Services">Professional Services</SelectItem>
                        <SelectItem value="Facilities & Maintenance">Facilities & Maintenance</SelectItem>
                        <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedAmount">Estimated Amount *</Label>
                    <Input
                      id="estimatedAmount"
                      type="number"
                      value={newRequest.estimatedAmount}
                      onChange={(e) => setNewRequest({ ...newRequest, estimatedAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Priority and Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority & Timeline
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency *</Label>
                    <Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedDeliveryDate">Expected Delivery</Label>
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      value={newRequest.expectedDeliveryDate}
                      onChange={(e) => setNewRequest({ ...newRequest, expectedDeliveryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Justification and Impact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Justification & Impact
                </h3>
                <div>
                  <Label htmlFor="justification">Business Justification *</Label>
                  <Textarea
                    id="justification"
                    value={newRequest.justification}
                    onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                    placeholder="Explain why this procurement is necessary, the business need, and expected benefits..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="impactOnOperations">Impact on Operations</Label>
                  <Textarea
                    id="impactOnOperations"
                    value={newRequest.impactOnOperations}
                    onChange={(e) => setNewRequest({ ...newRequest, impactOnOperations: e.target.value })}
                    placeholder="Describe how this procurement will impact daily operations, productivity, or efficiency..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredSupplier">Preferred Supplier (Optional)</Label>
                    <Input
                      id="preferredSupplier"
                      value={newRequest.preferredSupplier}
                      onChange={(e) => setNewRequest({ ...newRequest, preferredSupplier: e.target.value })}
                      placeholder="If you have a preferred supplier"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetCode">Budget Code (Optional)</Label>
                    <Input
                      id="budgetCode"
                      value={newRequest.budgetCode}
                      onChange={(e) => setNewRequest({ ...newRequest, budgetCode: e.target.value })}
                      placeholder="Budget code if applicable"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={newRequest.specialRequirements}
                    onChange={(e) => setNewRequest({ ...newRequest, specialRequirements: e.target.value })}
                    placeholder="Any special requirements, specifications, or conditions..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="alternativesConsidered">Alternatives Considered</Label>
                  <Textarea
                    id="alternativesConsidered"
                    value={newRequest.alternativesConsidered}
                    onChange={(e) => setNewRequest({ ...newRequest, alternativesConsidered: e.target.value })}
                    placeholder="What alternatives were considered and why this option was chosen..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="riskAssessment">Risk Assessment</Label>
                  <Textarea
                    id="riskAssessment"
                    value={newRequest.riskAssessment}
                    onChange={(e) => setNewRequest({ ...newRequest, riskAssessment: e.target.value })}
                    placeholder="Any potential risks or concerns with this procurement..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateRequest(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRequest}>
                  Create Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Expense Request Dialog */}
        <Dialog open={showCreateExpense} onOpenChange={setShowCreateExpense}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Create Expense Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense-title">Expense Title *</Label>
                    <Input
                      id="expense-title"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      placeholder="e.g., Business Travel to Conference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-department">Department *</Label>
                    <Select value={newExpense.department} onValueChange={(value) => setNewExpense({ ...newExpense, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="expense-description">Detailed Description *</Label>
                  <Textarea
                    id="expense-description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Provide a detailed description of the expense, including purpose, dates, and specific items..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Amount and Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount & Category
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense-amount">Amount *</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-category">Category *</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Meals & Entertainment">Meals & Entertainment</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Training & Development">Training & Development</SelectItem>
                        <SelectItem value="Equipment & Technology">Equipment & Technology</SelectItem>
                        <SelectItem value="Professional Services">Professional Services</SelectItem>
                        <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                        <SelectItem value="Facilities & Maintenance">Facilities & Maintenance</SelectItem>
                        <SelectItem value="Software & Subscriptions">Software & Subscriptions</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Justification and Business Impact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Justification & Business Impact
                </h3>
                <div>
                  <Label htmlFor="expense-justification">Business Justification *</Label>
                  <Textarea
                    id="expense-justification"
                    value={newExpense.justification}
                    onChange={(e) => setNewExpense({ ...newExpense, justification: e.target.value })}
                    placeholder="Explain why this expense is necessary, the business need, and expected benefits..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense-date">Expense Date</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={newExpense.expenseDate || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-currency">Currency</Label>
                    <Select value={newExpense.currency || 'USD'} onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="expense-receipts">Receipts/Attachments</Label>
                  <Textarea
                    id="expense-receipts"
                    value={newExpense.receipts || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, receipts: e.target.value })}
                    placeholder="List any receipts, invoices, or supporting documents..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateExpense(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense}>
                  Create Expense Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Supplier Dialog */}
        <Dialog open={showCreateSupplier} onOpenChange={setShowCreateSupplier}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="supplier-name">Name</Label>
                <Input
                  id="supplier-name"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier-contact">Contact Person</Label>
                  <Input
                    id="supplier-contact"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-email">Email</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier-phone">Phone</Label>
                  <Input
                    id="supplier-phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-category">Category</Label>
                  <Select value={newSupplier.category} onValueChange={(value) => setNewSupplier({ ...newSupplier, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="supplier-payment-terms">Payment Terms</Label>
                <Input
                  id="supplier-payment-terms"
                  value={newSupplier.paymentTerms}
                  onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateSupplier(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSupplier}>
                  Create Supplier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Budget Dialog */}
        <Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="budget-name">Name</Label>
                <Input
                  id="budget-name"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="budget-description">Description</Label>
                <Textarea
                  id="budget-description"
                  value={newBudget.description}
                  onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget-amount">Amount</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget-period">Period</Label>
                  <Select value={newBudget.period} onValueChange={(value) => setNewBudget({ ...newBudget, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget-start-date">Start Date</Label>
                  <Input
                    id="budget-start-date"
                    type="date"
                    value={newBudget.startDate}
                    onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget-end-date">End Date</Label>
                  <Input
                    id="budget-end-date"
                    type="date"
                    value={newBudget.endDate}
                    onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget-department">Department</Label>
                  <Input
                    id="budget-department"
                    value={newBudget.department}
                    onChange={(e) => setNewBudget({ ...newBudget, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget-category">Category</Label>
                  <Input
                    id="budget-category"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateBudget(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBudget}>
                  Create Budget
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 
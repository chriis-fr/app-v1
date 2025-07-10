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
import { api } from '@/lib/api';
import { axiosInstance } from '@/lib/api';
import ProcurementAnalytics from './ProcurementAnalytics';
import ProcurementPolicyManager from './ProcurementPolicyManager';
import ProcurementCommitteeManager from './ProcurementCommitteeManager';
import ProcurementNotifications from './ProcurementNotifications';
import ProcurementAuditTrail from './ProcurementAuditTrail';
import RFPManager from './RFPManager';
import ContractManager from './ContractManager';
import GRNManager from './GRNManager';
import VendorPerformanceManager from './VendorPerformanceManager';

interface ProcurementRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedAmount: number;
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
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);

  // Role-based access control
  const canCreateRequest = user?.role === 'admin' || user?.role === 'manager' || user?.isOwner;
  const canApproveRequest = user?.role === 'admin' || user?.isOwner;
  const canManagePolicies = user?.role === 'admin' || user?.isOwner;
  const canManageCommittee = user?.role === 'admin' || user?.isOwner;
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'manager' || user?.isOwner;

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
        api.get('/procurement/requests'),
        api.get('/procurement/purchase-orders'),
        api.get('/procurement/suppliers'),
        api.get('/procurement/expenses'),
        api.get('/procurement/budgets')
      ]);

      if (requestsRes.ok) setProcurementRequests(await requestsRes.json());
      if (ordersRes.ok) setPurchaseOrders(await ordersRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (expensesRes.ok) setExpenseRequests(await expensesRes.json());
      if (budgetsRes.ok) setBudgets(await budgetsRes.json());
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
      const response = await api.post('/procurement/requests', requestData);
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
      const response = await api.post('/procurement/expenses', expenseData);
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
      const response = await api.post('/procurement/suppliers', newSupplier);
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
      const response = await api.post('/procurement/budgets', newBudget);
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
      const response = await api.post(`/procurement/requests/${id}/approve`, { status });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleApproveExpense = async (id: string, status: string) => {
    try {
      const response = await api.post(`/procurement/expenses/${id}/approve`, { status });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/procurement/requests/${id}/pdf`, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `procurement-request-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
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
            <h1 className="text-3xl font-bold">Procurement</h1>
            <p className="text-muted-foreground">
              Manage purchase requests, suppliers, and expense approvals
            </p>
          </div>
          <div className="flex gap-2">
            {canCreateRequest && (
              <Button onClick={() => setShowCreateRequest(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            )}
            {canCreateRequest && (
              <Button variant="outline" onClick={() => setShowCreateExpense(true)}>
                <Receipt className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {procurementRequests.filter(r => r.status === 'Pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchaseOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                ${purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
              <p className="text-xs text-muted-foreground">
                {suppliers.filter(s => s.status === 'Active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${expenseRequests.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenseRequests.filter(e => e.status === 'Approved').length} approved
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-14">
            <TabsTrigger value="requests">Requests ({procurementRequests.length})</TabsTrigger>
            <TabsTrigger value="rfps">RFPs (0)</TabsTrigger>
            <TabsTrigger value="contracts">Contracts (0)</TabsTrigger>
            <TabsTrigger value="orders">Orders ({purchaseOrders.length})</TabsTrigger>
            <TabsTrigger value="grns">GRNs (0)</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
            <TabsTrigger value="vendors">Vendors (0)</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenseRequests.length})</TabsTrigger>
            <TabsTrigger value="budgets">Budgets ({budgets.length})</TabsTrigger>
            {canManagePolicies && <TabsTrigger value="policies">Policies</TabsTrigger>}
            {canManageCommittee && <TabsTrigger value="committee">Committee</TabsTrigger>}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            {canViewAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Procurement Requests</h2>
              <Button onClick={() => setShowCreateRequest(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="grid gap-4">
              {procurementRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {request.category}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ${request.estimatedAmount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {request.department}
                      </div>
                      <div>
                        <span className="font-medium">Requestor:</span> {request.requestor.firstName} {request.requestor.lastName}
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium">Justification:</span>
                      <p className="text-sm text-muted-foreground mt-1">{request.justification}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(request.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        {request.status === 'Submitted' && canApproveRequest && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveRequest(request.id, 'Approved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveRequest(request.id, 'Rejected')}
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
                        {expense.status === 'Submitted' && canApproveRequest && (
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
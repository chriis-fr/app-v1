import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  Gavel
} from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  procurementRequest?: {
    id: string;
    title: string;
  };
  purchaseOrder?: {
    id: string;
    poNumber: string;
  };
  contractType: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentTerms: string;
  sla?: any;
  penalties?: any;
  status: string;
  legalReviewBy?: {
    firstName: string;
    lastName: string;
  };
  legalReviewAt?: string;
  approver?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  attachments: string[];
  createdAt: string;
}

export default function ContractManager() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLegalReviewDialog, setShowLegalReviewDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    supplierId: '',
    procurementRequestId: '',
    purchaseOrderId: '',
    contractType: '',
    startDate: '',
    endDate: '',
    totalValue: '',
    currency: 'USD',
    paymentTerms: '',
    sla: '',
    penalties: ''
  });

  const [legalReviewForm, setLegalReviewForm] = useState({
    status: 'Under Review',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, suppliersRes, requestsRes, ordersRes] = await Promise.all([
        fetch('/api/procurement/contracts', { credentials: 'include' }),
        fetch('/api/procurement/suppliers', { credentials: 'include' }),
        fetch('/api/procurement/requests', { credentials: 'include' }),
        fetch('/api/procurement/purchase-orders', { credentials: 'include' })
      ]);

      if (contractsRes.ok) setContracts(await contractsRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (requestsRes.ok) setProcurementRequests(await requestsRes.json());
      if (ordersRes.ok) setPurchaseOrders(await ordersRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleCreateContract = async () => {
    try {
      const res = await fetch('/api/procurement/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...createForm,
          totalValue: parseFloat(createForm.totalValue),
          sla: createForm.sla ? JSON.parse(createForm.sla) : null,
          penalties: createForm.penalties ? JSON.parse(createForm.penalties) : null
        })
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setCreateForm({
          title: '',
          description: '',
          supplierId: '',
          procurementRequestId: '',
          purchaseOrderId: '',
          contractType: '',
          startDate: '',
          endDate: '',
          totalValue: '',
          currency: 'USD',
          paymentTerms: '',
          sla: '',
          penalties: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const handleLegalReview = async () => {
    if (!selectedContract) return;

    try {
      const res = await fetch(`/api/procurement/contracts/${selectedContract.id}/legal-review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(legalReviewForm)
      });

      if (res.ok) {
        setShowLegalReviewDialog(false);
        setLegalReviewForm({ status: 'Under Review', notes: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error reviewing contract:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Draft': 'outline',
      'Under Review': 'secondary',
      'Active': 'default',
      'Completed': 'default',
      'Terminated': 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getContractTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Service': 'default',
      'Goods': 'secondary',
      'Mixed': 'outline'
    };

    return (
      <Badge variant={variants[type] || 'outline'}>
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contract Management</h2>
          <p className="text-muted-foreground">Manage contracts, legal reviews, and approval workflows</p>
        </div>
        {user?.role === 'owner' || user?.role === 'admin' || user?.role === 'finance' ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={createForm.title}
                      onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Contract Title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contract Type</label>
                    <Select
                      value={createForm.contractType}
                      onValueChange={(value) => setCreateForm(f => ({ ...f, contractType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Goods">Goods</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Contract description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Supplier</label>
                    <Select
                      value={createForm.supplierId}
                      onValueChange={(value) => setCreateForm(f => ({ ...f, supplierId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <Select
                      value={createForm.currency}
                      onValueChange={(value) => setCreateForm(f => ({ ...f, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Total Value</label>
                    <Input
                      type="number"
                      value={createForm.totalValue}
                      onChange={(e) => setCreateForm(f => ({ ...f, totalValue: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm(f => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm(f => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input
                    value={createForm.paymentTerms}
                    onChange={(e) => setCreateForm(f => ({ ...f, paymentTerms: e.target.value }))}
                    placeholder="Net 30, Net 60, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">SLA (JSON)</label>
                    <Textarea
                      value={createForm.sla}
                      onChange={(e) => setCreateForm(f => ({ ...f, sla: e.target.value }))}
                      placeholder='{"responseTime": "24h", "uptime": "99.9%"}'
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Penalties (JSON)</label>
                    <Textarea
                      value={createForm.penalties}
                      onChange={(e) => setCreateForm(f => ({ ...f, penalties: e.target.value }))}
                      placeholder='{"lateDelivery": "5%", "qualityIssues": "10%"}'
                    />
                  </div>
                </div>
                <Button onClick={handleCreateContract} className="w-full">
                  Create Contract
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-6">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {contract.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contract.contractNumber} • {contract.supplier.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(contract.status)}
                  {getContractTypeBadge(contract.contractType)}
                  {(user?.role === 'owner' || user?.role === 'admin') && contract.status === 'Draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowLegalReviewDialog(true);
                      }}
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Legal Review
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{contract.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contract Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Value:</span> {contract.currency} {contract.totalValue.toLocaleString()}</p>
                      <p><span className="font-medium">Period:</span> {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Payment Terms:</span> {contract.paymentTerms}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Review Status</h4>
                    <div className="space-y-1 text-sm">
                      {contract.legalReviewBy && (
                        <p><span className="font-medium">Legal Review:</span> {contract.legalReviewBy.firstName} {contract.legalReviewBy.lastName}</p>
                      )}
                      {contract.approver && (
                        <p><span className="font-medium">Approved By:</span> {contract.approver.firstName} {contract.approver.lastName}</p>
                      )}
                      {contract.approvedAt && (
                        <p><span className="font-medium">Approved:</span> {new Date(contract.approvedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                {contract.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="flex gap-2">
                      {contract.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Document {index + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legal Review Dialog */}
      <Dialog open={showLegalReviewDialog} onOpenChange={setShowLegalReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legal Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Review Status</label>
              <Select
                value={legalReviewForm.status}
                onValueChange={(value) => setLegalReviewForm(f => ({ ...f, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                value={legalReviewForm.notes}
                onChange={(e) => setLegalReviewForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Legal review notes and recommendations"
              />
            </div>
            <Button onClick={handleLegalReview} className="w-full">
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
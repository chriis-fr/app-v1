import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
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
  Users,
  Shield,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';

interface ProcurementPolicy {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  status: string;
  effectiveDate: string;
  expiryDate?: string;
  approvalLevel: string;
  thresholdAmount: number;
  currency: string;
  department: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  complianceRate: number;
  lastReviewed: string;
  nextReview: string;
  attachments: PolicyAttachment[];
}

interface PolicyAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface PolicyCompliance {
  id: string;
  policyId: string;
  policyTitle: string;
  complianceRate: number;
  violations: number;
  lastAudit: string;
  nextAudit: string;
  status: string;
}

export default function ProcurementPolicyManager() {
  const [policies, setPolicies] = useState<ProcurementPolicy[]>([]);
  const [compliance, setCompliance] = useState<PolicyCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ProcurementPolicy | null>(null);
  const [activeTab, setActiveTab] = useState('policies');

  // Form states
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: '',
    approvalLevel: '',
    thresholdAmount: '',
    currency: 'USD',
    department: '',
    effectiveDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/procurement/policies');
      setPolicies(response.data.policies);
      setCompliance(response.data.compliance);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      await api.post('/procurement/policies', newPolicy);
      setShowCreatePolicy(false);
      setNewPolicy({
        title: '',
        description: '',
        category: '',
        approvalLevel: '',
        thresholdAmount: '',
        currency: 'USD',
        department: '',
        effectiveDate: '',
        expiryDate: ''
      });
      fetchPolicies();
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const handleEditPolicy = async () => {
    if (!selectedPolicy) return;
    try {
      await api.put(`/procurement/policies/${selectedPolicy.id}`, newPolicy);
      setShowEditPolicy(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await api.delete(`/procurement/policies/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'Pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Policy Management</h1>
          <p className="text-muted-foreground">
            Manage procurement policies, compliance, and approval workflows
          </p>
        </div>
        <Button onClick={() => setShowCreatePolicy(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(policy.status)}
                      <Badge variant="outline">v{policy.version}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {policy.category}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {policy.department}
                    </div>
                    <div>
                      <span className="font-medium">Threshold:</span> {policy.currency} {policy.thresholdAmount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Approval Level:</span> {policy.approvalLevel}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                      <span className="font-medium">Effective Date:</span> {new Date(policy.effectiveDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Reviewed:</span> {new Date(policy.lastReviewed).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Next Review:</span> {new Date(policy.nextReview).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Compliance Rate:</span> {policy.complianceRate}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">
                      Created by {policy.createdBy.firstName} {policy.createdBy.lastName}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setNewPolicy({
                            title: policy.title,
                            description: policy.description,
                            category: policy.category,
                            approvalLevel: policy.approvalLevel,
                            thresholdAmount: policy.thresholdAmount.toString(),
                            currency: policy.currency,
                            department: policy.department,
                            effectiveDate: policy.effectiveDate,
                            expiryDate: policy.expiryDate || ''
                          });
                          setShowEditPolicy(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePolicy(policy.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {compliance.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.policyTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">Compliance tracking</p>
                    </div>
                    {getComplianceStatus(item.complianceRate)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Compliance Rate:</span> {item.complianceRate}%
                    </div>
                    <div>
                      <span className="font-medium">Violations:</span> {item.violations}
                    </div>
                    <div>
                      <span className="font-medium">Last Audit:</span> {new Date(item.lastAudit).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Next Audit:</span> {new Date(item.nextAudit).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span>Compliance Progress</span>
                      <span>{item.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.complianceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Workflow management coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Policy Dialog */}
      <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Procurement Policy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="policy-title">Title</Label>
              <Input
                id="policy-title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-category">Category</Label>
                <Select value={newPolicy.category} onValueChange={(value) => setNewPolicy({ ...newPolicy, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Procurement">General Procurement</SelectItem>
                    <SelectItem value="IT Procurement">IT Procurement</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="policy-department">Department</Label>
                <Input
                  id="policy-department"
                  value={newPolicy.department}
                  onChange={(e) => setNewPolicy({ ...newPolicy, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-approval-level">Approval Level</Label>
                <Select value={newPolicy.approvalLevel} onValueChange={(value) => setNewPolicy({ ...newPolicy, approvalLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="VP">VP</SelectItem>
                    <SelectItem value="CFO">CFO</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="policy-threshold">Threshold Amount</Label>
                <Input
                  id="policy-threshold"
                  type="number"
                  value={newPolicy.thresholdAmount}
                  onChange={(e) => setNewPolicy({ ...newPolicy, thresholdAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-effective-date">Effective Date</Label>
                <Input
                  id="policy-effective-date"
                  type="date"
                  value={newPolicy.effectiveDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, effectiveDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="policy-expiry-date">Expiry Date (Optional)</Label>
                <Input
                  id="policy-expiry-date"
                  type="date"
                  value={newPolicy.expiryDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreatePolicy(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>
                Create Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={showEditPolicy} onOpenChange={setShowEditPolicy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Procurement Policy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="edit-policy-title">Title</Label>
              <Input
                id="edit-policy-title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-policy-description">Description</Label>
              <Textarea
                id="edit-policy-description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-policy-category">Category</Label>
                <Select value={newPolicy.category} onValueChange={(value) => setNewPolicy({ ...newPolicy, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Procurement">General Procurement</SelectItem>
                    <SelectItem value="IT Procurement">IT Procurement</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-policy-department">Department</Label>
                <Input
                  id="edit-policy-department"
                  value={newPolicy.department}
                  onChange={(e) => setNewPolicy({ ...newPolicy, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-policy-approval-level">Approval Level</Label>
                <Select value={newPolicy.approvalLevel} onValueChange={(value) => setNewPolicy({ ...newPolicy, approvalLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="VP">VP</SelectItem>
                    <SelectItem value="CFO">CFO</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-policy-threshold">Threshold Amount</Label>
                <Input
                  id="edit-policy-threshold"
                  type="number"
                  value={newPolicy.thresholdAmount}
                  onChange={(e) => setNewPolicy({ ...newPolicy, thresholdAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-policy-effective-date">Effective Date</Label>
                <Input
                  id="edit-policy-effective-date"
                  type="date"
                  value={newPolicy.effectiveDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, effectiveDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-policy-expiry-date">Expiry Date (Optional)</Label>
                <Input
                  id="edit-policy-expiry-date"
                  type="date"
                  value={newPolicy.expiryDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditPolicy(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPolicy}>
                Update Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
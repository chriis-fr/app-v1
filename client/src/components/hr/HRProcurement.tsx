import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Plus, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  ShoppingCart,
  ExternalLink,
  Building,
  FileText,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';

// Available departments from the system
const AVAILABLE_DEPARTMENTS = [
  'Executive',
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'IT',
  'Customer Support',
  'Product',
  'Design',
  'Other'
] as const;

// Procurement categories with descriptions
const PROCUREMENT_CATEGORIES = [
  { value: 'Office Supplies', label: 'Office Supplies', description: 'Paper, pens, notebooks, etc.' },
  { value: 'Office Equipment', label: 'Office Equipment', description: 'Computers, printers, furniture' },
  { value: 'Software Licenses', label: 'Software Licenses', description: 'Software subscriptions and licenses' },
  { value: 'Training Materials', label: 'Training Materials', description: 'Training courses and materials' },
  { value: 'Travel & Accommodation', label: 'Travel & Accommodation', description: 'Business travel expenses' },
  { value: 'Marketing Materials', label: 'Marketing Materials', description: 'Promotional materials and advertising' },
  { value: 'IT Infrastructure', label: 'IT Infrastructure', description: 'Servers, networking equipment' },
  { value: 'Professional Services', label: 'Professional Services', description: 'Consulting, legal, accounting' },
  { value: 'Facilities & Maintenance', label: 'Facilities & Maintenance', description: 'Building maintenance and repairs' },
  { value: 'Health & Safety', label: 'Health & Safety', description: 'Safety equipment and compliance' },
  { value: 'Other', label: 'Other', description: 'Miscellaneous items' }
] as const;

interface ProcurementRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimatedCost: number;
  currency: string;
  urgency: string;
  justification: string;
  department: string;
  createdAt: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  comments: ProcurementComment[];
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

interface HRProcurementProps {
  organizationId: string;
}

export default function HRProcurement({ organizationId }: HRProcurementProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Enhanced form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedCost: '',
    priority: 'medium',
    urgency: 'normal',
    justification: '',
    department: '',
    expectedDeliveryDate: '',
    preferredSupplier: '',
    budgetCode: '',
    attachments: [] as string[],
    specialRequirements: '',
    impactOnOperations: '',
    alternativesConsidered: '',
    riskAssessment: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/procurement/requests', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch procurement requests');
      }
      
      const data = await response.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      console.error('Error fetching procurement requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch procurement requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.department) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/procurement/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
          category: formData.category || 'Other',
          department: formData.department,
          requesterId: user?.id,
          organizationId: organizationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create procurement request');
      }

      const newRequest = await response.json();
      setRequests([newRequest, ...requests]);
      setShowCreateDialog(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        estimatedCost: '',
        priority: 'medium',
        urgency: 'normal',
        justification: '',
        department: '',
        expectedDeliveryDate: '',
        preferredSupplier: '',
        budgetCode: '',
        attachments: [],
        specialRequirements: '',
        impactOnOperations: '',
        alternativesConsidered: '',
        riskAssessment: ''
      });

      toast({
        title: 'Success',
        description: 'Procurement request created successfully. Department members will be notified.',
      });
    } catch (error) {
      console.error('Error creating procurement request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create procurement request',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      draft: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive'
    };

    return (
      <Badge variant={variants[priority] || 'outline'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">HR Procurement Requests</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage procurement requests for HR department needs
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/dashboard/procurement')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Procurement
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
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
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Office Supplies for HR Department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {dept}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROCUREMENT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{cat.label}</span>
                                <span className="text-xs text-muted-foreground">{cat.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedCost">Estimated Cost *</Label>
                      <Input
                        id="estimatedCost"
                        type="number"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Priority and Urgency */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority & Timeline
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgency">Urgency *</Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
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
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
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
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      placeholder="Explain why this procurement is necessary, the business need, and expected benefits..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="impactOnOperations">Impact on Operations</Label>
                    <Textarea
                      id="impactOnOperations"
                      value={formData.impactOnOperations}
                      onChange={(e) => setFormData({ ...formData, impactOnOperations: e.target.value })}
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
                        value={formData.preferredSupplier}
                        onChange={(e) => setFormData({ ...formData, preferredSupplier: e.target.value })}
                        placeholder="If you have a preferred supplier"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetCode">Budget Code (Optional)</Label>
                      <Input
                        id="budgetCode"
                        value={formData.budgetCode}
                        onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                        placeholder="Budget code if applicable"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialRequirements">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                      placeholder="Any special requirements, specifications, or conditions..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alternativesConsidered">Alternatives Considered</Label>
                    <Textarea
                      id="alternativesConsidered"
                      value={formData.alternativesConsidered}
                      onChange={(e) => setFormData({ ...formData, alternativesConsidered: e.target.value })}
                      placeholder="What alternatives were considered and why this option was chosen..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="riskAssessment">Risk Assessment</Label>
                    <Textarea
                      id="riskAssessment"
                      value={formData.riskAssessment}
                      onChange={(e) => setFormData({ ...formData, riskAssessment: e.target.value })}
                      placeholder="Any potential risks or concerns with this procurement..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest}>
                    Create Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No procurement requests</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first procurement request to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          Array.isArray(requests) && requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{request.requester.firstName} {request.requester.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{request.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{request.currency} {request.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {getPriorityBadge(request.priority)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {request.approvedByUser && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Approved by {request.approvedByUser.firstName} {request.approvedByUser.lastName}</span>
                      <span className="text-sm">
                        on {new Date(request.approvedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {request.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Rejected</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{request.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm">{selectedRequest.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedRequest.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{selectedRequest.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Cost</Label>
                  <p className="text-sm">{selectedRequest.currency} {selectedRequest.estimatedCost.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgency</Label>
                  <p className="text-sm">{selectedRequest.urgency}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Justification</Label>
                <p className="text-sm">{selectedRequest.justification}</p>
              </div>

              {selectedRequest.comments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
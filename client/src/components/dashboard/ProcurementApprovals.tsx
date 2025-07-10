import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

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

export default function ProcurementApprovals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState<ProcurementRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/procurement/requests', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch procurement requests');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug logging
      
      // Handle the response structure - data.requests is the array
      const requests = data.requests || data;
      
      // Ensure requests is an array
      if (!Array.isArray(requests)) {
        console.error('Expected array but got:', typeof requests, requests);
        setAllRequests([]);
        setPendingRequests([]);
        return;
      }
      
      // Set all requests
      setAllRequests(requests);
      // Filter for pending requests only
      setPendingRequests(requests.filter((req: ProcurementRequest) => req.status === 'pending'));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/procurement/requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: approvalAction === 'approve' ? 'approved' : 'rejected',
          comment: approvalComment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Remove the request from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setShowApprovalDialog(false);
      setApprovalComment('');
      setSelectedRequest(null);

      toast({
        title: 'Success',
        description: `Request ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
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

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      normal: 'outline',
      urgent: 'secondary',
      critical: 'destructive'
    };

    return (
      <Badge variant={variants[urgency] || 'outline'}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
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
          <h2 className="text-xl font-semibold">Procurement Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve pending procurement requests from all departments
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {allRequests.length} Total Requests
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {pendingRequests.length} Pending
          </Badge>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
              <p className="text-muted-foreground text-center">
                All procurement requests have been processed
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{request.requester?.firstName || 'Unknown'} {request.requester?.lastName || 'User'}</span>
                        <Badge variant="outline" className="ml-2">{request.requester?.department || 'Unknown'}</Badge>
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
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(request.priority)}
                      {getUrgencyBadge(request.urgency)}
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setApprovalAction('approve');
                        setShowApprovalDialog(true);
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setApprovalAction('reject');
                        setShowApprovalDialog(true);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
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
                  <Label className="text-sm font-medium">Estimated Cost</Label>
                  <p className="text-sm">{selectedRequest.currency} {selectedRequest.estimatedCost.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgency</Label>
                  <div className="mt-1">{getUrgencyBadge(selectedRequest.urgency)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Justification</Label>
                <p className="text-sm">{selectedRequest.justification}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Requester</Label>
                <p className="text-sm">
                  {selectedRequest.requester.firstName} {selectedRequest.requester.lastName} 
                  ({selectedRequest.requester.email}) - {selectedRequest.requester.department}
                </p>
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

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Request</Label>
                <p className="text-sm font-medium">{selectedRequest.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.currency} {selectedRequest.estimatedCost.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="comment" className="text-sm font-medium">
                  {approvalAction === 'approve' ? 'Approval' : 'Rejection'} Comment (Optional)
                </Label>
                <Textarea
                  id="comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={`Add a comment for ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                  onClick={handleApproval}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
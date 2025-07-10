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
  Star,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';

interface RFP {
  id: string;
  rfpNumber: string;
  title: string;
  description: string;
  requirements: string;
  evaluationCriteria: any;
  submissionDeadline: string;
  status: string;
  procurementRequest: {
    id: string;
    title: string;
  };
  responses: RFPResponse[];
  createdAt: string;
}

interface RFPResponse {
  id: string;
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  proposal: string;
  price: number;
  deliveryTime: number;
  technicalScore?: number;
  priceScore?: number;
  totalScore?: number;
  status: string;
  submittedAt: string;
  evaluatedAt?: string;
  evaluator?: {
    firstName: string;
    lastName: string;
  };
}

export default function RFPManager() {
  const { user } = useAuth();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<RFPResponse | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    requirements: '',
    evaluationCriteria: '',
    submissionDeadline: '',
    procurementRequestId: ''
  });

  const [responseForm, setResponseForm] = useState({
    supplierId: '',
    proposal: '',
    price: '',
    deliveryTime: ''
  });

  const [evaluationForm, setEvaluationForm] = useState({
    technicalScore: '',
    priceScore: '',
    totalScore: '',
    status: 'Under Review',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfpsRes, suppliersRes, requestsRes] = await Promise.all([
        fetch('/api/procurement/rfps', { credentials: 'include' }),
        fetch('/api/procurement/suppliers', { credentials: 'include' }),
        fetch('/api/procurement/requests', { credentials: 'include' })
      ]);

      if (rfpsRes.ok) setRfps(await rfpsRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (requestsRes.ok) setProcurementRequests(await requestsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleCreateRFP = async () => {
    try {
      const res = await fetch('/api/procurement/rfps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...createForm,
          evaluationCriteria: JSON.parse(createForm.evaluationCriteria || '{}')
        })
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setCreateForm({
          title: '',
          description: '',
          requirements: '',
          evaluationCriteria: '',
          submissionDeadline: '',
          procurementRequestId: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating RFP:', error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedRFP) return;

    try {
      const res = await fetch(`/api/procurement/rfps/${selectedRFP.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...responseForm,
          price: parseFloat(responseForm.price),
          deliveryTime: parseInt(responseForm.deliveryTime)
        })
      });

      if (res.ok) {
        setShowResponseDialog(false);
        setResponseForm({
          supplierId: '',
          proposal: '',
          price: '',
          deliveryTime: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const handleEvaluateResponse = async () => {
    if (!selectedResponse) return;

    try {
      const res = await fetch(`/api/procurement/rfp-responses/${selectedResponse.id}/evaluate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...evaluationForm,
          technicalScore: parseFloat(evaluationForm.technicalScore),
          priceScore: parseFloat(evaluationForm.priceScore),
          totalScore: parseFloat(evaluationForm.totalScore)
        })
      });

      if (res.ok) {
        setShowEvaluationDialog(false);
        setEvaluationForm({
          technicalScore: '',
          priceScore: '',
          totalScore: '',
          status: 'Under Review',
          notes: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error evaluating response:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Draft': 'outline',
      'Published': 'default',
      'Closed': 'secondary',
      'Evaluated': 'default'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getResponseStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Submitted': 'outline',
      'Under Review': 'secondary',
      'Shortlisted': 'default',
      'Selected': 'default',
      'Rejected': 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
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
          <h2 className="text-2xl font-bold">RFP Management</h2>
          <p className="text-muted-foreground">Request for Proposals - Source, evaluate, and select vendors</p>
        </div>
        {user?.role === 'owner' || user?.role === 'admin' || user?.role === 'finance' ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create RFP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New RFP</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="RFP Title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed description of requirements"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Requirements</label>
                  <Textarea
                    value={createForm.requirements}
                    onChange={(e) => setCreateForm(f => ({ ...f, requirements: e.target.value }))}
                    placeholder="Technical and business requirements"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Evaluation Criteria (JSON)</label>
                  <Textarea
                    value={createForm.evaluationCriteria}
                    onChange={(e) => setCreateForm(f => ({ ...f, evaluationCriteria: e.target.value }))}
                    placeholder='{"technical": 40, "price": 30, "delivery": 20, "experience": 10}'
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Submission Deadline</label>
                  <Input
                    type="datetime-local"
                    value={createForm.submissionDeadline}
                    onChange={(e) => setCreateForm(f => ({ ...f, submissionDeadline: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Procurement Request</label>
                  <Select
                    value={createForm.procurementRequestId}
                    onValueChange={(value) => setCreateForm(f => ({ ...f, procurementRequestId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select procurement request" />
                    </SelectTrigger>
                    <SelectContent>
                      {procurementRequests.map((req) => (
                        <SelectItem key={req.id} value={req.id}>
                          {req.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRFP} className="w-full">
                  Create RFP
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-6">
        {rfps.map((rfp) => (
          <Card key={rfp.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {rfp.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rfp.rfpNumber} • {rfp.procurementRequest.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(rfp.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRFP(rfp);
                      setShowResponseDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Response
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{rfp.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-sm text-muted-foreground">{rfp.requirements}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rfp.submissionDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Responses ({rfp.responses.length})</h4>
                  <div className="space-y-2">
                    {rfp.responses.map((response) => (
                      <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{response.supplier.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${response.price} • {response.deliveryTime} days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getResponseStatusBadge(response.status)}
                          {response.totalScore && (
                            <Badge variant="outline">
                              <Star className="h-3 w-3 mr-1" />
                              {response.totalScore}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedResponse(response);
                              setShowEvaluationDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Submission Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit RFP Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Supplier</label>
              <Select
                value={responseForm.supplierId}
                onValueChange={(value) => setResponseForm(f => ({ ...f, supplierId: value }))}
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
              <label className="text-sm font-medium">Proposal</label>
              <Textarea
                value={responseForm.proposal}
                onChange={(e) => setResponseForm(f => ({ ...f, proposal: e.target.value }))}
                placeholder="Detailed proposal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={responseForm.price}
                  onChange={(e) => setResponseForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Time (days)</label>
                <Input
                  type="number"
                  value={responseForm.deliveryTime}
                  onChange={(e) => setResponseForm(f => ({ ...f, deliveryTime: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>
            <Button onClick={handleSubmitResponse} className="w-full">
              Submit Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Technical Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationForm.technicalScore}
                  onChange={(e) => setEvaluationForm(f => ({ ...f, technicalScore: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationForm.priceScore}
                  onChange={(e) => setEvaluationForm(f => ({ ...f, priceScore: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationForm.totalScore}
                  onChange={(e) => setEvaluationForm(f => ({ ...f, totalScore: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={evaluationForm.status}
                onValueChange={(value) => setEvaluationForm(f => ({ ...f, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Selected">Selected</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={evaluationForm.notes}
                onChange={(e) => setEvaluationForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Evaluation notes"
              />
            </div>
            <Button onClick={handleEvaluateResponse} className="w-full">
              Evaluate Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
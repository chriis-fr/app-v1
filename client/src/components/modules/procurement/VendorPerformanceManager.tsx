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
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Calendar
} from 'lucide-react';

interface VendorPerformance {
  id: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    category?: string;
    rating?: number;
  };
  evaluationPeriod: string;
  evaluationDate: string;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  communicationScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  evaluator: {
    firstName: string;
    lastName: string;
  };
}

export default function VendorPerformanceManager() {
  const { user } = useAuth();
  const [performances, setPerformances] = useState<VendorPerformance[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<VendorPerformance | null>(null);

  const [createForm, setCreateForm] = useState({
    supplierId: '',
    evaluationPeriod: '',
    evaluationDate: '',
    qualityScore: '',
    deliveryScore: '',
    priceScore: '',
    communicationScore: '',
    overallScore: '',
    strengths: '',
    weaknesses: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [performancesRes, suppliersRes] = await Promise.all([
        fetch('/api/procurement/vendor-performances', { credentials: 'include' }),
        fetch('/api/procurement/suppliers', { credentials: 'include' })
      ]);

      if (performancesRes.ok) setPerformances(await performancesRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleCreatePerformance = async () => {
    try {
      const res = await fetch('/api/procurement/vendor-performances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...createForm,
          qualityScore: parseFloat(createForm.qualityScore),
          deliveryScore: parseFloat(createForm.deliveryScore),
          priceScore: parseFloat(createForm.priceScore),
          communicationScore: parseFloat(createForm.communicationScore),
          overallScore: parseFloat(createForm.overallScore),
          strengths: createForm.strengths.split(',').map(s => s.trim()),
          weaknesses: createForm.weaknesses.split(',').map(s => s.trim()),
          evaluationDate: createForm.evaluationDate || new Date().toISOString()
        })
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setCreateForm({
          supplierId: '',
          evaluationPeriod: '',
          evaluationDate: '',
          qualityScore: '',
          deliveryScore: '',
          priceScore: '',
          communicationScore: '',
          overallScore: '',
          strengths: '',
          weaknesses: '',
          recommendations: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating performance evaluation:', error);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return <Badge variant="default"><Star className="h-3 w-3 mr-1" />Excellent</Badge>;
    if (score >= 4.0) return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>;
    if (score >= 3.0) return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Average</Badge>;
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Poor</Badge>;
  };

  const getTrendIcon = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    if (currentScore > previousScore) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (currentScore < previousScore) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
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
          <h2 className="text-2xl font-bold">Vendor Performance Management</h2>
          <p className="text-muted-foreground">Evaluate vendor performance, track scores, and manage supplier relationships</p>
        </div>
        {user?.role === 'owner' || user?.role === 'admin' || user?.role === 'finance' ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Vendor Performance Evaluation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Evaluation Period</label>
                    <Select
                      value={createForm.evaluationPeriod}
                      onValueChange={(value) => setCreateForm(f => ({ ...f, evaluationPeriod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Evaluation Date</label>
                    <Input
                      type="date"
                      value={createForm.evaluationDate}
                      onChange={(e) => setCreateForm(f => ({ ...f, evaluationDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Quality Score (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={createForm.qualityScore}
                      onChange={(e) => setCreateForm(f => ({ ...f, qualityScore: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Score (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={createForm.deliveryScore}
                      onChange={(e) => setCreateForm(f => ({ ...f, deliveryScore: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price Score (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={createForm.priceScore}
                      onChange={(e) => setCreateForm(f => ({ ...f, priceScore: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Communication Score (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={createForm.communicationScore}
                      onChange={(e) => setCreateForm(f => ({ ...f, communicationScore: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Overall Score (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={createForm.overallScore}
                    onChange={(e) => setCreateForm(f => ({ ...f, overallScore: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Strengths (comma separated)</label>
                  <Input
                    value={createForm.strengths}
                    onChange={(e) => setCreateForm(f => ({ ...f, strengths: e.target.value }))}
                    placeholder="Timely delivery, quality products, good communication"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Weaknesses (comma separated)</label>
                  <Input
                    value={createForm.weaknesses}
                    onChange={(e) => setCreateForm(f => ({ ...f, weaknesses: e.target.value }))}
                    placeholder="High prices, slow response times"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Recommendations</label>
                  <Textarea
                    value={createForm.recommendations}
                    onChange={(e) => setCreateForm(f => ({ ...f, recommendations: e.target.value }))}
                    placeholder="Action items and improvement suggestions"
                  />
                </div>
                <Button onClick={handleCreatePerformance} className="w-full">
                  Create Evaluation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-6">
        {performances.map((performance) => (
          <Card key={performance.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {performance.supplier.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {performance.evaluationPeriod} Evaluation • {new Date(performance.evaluationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreBadge(performance.overallScore)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPerformance(performance);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{performance.qualityScore}</p>
                    <p className="text-xs text-muted-foreground">Quality</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{performance.deliveryScore}</p>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{performance.priceScore}</p>
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{performance.communicationScore}</p>
                    <p className="text-xs text-muted-foreground">Communication</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <div className="flex flex-wrap gap-1">
                      {performance.strengths.map((strength, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Weaknesses</h4>
                    <div className="flex flex-wrap gap-1">
                      {performance.weaknesses.map((weakness, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">{performance.recommendations}</p>
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Evaluated by: {performance.evaluator.firstName} {performance.evaluator.lastName}</span>
                  <span>{new Date(performance.evaluationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Performance Evaluation Details</DialogTitle>
          </DialogHeader>
          {selectedPerformance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Supplier Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedPerformance.supplier.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedPerformance.supplier.email}</p>
                    <p><span className="font-medium">Category:</span> {selectedPerformance.supplier.category || 'N/A'}</p>
                    <p><span className="font-medium">Current Rating:</span> {selectedPerformance.supplier.rating || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Evaluation Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Period:</span> {selectedPerformance.evaluationPeriod}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedPerformance.evaluationDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Evaluator:</span> {selectedPerformance.evaluator.firstName} {selectedPerformance.evaluator.lastName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Score Breakdown</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{selectedPerformance.qualityScore}</p>
                    <p className="text-sm font-medium">Quality Score</p>
                    <p className="text-xs text-muted-foreground">Product/Service Quality</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{selectedPerformance.deliveryScore}</p>
                    <p className="text-sm font-medium">Delivery Score</p>
                    <p className="text-xs text-muted-foreground">On-time Delivery</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{selectedPerformance.priceScore}</p>
                    <p className="text-sm font-medium">Price Score</p>
                    <p className="text-xs text-muted-foreground">Competitive Pricing</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{selectedPerformance.communicationScore}</p>
                    <p className="text-sm font-medium">Communication</p>
                    <p className="text-xs text-muted-foreground">Responsiveness</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Strengths</h4>
                  <div className="space-y-1">
                    {selectedPerformance.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Areas for Improvement</h4>
                  <div className="space-y-1">
                    {selectedPerformance.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <p className="text-sm text-muted-foreground">{selectedPerformance.recommendations}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
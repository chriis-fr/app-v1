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
  Package,
  AlertTriangle,
  CheckSquare,
  Square,
  Truck
} from 'lucide-react';

interface GRN {
  id: string;
  grnNumber: string;
  purchaseOrder: {
    id: string;
    poNumber: string;
    supplier: {
      id: string;
      name: string;
    };
    items: PurchaseOrderItem[];
  };
  receivedDate: string;
  receiver: {
    firstName: string;
    lastName: string;
  };
  status: string;
  notes?: string;
  items: GRNItem[];
  createdAt: string;
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

interface GRNItem {
  id: string;
  purchaseOrderItem: PurchaseOrderItem;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  qualityCheck?: string;
  notes?: string;
}

export default function GRNManager() {
  const { user } = useAuth();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  const [createForm, setCreateForm] = useState({
    purchaseOrderId: '',
    receivedDate: '',
    notes: '',
    items: [] as any[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grnsRes, ordersRes] = await Promise.all([
        fetch('/api/procurement/grns', { credentials: 'include' }),
        fetch('/api/procurement/purchase-orders', { credentials: 'include' })
      ]);

      if (grnsRes.ok) setGrns(await grnsRes.json());
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        // Extract purchaseOrders array from the response
        setPurchaseOrders(ordersData.purchaseOrders || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setPurchaseOrders([]); // Ensure it's always an array
    }
    setLoading(false);
  };

  const handleCreateGRN = async () => {
    try {
      const res = await fetch('/api/procurement/grns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...createForm,
          receivedDate: createForm.receivedDate || new Date().toISOString(),
          items: createForm.items
        })
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setCreateForm({
          purchaseOrderId: '',
          receivedDate: '',
          notes: '',
          items: []
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating GRN:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Received': 'default',
      'Partially Received': 'secondary',
      'Rejected': 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getQualityCheckBadge = (quality: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Pass': 'default',
      'Fail': 'destructive',
      'Conditional': 'secondary'
    };

    return (
      <Badge variant={variants[quality] || 'outline'}>
        {quality}
      </Badge>
    );
  };

  const calculate3WayMatch = (grn: GRN) => {
    // 3-way matching: PO + Invoice + GRN
    const poItems = grn.purchaseOrder.items;
    const grnItems = grn.items;
    
    let matchStatus = 'Complete';
    let matchDetails = [];

    for (const poItem of poItems) {
      const grnItem = grnItems.find(gi => gi.purchaseOrderItem.id === poItem.id);
      if (!grnItem) {
        matchStatus = 'Incomplete';
        matchDetails.push(`${poItem.productName}: Not received`);
      } else if (grnItem.receivedQuantity !== poItem.quantity) {
        matchStatus = 'Partial';
        matchDetails.push(`${poItem.productName}: ${grnItem.receivedQuantity}/${poItem.quantity}`);
      }
    }

    return { status: matchStatus, details: matchDetails };
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
          <h2 className="text-2xl font-bold">Goods Received Notes (GRN)</h2>
          <p className="text-muted-foreground">Manage goods receipt, quality checks, and 3-way matching</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create GRN
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Goods Received Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Purchase Order</label>
                <Select
                  value={createForm.purchaseOrderId}
                  onValueChange={(value) => {
                    setCreateForm(f => ({ ...f, purchaseOrderId: value }));
                    const po = purchaseOrders.find(p => p.id === value);
                    if (po) {
                      setCreateForm(f => ({
                        ...f,
                        items: po.items.map((item: any) => ({
                          purchaseOrderItemId: item.id,
                          receivedQuantity: 0,
                          acceptedQuantity: 0,
                          rejectedQuantity: 0,
                          qualityCheck: 'Pass',
                          notes: ''
                        }))
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                  <SelectContent>
                    {(purchaseOrders || []).map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber} - {po.supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Received Date</label>
                <Input
                  type="datetime-local"
                  value={createForm.receivedDate}
                  onChange={(e) => setCreateForm(f => ({ ...f, receivedDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Receipt notes and observations"
                />
              </div>
              {createForm.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Received Items</label>
                  <div className="space-y-2">
                    {createForm.items.map((item, index) => {
                      const poItem = purchaseOrders
                        .find(po => po.id === createForm.purchaseOrderId)
                        ?.items.find((poi: PurchaseOrderItem) => poi.id === item.purchaseOrderItemId);
                      
                      return (
                        <div key={index} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{poItem?.productName}</span>
                            <span className="text-sm text-muted-foreground">
                              PO: {poItem?.quantity} units
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs">Received</label>
                              <Input
                                type="number"
                                value={item.receivedQuantity}
                                onChange={(e) => {
                                  const newItems = [...createForm.items];
                                  newItems[index].receivedQuantity = parseInt(e.target.value) || 0;
                                  setCreateForm(f => ({ ...f, items: newItems }));
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs">Accepted</label>
                              <Input
                                type="number"
                                value={item.acceptedQuantity}
                                onChange={(e) => {
                                  const newItems = [...createForm.items];
                                  newItems[index].acceptedQuantity = parseInt(e.target.value) || 0;
                                  setCreateForm(f => ({ ...f, items: newItems }));
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs">Quality</label>
                              <Select
                                value={item.qualityCheck}
                                onValueChange={(value) => {
                                  const newItems = [...createForm.items];
                                  newItems[index].qualityCheck = value;
                                  setCreateForm(f => ({ ...f, items: newItems }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pass">Pass</SelectItem>
                                  <SelectItem value="Fail">Fail</SelectItem>
                                  <SelectItem value="Conditional">Conditional</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button onClick={handleCreateGRN} className="w-full">
                Create GRN
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {grns.map((grn) => {
          const matchResult = calculate3WayMatch(grn);
          
          return (
            <Card key={grn.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {grn.grnNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      PO: {grn.purchaseOrder.poNumber} • {grn.purchaseOrder.supplier.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(grn.status)}
                    <Badge variant={matchResult.status === 'Complete' ? 'default' : 'secondary'}>
                      {matchResult.status} Match
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGRN(grn);
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Receipt Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Received:</span> {new Date(grn.receivedDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Receiver:</span> {grn.receiver.firstName} {grn.receiver.lastName}</p>
                        <p><span className="font-medium">Items:</span> {grn.items.length}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">3-Way Match Status</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Status:</span> {matchResult.status}</p>
                        {matchResult.details.length > 0 && (
                          <div>
                            <span className="font-medium">Details:</span>
                            <ul className="list-disc list-inside text-xs">
                              {matchResult.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Received Items</h4>
                    <div className="space-y-2">
                      {grn.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.purchaseOrderItem.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              PO: {item.purchaseOrderItem.quantity} • 
                              Received: {item.receivedQuantity} • 
                              Accepted: {item.acceptedQuantity}
                              {item.rejectedQuantity > 0 && ` • Rejected: ${item.rejectedQuantity}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getQualityCheckBadge(item.qualityCheck || 'Pass')}
                            {item.rejectionReason && (
                              <Badge variant="destructive" className="text-xs">
                                {item.rejectionReason}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {grn.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{grn.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* GRN Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>GRN Details - {selectedGRN?.grnNumber}</DialogTitle>
          </DialogHeader>
          {selectedGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Purchase Order</h4>
                  <p className="text-sm">{selectedGRN.purchaseOrder.poNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium">Supplier</h4>
                  <p className="text-sm">{selectedGRN.purchaseOrder.supplier.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Received Date</h4>
                  <p className="text-sm">{new Date(selectedGRN.receivedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium">Receiver</h4>
                  <p className="text-sm">{selectedGRN.receiver.firstName} {selectedGRN.receiver.lastName}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Item Details</h4>
                <div className="space-y-2">
                  {selectedGRN.items.map((item) => (
                    <div key={item.id} className="border p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{item.purchaseOrderItem.productName}</p>
                          <p className="text-sm text-muted-foreground">{item.purchaseOrderItem.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="font-medium">PO Qty:</span> {item.purchaseOrderItem.quantity}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Unit Price:</span> ${item.purchaseOrderItem.unitPrice}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Received:</span> {item.receivedQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Accepted:</span> {item.acceptedQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Rejected:</span> {item.rejectedQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Quality:</span> {item.qualityCheck}
                        </div>
                      </div>
                      {item.rejectionReason && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Rejection Reason:</span>
                          <p className="text-sm text-red-600">{item.rejectionReason}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Notes:</span>
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Users, 
  Calendar, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Settings,
  BarChart3,
  Monitor,
  Smartphone,
  Laptop,
  Headphones
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';

interface Asset {
  id: string;
  name: string;
  type: 'laptop' | 'monitor' | 'phone' | 'tablet' | 'headphones' | 'keyboard' | 'mouse' | 'other';
  serialNumber: string;
  model: string;
  brand: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
  assignedTo?: string;
  assignedToName?: string;
  assignedDate?: string;
  returnDate?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  location: string;
  cost: number;
  notes?: string;
}

interface AssetAssignment {
  id: string;
  assetId: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  assignedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
}

export default function AssetManagementPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    fetchAssetManagementData();
  }, []);

  const fetchAssetManagementData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const assetsResponse = await fetch('/api/hr/asset-management/assets');
      // const assignmentsResponse = await fetch('/api/hr/asset-management/assignments');
      
      // For now, using empty arrays
      setAssets([]);
      setAssignments([]);
    } catch (error) {
      console.error('Error fetching asset management data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch asset management data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <Users className="h-4 w-4" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      case 'retired': return <XCircle className="h-4 w-4" />;
      case 'lost': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop className="h-4 w-4" />;
      case 'monitor': return <Monitor className="h-4 w-4" />;
      case 'phone': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />;
      case 'headphones': return <Headphones className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'laptop': return 'bg-blue-100 text-blue-800';
      case 'monitor': return 'bg-purple-100 text-purple-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'tablet': return 'bg-indigo-100 text-indigo-800';
      case 'headphones': return 'bg-pink-100 text-pink-800';
      case 'keyboard': return 'bg-orange-100 text-orange-800';
      case 'mouse': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !['owner', 'admin', 'hr_admin'].includes(user.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">Track and manage company assets assigned to employees</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="headphones">Headphones</SelectItem>
                  <SelectItem value="keyboard">Keyboard</SelectItem>
                  <SelectItem value="mouse">Mouse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : assets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assets</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add company assets to start tracking them.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Asset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assets
                  .filter(asset => 
                    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(asset => filterStatus === 'all' || asset.status === filterStatus)
                  .filter(asset => filterType === 'all' || asset.type === filterType)
                  .map((asset) => (
                    <Card key={asset.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{asset.name}</h3>
                              <Badge className={getStatusColor(asset.status)}>
                                {getStatusIcon(asset.status)}
                                {asset.status}
                              </Badge>
                              <Badge className={getTypeColor(asset.type)}>
                                {getTypeIcon(asset.type)}
                                {asset.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {asset.brand} {asset.model}
                              </div>
                              <div className="flex items-center gap-1">
                                <span>S/N: {asset.serialNumber}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {asset.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Cost: ${asset.cost}</span>
                              </div>
                            </div>
                            {asset.assignedToName && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Assigned to: {asset.assignedToName}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Since: {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                              </div>
                              {asset.warrantyExpiry && (
                                <div className="flex items-center gap-1">
                                  <span>Warranty: {new Date(asset.warrantyExpiry).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {asset.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {asset.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {asset.status === 'available' && (
                              <Button variant="outline" size="sm">
                                Assign
                              </Button>
                            )}
                            {asset.status === 'assigned' && (
                              <Button variant="outline" size="sm">
                                Return
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              View History
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : assignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Asset assignments will appear here once assets are assigned to employees.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignments
                  .filter(assignment => 
                    assignment.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(assignment => filterStatus === 'all' || assignment.status === filterStatus)
                  .map((assignment) => (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{assignment.assetName}</h3>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {assignment.employeeName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                              </div>
                              {assignment.expectedReturnDate && (
                                <div className="flex items-center gap-1">
                                  <span>Expected Return: {new Date(assignment.expectedReturnDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {assignment.actualReturnDate && (
                                <div className="flex items-center gap-1">
                                  <span>Returned: {new Date(assignment.actualReturnDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {assignment.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {assignment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {assignment.status === 'active' && (
                              <Button variant="outline" size="sm">
                                Mark Returned
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive asset reports and analytics will be available here.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Asset utilization reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Department-wise asset distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Maintenance schedules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Asset depreciation reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 
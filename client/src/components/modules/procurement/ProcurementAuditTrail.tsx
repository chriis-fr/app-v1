import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  FileText, 
  DollarSign, 
  Building2, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  details: string;
  changes?: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'view' | 'export';
}

interface AuditChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export default function ProcurementAuditTrail() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    fetchAuditTrail();
  }, [filter, dateRange, selectedUser]);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const response = await api.get('/procurement/audit-trail');
      setAuditEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditTrail = async () => {
    try {
      const response = await api.get('/procurement/audit-trail/export');
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting audit trail:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'export':
        return <Download className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'request':
        return <FileText className="h-4 w-4" />;
      case 'expense':
        return <DollarSign className="h-4 w-4" />;
      case 'supplier':
        return <Building2 className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      case 'policy':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800">Create</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800">Update</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Delete</Badge>;
      case 'approve':
        return <Badge className="bg-green-100 text-green-800">Approve</Badge>;
      case 'reject':
        return <Badge className="bg-red-100 text-red-800">Reject</Badge>;
      case 'view':
        return <Badge className="bg-gray-100 text-gray-800">View</Badge>;
      case 'export':
        return <Badge className="bg-purple-100 text-purple-800">Export</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    if (searchTerm) {
      return (
        event.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

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
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Complete history of all procurement activities and changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAuditTrail}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Filter</label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">User</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="manager">Managers</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Events */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No audit events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getActionIcon(event.action)}
                    {getEntityIcon(event.entityType)}
                    <div>
                      <CardTitle className="text-lg">{event.action} {event.entityType}</CardTitle>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getSeverityBadge(event.severity)}
                    {getCategoryBadge(event.category)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Entity:</span> {event.entityName}
                  </div>
                  <div>
                    <span className="font-medium">User:</span> {event.userName}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">IP:</span> {event.ipAddress || 'N/A'}
                  </div>
                </div>
                
                {event.changes && event.changes.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium">Changes:</span>
                    <div className="mt-2 space-y-2">
                      {event.changes.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{change.field}:</span>
                          <span className="text-red-600 line-through">{change.oldValue}</span>
                          <ArrowRight className="h-3 w-3 text-gray-500" />
                          <span className="text-green-600">{change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {auditEvents.length} events
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Advanced Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export Selected
          </Button>
        </div>
      </div>
    </div>
  );
} 
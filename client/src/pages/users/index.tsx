import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { useAuth } from '@/hooks/use-auth';
import {
  Search,
  Plus,
  Edit,
  Trash,
  User,
  Briefcase,
  Building,
  Shield,
  Clock,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  BadgeCheck,
  BadgeAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  phoneNumber?: string;
  organizationId: string;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  moduleAccess?: string[];
}

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (currentUser && currentUser.organization && currentUser.organization.id) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!currentUser || !currentUser.organization || !currentUser.organization.id) return;
    const orgId = currentUser.organization.id;
    try {
      const response = await fetch(`/api/mongodb/users?organizationId=${orgId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setExpandedUserId(prevId => (prevId === userId ? null : userId));
  };

  const handleDelete = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800',
      contractor: 'bg-orange-100 text-orange-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    return status === 'active' ? (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.role.toLowerCase().includes(searchLower) ||
      u.department.toLowerCase().includes(searchLower) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(searchLower))
    );
  });

  // Only owner, admin, or HR admin can access
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'hr_admin')) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your organization's users and their access levels
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button onClick={() => setLocation('/users/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users by name, email, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>{filteredUsers.length} users found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className={cn(
            "gap-6",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
          )}>
            {filteredUsers.map((u) => {
              const isExpanded = expandedUserId === u.id;
              return (
                <Card
                  key={u.id}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isExpanded ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-gray-200",
                    viewMode === 'list' && "flex items-center"
                  )}
                >
                  <div 
                    className={cn(
                      "cursor-pointer",
                      viewMode === 'list' ? "flex-1 p-4" : "p-6"
                    )}
                    onClick={() => toggleUser(u.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {u.firstName} {u.lastName}
                            </h3>
                            {u.isOwner && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <BadgeCheck className="h-4 w-4 text-primary" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Organization Owner</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getRoleColor(u.role)}>
                              {u.role}
                            </Badge>
                            {getStatusBadge(u.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {viewMode === 'list' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/users/${u.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDelete(u.id, e)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable section */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-gray-500" />
                            {u.role}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            {u.department}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                            {u.username}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {u.lastLogin && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Last Login</p>
                            <p className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-gray-500" />
                              {new Date(u.lastLogin).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {u.phoneNumber && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-gray-500" />
                              {u.phoneNumber}
                            </p>
                          </div>
                        )}
                      </div>

                      {u.moduleAccess && u.moduleAccess.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Module Access</p>
                          <div className="flex flex-wrap gap-2">
                            {u.moduleAccess.map((module) => (
                              <Badge key={module} variant="secondary">
                                {module}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/users/${u.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDelete(u.id, e)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <User className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

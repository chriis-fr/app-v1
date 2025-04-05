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
  Clock
} from 'lucide-react';

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
}

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Instead of a Set, track only the currently expanded user ID
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/mongodb/users');
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

  // Toggle logic for exactly one expanded card
  const toggleUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUserId(prevId => (prevId === userId ? null : userId));
  };

  const handleDelete = async (userId: string) => {
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

  // Only owner/admin can access
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={() => setLocation('/users/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search Field */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => {
              const isExpanded = expandedUserId === u.id;
              return (
                <Card
                  key={u.id}
                  className="overflow-hidden"
                  onClick={(e) => toggleUser(u.id, e)}
                >
                  <div className="p-6 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {u.firstName} {u.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          {u.phoneNumber && (
                            <p className="text-sm text-gray-500">{u.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          u.isOwner ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expandable section */}
                  {isExpanded && (
                    <div id={u.id} className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            {u.role}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="flex items-center">
                            <Building className="mr-2 h-4 w-4" />
                            {u.department}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {u.username}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

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
                          onClick={() => handleDelete(u.id)}
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
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

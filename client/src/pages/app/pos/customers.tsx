import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import { Customer } from '@/types/pos';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Award
} from 'lucide-react';

export default function POSCustomers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/pos/customers');
      setCustomers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    try {
      await api.delete(`/pos/customers/${customerId}`);
      setCustomers(customers.filter(customer => customer.id !== customerId));
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    }
  };

  const filteredCustomers = (customers || []).filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <POSLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Customers</h1>
          <Button onClick={() => setLocation('/pos/customers/new')}>
            Add Customer
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View Orders
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {customer.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Address:</span> {customer.address}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Orders:</span> {customer.total_orders}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Spent:</span> ${customer.total_spent}
                  </p>
                </div>
              </Card>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No customers found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </POSLayout>
  );
} 
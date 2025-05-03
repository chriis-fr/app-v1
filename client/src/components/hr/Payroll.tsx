import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign, Calendar } from 'lucide-react';

interface PayrollProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    compensation?: {
      baseSalary?: number;
      bonus?: number;
      stockOptions?: number;
      currency?: string;
    };
  };
  onUpdate: (employeeId: string, compensation: any) => Promise<void>;
}

export function Payroll({ employee, onUpdate }: PayrollProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [compensation, setCompensation] = useState({
    baseSalary: employee.compensation?.baseSalary || 0,
    bonus: employee.compensation?.bonus || 0,
    stockOptions: employee.compensation?.stockOptions || 0,
    currency: employee.compensation?.currency || 'USD',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(employee.id, compensation);
      toast({
        title: 'Success',
        description: 'Compensation updated successfully',
      });
    } catch (error) {
      console.error('Error updating compensation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update compensation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payroll Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Base Salary</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="baseSalary"
                  type="number"
                  value={compensation.baseSalary}
                  onChange={(e) => setCompensation({ ...compensation, baseSalary: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bonus"
                  type="number"
                  value={compensation.bonus}
                  onChange={(e) => setCompensation({ ...compensation, bonus: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockOptions">Stock Options</Label>
              <Input
                id="stockOptions"
                type="number"
                value={compensation.stockOptions}
                onChange={(e) => setCompensation({ ...compensation, stockOptions: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={compensation.currency}
                onValueChange={(value) => setCompensation({ ...compensation, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
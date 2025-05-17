import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign, Calendar, TrendingUp, Percent, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      lastReview?: string;
      nextReview?: string;
      performanceRating?: number;
    };
  };
  onUpdate: (employeeId: string, compensation: any) => Promise<void>;
}

export function Payroll({ employee, onUpdate }: PayrollProps) {
  const { toast } = useToast();
  const [compensation, setCompensation] = useState({
    baseSalary: employee.compensation?.baseSalary || 0,
    bonus: employee.compensation?.bonus || 0,
    stockOptions: employee.compensation?.stockOptions || 0,
    currency: employee.compensation?.currency || 'USD',
    lastReview: employee.compensation?.lastReview || '',
    nextReview: employee.compensation?.nextReview || '',
    performanceRating: employee.compensation?.performanceRating || 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(employee.id, compensation);
      toast({
        title: 'Success',
        description: 'Compensation updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update compensation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (rating: number) => {
    if (rating >= 4.5) return 'Outstanding';
    if (rating >= 3.5) return 'Excellent';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Needs Improvement';
    return 'Poor';
  };

  const totalCompensation = compensation.baseSalary + compensation.bonus + (compensation.stockOptions * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {employee.firstName} {employee.lastName}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Employee ID: {employee.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Compensation
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Compensation Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Base Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compensation.currency} {compensation.baseSalary.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Annual base compensation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Compensation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compensation.currency} {totalCompensation.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Including bonus and stock options
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getPerformanceColor(compensation.performanceRating)}`}>
                    {compensation.performanceRating.toFixed(1)}
                  </div>
                  <Badge variant="outline" className={getPerformanceColor(compensation.performanceRating)}>
                    {getPerformanceLabel(compensation.performanceRating)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last reviewed: {compensation.lastReview || 'Never'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Compensation Details */}
          {isEditing ? (
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
                  <Label htmlFor="bonus">Annual Bonus</Label>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastReview">Last Review Date</Label>
                  <Input
                    id="lastReview"
                    type="date"
                    value={compensation.lastReview}
                    onChange={(e) => setCompensation({ ...compensation, lastReview: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextReview">Next Review Date</Label>
                  <Input
                    id="nextReview"
                    type="date"
                    value={compensation.nextReview}
                    onChange={(e) => setCompensation({ ...compensation, nextReview: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="performanceRating">Performance Rating</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="performanceRating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={compensation.performanceRating}
                      onChange={(e) => setCompensation({ ...compensation, performanceRating: Number(e.target.value) })}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Award className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rating from 0 to 5</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Compensation Breakdown</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Base Salary</span>
                      <span className="text-sm font-medium">
                        {compensation.currency} {compensation.baseSalary.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(compensation.baseSalary / totalCompensation) * 100} className="h-1" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Annual Bonus</span>
                    <span className="text-sm font-medium">
                      {compensation.currency} {compensation.bonus.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(compensation.bonus / totalCompensation) * 100} className="h-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stock Options</span>
                    <span className="text-sm font-medium">
                      {compensation.currency} {(compensation.stockOptions * 100).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={((compensation.stockOptions * 100) / totalCompensation) * 100} className="h-1" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Review Schedule</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Review</span>
                      <span className="text-sm font-medium">
                        {compensation.lastReview || 'Not reviewed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Next Review</span>
                      <span className="text-sm font-medium">
                        {compensation.nextReview || 'Not scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Performance Metrics</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Rating</span>
                      <Badge variant="outline" className={getPerformanceColor(compensation.performanceRating)}>
                        {compensation.performanceRating.toFixed(1)} - {getPerformanceLabel(compensation.performanceRating)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
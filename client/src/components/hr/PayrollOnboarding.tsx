import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Wallet, User, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  // Payroll fields (if already set)
  fullName?: string;
  country?: string;
  currencyPreference?: string;
  payoutMethod?: string;
  walletAddress?: string;
  taxId?: string;
  salaryAmount?: number;
  salaryFrequency?: string;
  contractType?: string;
  startDate?: string;
  deductions?: any;
}

interface PayrollOnboardingData {
  employeeId: string;
  fullName: string;
  country: string;
  currencyPreference: string;
  payoutMethod: 'stellar_wallet' | 'mpesa' | 'bank_transfer' | 'hybrid';
  walletAddress?: string;
  bankAccountNumber?: string;
  bankName?: string;
  taxId: string;
  salaryAmount: number;
  salaryFrequency: 'monthly' | 'biweekly' | 'weekly';
  contractType: 'full_time' | 'part_time' | 'contract' | 'intern';
  startDate: string;
  deductions: {
    pension: boolean;
    healthInsurance: boolean;
    loan: boolean;
    other: boolean;
  };
  deductionAmounts: {
    pension: number;
    healthInsurance: number;
    loan: number;
    other: number;
  };
}

const countries = [
  { code: 'KE', name: 'Kenya' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ZA', name: 'South Africa' },
];

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'ZAR', name: 'South African Rand' },
];

const payoutMethods = [
  { value: 'stellar_wallet', label: 'Stellar Wallet', description: 'Cryptocurrency payment' },
  { value: 'mpesa', label: 'M-Pesa', description: 'Mobile money (Kenya)' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Traditional bank transfer' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of methods' },
];

interface PayrollOnboardingProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayrollOnboarding({ employee, onClose, onSuccess }: PayrollOnboardingProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PayrollOnboardingData>({
    employeeId: employee.id,
    fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
    country: employee.country || 'US',
    currencyPreference: employee.currencyPreference || 'USD',
    payoutMethod: (employee.payoutMethod as any) || 'bank_transfer',
    walletAddress: employee.walletAddress || '',
    bankAccountNumber: '',
    bankName: '',
    taxId: employee.taxId || '',
    salaryAmount: employee.salaryAmount || 0,
    salaryFrequency: (employee.salaryFrequency as any) || 'monthly',
    contractType: (employee.contractType as any) || 'full_time',
    startDate: employee.startDate || employee.hireDate || '',
    deductions: {
      pension: false,
      healthInsurance: false,
      loan: false,
      other: false,
    },
    deductionAmounts: {
      pension: 0,
      healthInsurance: 0,
      loan: 0,
      other: 0,
    },
  });

  // Auto-fill from existing employee data
  useEffect(() => {
    if (employee) {
      setFormData(prev => ({
        ...prev,
        fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        country: employee.country || 'US',
        currencyPreference: employee.currencyPreference || 'USD',
        payoutMethod: (employee.payoutMethod as any) || 'bank_transfer',
        walletAddress: employee.walletAddress || '',
        taxId: employee.taxId || '',
        salaryAmount: employee.salaryAmount || 0,
        salaryFrequency: (employee.salaryFrequency as any) || 'monthly',
        contractType: (employee.contractType as any) || 'full_time',
        startDate: employee.startDate || employee.hireDate || '',
      }));
    }
  }, [employee]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeductionChange = (deduction: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [deduction]: checked
      }
    }));
  };

  const handleDeductionAmountChange = (deduction: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      deductionAmounts: {
        ...prev.deductionAmounts,
        [deduction]: amount
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/employees/payroll-onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Employee Added to Payroll",
          description: `${formData.fullName} has been successfully added to the payroll system.`,
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add employee to payroll');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add employee to payroll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Add Employee to Payroll</h2>
          </div>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-6">
          {/* Employee Info Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p>{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{employee.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <p>{employee.position || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p>{employee.department || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payroll Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (Payroll Display) *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name for payroll"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryAmount">Base Salary *</Label>
                  <Input
                    id="salaryAmount"
                    type="number"
                    value={formData.salaryAmount}
                    onChange={(e) => handleInputChange('salaryAmount', parseFloat(e.target.value))}
                    placeholder="Enter base salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryFrequency">Salary Frequency *</Label>
                  <Select value={formData.salaryFrequency} onValueChange={(value) => handleInputChange('salaryFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyPreference">Currency Preference *</Label>
                  <Select value={formData.currencyPreference} onValueChange={(value) => handleInputChange('currencyPreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type *</Label>
                  <Select value={formData.contractType} onValueChange={(value) => handleInputChange('contractType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Payroll Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Payment & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="Enter tax identification number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method *</Label>
                  <Select value={formData.payoutMethod} onValueChange={(value) => handleInputChange('payoutMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label} - {method.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.payoutMethod === 'stellar_wallet' && (
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Stellar Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={formData.walletAddress}
                      onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                      placeholder="Enter Stellar wallet address"
                    />
                  </div>
                )}
                {formData.payoutMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={employee.phoneNumber || ''}
                      placeholder="Enter M-Pesa phone number"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Using employee's phone number for M-Pesa</p>
                  </div>
                )}
                {formData.payoutMethod === 'bank_transfer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                        placeholder="Enter account number"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card>
            <CardHeader>
              <CardTitle>Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pension"
                      checked={formData.deductions.pension}
                      onCheckedChange={(checked) => handleDeductionChange('pension', checked as boolean)}
                    />
                    <Label htmlFor="pension">Pension Contribution</Label>
                    {formData.deductions.pension && (
                      <Input
                        type="number"
                        value={formData.deductionAmounts.pension}
                        onChange={(e) => handleDeductionAmountChange('pension', parseFloat(e.target.value))}
                        placeholder="Amount"
                        className="w-32"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="healthInsurance"
                      checked={formData.deductions.healthInsurance}
                      onCheckedChange={(checked) => handleDeductionChange('healthInsurance', checked as boolean)}
                    />
                    <Label htmlFor="healthInsurance">Health Insurance</Label>
                    {formData.deductions.healthInsurance && (
                      <Input
                        type="number"
                        value={formData.deductionAmounts.healthInsurance}
                        onChange={(e) => handleDeductionAmountChange('healthInsurance', parseFloat(e.target.value))}
                        placeholder="Amount"
                        className="w-32"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="loan"
                      checked={formData.deductions.loan}
                      onCheckedChange={(checked) => handleDeductionChange('loan', checked as boolean)}
                    />
                    <Label htmlFor="loan">Loan Repayment</Label>
                    {formData.deductions.loan && (
                      <Input
                        type="number"
                        value={formData.deductionAmounts.loan}
                        onChange={(e) => handleDeductionAmountChange('loan', parseFloat(e.target.value))}
                        placeholder="Amount"
                        className="w-32"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={formData.deductions.other}
                      onCheckedChange={(checked) => handleDeductionChange('other', checked as boolean)}
                    />
                    <Label htmlFor="other">Other Deductions</Label>
                    {formData.deductions.other && (
                      <Input
                        type="number"
                        value={formData.deductionAmounts.other}
                        onChange={(e) => handleDeductionAmountChange('other', parseFloat(e.target.value))}
                        placeholder="Amount"
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Payroll
          </Button>
        </div>
      </div>
    </div>
  );
} 
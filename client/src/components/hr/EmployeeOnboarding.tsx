import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, DollarSign, Wallet, Globe, FileText } from 'lucide-react';

interface EmployeeOnboardingData {
  // Basic Information
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  
  // Payroll & Compensation
  salaryAmount: number;
  salaryFrequency: 'monthly' | 'biweekly' | 'weekly';
  currencyPreference: string;
  contractType: 'full_time' | 'part_time' | 'contract' | 'intern';
  startDate: string;
  
  // Payment & Wallet
  payoutMethod: 'stellar_wallet' | 'mpesa' | 'bank_transfer' | 'hybrid';
  walletAddress?: string;
  bankAccountNumber?: string;
  bankName?: string;
  
  // Tax & Compliance
  country: string;
  taxId: string;
  
  // Deductions
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

export default function EmployeeOnboarding() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeOnboardingData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    salaryAmount: 0,
    salaryFrequency: 'monthly',
    currencyPreference: 'USD',
    contractType: 'full_time',
    startDate: '',
    payoutMethod: 'bank_transfer',
    walletAddress: '',
    bankAccountNumber: '',
    bankName: '',
    country: 'US',
    taxId: '',
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
      const response = await fetch('/api/hr/employees/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Employee Onboarded Successfully",
          description: `${formData.fullName} has been added to the payroll system.`,
        });
        // Reset form or redirect
      } else {
        throw new Error('Failed to onboard employee');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to onboard employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            placeholder="Enter job position"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
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
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter M-Pesa phone number"
            />
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
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Deductions</h3>
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
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return { title: "Basic Information", icon: UserPlus };
      case 2:
        return { title: "Compensation & Payroll", icon: DollarSign };
      case 3:
        return { title: "Payment & Compliance", icon: Wallet };
      case 4:
        return { title: "Deductions", icon: FileText };
      default:
        return { title: "", icon: UserPlus };
    }
  };

  const stepInfo = getStepTitle();
  const IconComponent = stepInfo.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Employee Onboarding - {stepInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    stepNumber <= step
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-muted-foreground'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import { PrismaClient } from '@prisma/client';
import { sendPayrollNotification } from './emailService';

// Accounting integration
interface JournalEntryData {
  date: Date;
  reference: string;
  description: string;
  organizationId: string;
  createdById: string;
  lines: {
    accountId: string;
    description: string;
    debit: number;
    credit: number;
  }[];
}

// Global payroll accounting data for integration
declare global {
  var payrollAccountingData: Array<{
    id: string;
    type: string;
    date: Date;
    reference: string;
    description: string;
    amount: number;
    category: string;
    subcategory: string;
    details: any;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

const prisma = new PrismaClient();

export interface PayrollConfig {
  paymentMethod: 'traditional' | 'crypto' | 'hybrid';
  currency: string;
  cryptoCurrency?: string;
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly';
  paymentDay: number; // Day of month/week
  autoProcess: boolean;
  requireApproval: boolean;
  taxDeductions: boolean;
  benefitsDeductions: boolean;
  overtimeEnabled: boolean;
  bonusEnabled: boolean;
}

export interface PayrollEntry {
  employeeId: string;
  baseSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  bonuses?: number;
  deductions: {
    tax: number;
    benefits: number;
    other: number;
  };
  netPay: number;
  paymentMethod: 'bank' | 'crypto' | 'hybrid';
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  cryptoWallet?: {
    address: string;
    currency: string;
    network: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  transactionHash?: string; // For crypto payments
}

export interface PayrollRun {
  id: string;
  organizationId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalAmount: number;
  currency: string;
  employeeCount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
  entries: PayrollEntry[];
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PayrollService {
  // Calculate payroll for an employee
  async calculateEmployeePayroll(
    employeeId: string,
    period: { startDate: Date; endDate: Date },
    config: PayrollConfig
  ): Promise<PayrollEntry> {
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: {
        timeTrackingEntries: {
          where: {
            startTime: { gte: period.startDate },
            endTime: { lte: period.endDate }
          }
        }
      }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Use new payroll fields or fallback to JSON fields
    const employeeData = employee as any; // Type assertion for new fields
    const baseSalary = employeeData.salaryAmount || (employee.compensation as any)?.baseSalary || 0;
    const currency = employeeData.currencyPreference || config.currency;
    const payoutMethod = employeeData.payoutMethod || 'bank_transfer';
    const country = employeeData.country || 'US';
    const deductions = employeeData.deductions || [];
    
    // Parse JSON fields safely for fallback
    const compensation = employee.compensation as any || {};
    const benefits = employee.benefits as any || {};
    const wallet = employee.wallet as any || {};
    
    // Calculate overtime
    const overtimeHours = this.calculateOvertimeHours(employee.timeTrackingEntries);
    const overtimeRate = compensation?.overtimeRate || baseSalary / 160; // Default hourly rate
    const overtimePay = overtimeHours * overtimeRate;

    // Calculate bonuses (if any)
    const bonuses = compensation?.bonus || 0;

    // Calculate deductions
    const taxDeduction = this.calculateTaxDeduction(baseSalary, config);
    const benefitsDeduction = this.calculateBenefitsDeduction(benefits, config, baseSalary);
    const otherDeductions = 0; // Additional deductions

    const grossPay = baseSalary + overtimePay + bonuses;
    const totalDeductions = taxDeduction + benefitsDeduction + otherDeductions;
    const netPay = grossPay - totalDeductions;

    return {
      employeeId,
      baseSalary,
      overtimeHours,
      overtimeRate,
      bonuses,
      deductions: {
        tax: taxDeduction,
        benefits: benefitsDeduction,
        other: otherDeductions
      },
      netPay,
      paymentMethod: this.determinePaymentMethod(employee, config),
      bankAccount: wallet?.bankAccounts?.[0],
      cryptoWallet: wallet?.cryptoWallets?.[0],
      period,
      status: 'pending'
    };
  }

  // Process payroll run for all employees
  async processPayrollRun(
    organizationId: string,
    period: { startDate: Date; endDate: Date },
    config: PayrollConfig
  ): Promise<PayrollRun> {
    const employees = await prisma.user.findMany({
      where: { 
        organizationId,
        isActive: true,
        role: { not: 'owner' }
      }
    });

    const entries: PayrollEntry[] = [];
    let totalAmount = 0;

    for (const employee of employees) {
      const entry = await this.calculateEmployeePayroll(employee.id, period, config);
      entries.push(entry);
      totalAmount += entry.netPay;
    }

    const payrollRun: PayrollRun = {
      id: `payroll-${Date.now()}`,
      organizationId,
      period,
      totalAmount,
      currency: config.currency,
      employeeCount: employees.length,
      status: config.requireApproval ? 'pending_approval' : 'approved',
      entries,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    await this.savePayrollRun(payrollRun);

    // Send notifications
    await this.sendPayrollNotifications(payrollRun);

    return payrollRun;
  }

  // Execute payroll payments
  async executePayrollPayments(payrollRunId: string): Promise<void> {
    const payrollRun = await this.getPayrollRun(payrollRunId);
    
    if (!payrollRun) {
      throw new Error('Payroll run not found');
    }

    if (payrollRun.status !== 'approved') {
      throw new Error('Payroll run must be approved before execution');
    }

    // Update status to processing
    await this.updatePayrollRunStatus(payrollRunId, 'processing');

    try {
      for (const entry of payrollRun.entries) {
        await this.processPayment(entry);
      }

      // Update status to completed
      await this.updatePayrollRunStatus(payrollRunId, 'completed', new Date());
    } catch (error) {
      // Update status to failed
      await this.updatePayrollRunStatus(payrollRunId, 'failed');
      throw error;
    }
  }

  // Process individual payment
  private async processPayment(entry: PayrollEntry): Promise<void> {
    try {
      switch (entry.paymentMethod) {
        case 'bank':
          await this.processBankPayment(entry);
          break;
        case 'crypto':
          await this.processCryptoPayment(entry);
          break;
        case 'hybrid':
          await this.processHybridPayment(entry);
          break;
        default:
          throw new Error(`Unsupported payment method: ${entry.paymentMethod}`);
      }

      await this.updatePayrollEntryStatus(entry.employeeId, 'completed');
    } catch (error) {
      await this.updatePayrollEntryStatus(entry.employeeId, 'failed');
      throw error;
    }
  }

  // Process bank payment
  private async processBankPayment(entry: PayrollEntry): Promise<void> {
    if (!entry.bankAccount) {
      throw new Error('Bank account details not found');
    }

    // Simulate bank transfer
    console.log(`Processing bank payment for employee ${entry.employeeId}: $${entry.netPay}`);
    
    // In a real implementation, you would integrate with a banking API
    // For now, we'll just simulate the process
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Process crypto payment
  private async processCryptoPayment(entry: PayrollEntry): Promise<void> {
    if (!entry.cryptoWallet) {
      throw new Error('Crypto wallet details not found');
    }

    try {
      const transactionHash = await this.sendCryptoPayment({
        to: entry.cryptoWallet.address,
        amount: entry.netPay,
        currency: entry.cryptoWallet.currency,
        network: entry.cryptoWallet.network
      });

      await this.updatePayrollEntryWithTransaction(entry.employeeId, transactionHash);
    } catch (error) {
      throw new Error(`Crypto payment failed: ${error}`);
    }
  }

  // Send crypto payment (simulated)
  private async sendCryptoPayment(params: {
    to: string;
    amount: number;
    currency: string;
    network: string;
  }): Promise<string> {
    // Simulate crypto payment
    console.log(`Sending ${params.amount} ${params.currency} to ${params.to} on ${params.network}`);
    
    // In a real implementation, you would integrate with a crypto payment service
    // For now, we'll just simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock transaction hash
    return `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
  }

  // Calculate overtime hours from time tracking entries
  private calculateOvertimeHours(timeEntries: any[]): number {
    const standardHoursPerWeek = 40;
    const overtimeThreshold = standardHoursPerWeek;
    
    let totalHours = 0;
    for (const entry of timeEntries) {
      if (entry.startTime && entry.endTime) {
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        totalHours += duration;
      }
    }
    
    return Math.max(0, totalHours - overtimeThreshold);
  }

  // Calculate tax deduction
  private calculateTaxDeduction(baseSalary: number, config: PayrollConfig): number {
    // Simplified tax calculation
    const taxRate = 0.15; // 15% tax rate
    return baseSalary * taxRate;
  }

  // Calculate benefits deduction
  private calculateBenefitsDeduction(benefits: any, config: PayrollConfig, baseSalary: number = 0): number {
    if (!config.benefitsDeductions) {
      return 0;
    }

    let totalDeduction = 0;
    
    // Health insurance
    if (benefits?.healthInsurance) {
      totalDeduction += 200; // $200/month
    }
    
    // Dental insurance
    if (benefits?.dentalInsurance) {
      totalDeduction += 50; // $50/month
    }
    
    // Vision insurance
    if (benefits?.visionInsurance) {
      totalDeduction += 25; // $25/month
    }
    
    // Retirement plan
    if (benefits?.retirementPlan) {
      totalDeduction += baseSalary * 0.05; // 5% of base salary
    }
    
    return totalDeduction;
  }

  // Determine payment method based on employee preferences and config
  private determinePaymentMethod(employee: any, config: PayrollConfig): 'bank' | 'crypto' | 'hybrid' {
    const employeeData = employee as any;
    const payoutMethod = employeeData.payoutMethod || 'bank_transfer';
    
    // Determine payment method based on payout method
    switch (payoutMethod) {
      case 'stellar_wallet':
        return 'crypto';
      case 'mpesa':
        return 'bank'; // M-Pesa is treated as bank transfer
      case 'bank_transfer':
        return 'bank';
      case 'hybrid':
        return 'hybrid';
      default:
        return 'bank';
    }
  }

    // Save payroll run to database and create accounting entries
  private async savePayrollRun(payrollRun: PayrollRun): Promise<void> {
    try {
      // For now, we'll log the payroll data and create accounting entries
      // In a full implementation, you would save to the database
      console.log('Saving payroll run:', payrollRun.id);
      console.log('Total payroll amount:', payrollRun.totalAmount);
      console.log('Employee count:', payrollRun.employeeCount);

      // Create accounting journal entries for payroll
      await this.createPayrollJournalEntries(payrollRun);

      console.log('Payroll run processed successfully');
    } catch (error) {
      console.error('Error saving payroll run:', error);
      throw error;
    }
  }

// Create accounting journal entries for payroll
private async createPayrollJournalEntries(payrollRun: PayrollRun): Promise<void> {
  try {
    // Calculate totals for accounting entries
    const totalNetPay = payrollRun.entries.reduce((sum, entry) => sum + entry.netPay, 0);
    const totalTaxDeductions = payrollRun.entries.reduce((sum, entry) => sum + entry.deductions.tax, 0);
    const totalBenefitsDeductions = payrollRun.entries.reduce((sum, entry) => sum + entry.deductions.benefits, 0);
    const totalOtherDeductions = payrollRun.entries.reduce((sum, entry) => sum + entry.deductions.other, 0);

    // Create accounting journal entry data for integration with existing accounting system
    const journalEntryData = {
      date: new Date(),
      reference: `PAYROLL-${payrollRun.id}`,
      description: `Payroll for period ${payrollRun.period.startDate.toLocaleDateString()} - ${payrollRun.period.endDate.toLocaleDateString()}`,
      organizationId: payrollRun.organizationId,
      createdById: payrollRun.approvedBy || 'system',
      lines: [
        // Debit: Payroll Expense
        {
          accountId: 'PAYROLL_EXPENSE',
          description: 'Payroll expense',
          debit: payrollRun.totalAmount,
          credit: 0,
        },
        // Credit: Payroll Liabilities (net pay)
        {
          accountId: 'PAYROLL_LIABILITIES',
          description: 'Net payroll payable',
          debit: 0,
          credit: totalNetPay,
        },
        // Credit: Tax Payable
        {
          accountId: 'TAX_PAYABLE',
          description: 'Tax deductions',
          debit: 0,
          credit: totalTaxDeductions,
        },
        // Credit: Benefits Payable
        {
          accountId: 'BENEFITS_PAYABLE',
          description: 'Benefits deductions',
          debit: 0,
          credit: totalBenefitsDeductions,
        },
      ]
    };

    // Store payroll accounting data for integration with existing accounting routes
    const payrollAccountingData = {
      id: payrollRun.id,
      type: 'payroll',
      date: new Date(),
      reference: journalEntryData.reference,
      description: journalEntryData.description,
      amount: payrollRun.totalAmount,
      category: 'expense',
      subcategory: 'payroll',
      details: {
        totalNetPay,
        totalTaxDeductions,
        totalBenefitsDeductions,
        totalOtherDeductions,
        employeeCount: payrollRun.employeeCount,
        period: {
          start: payrollRun.period.startDate,
          end: payrollRun.period.endDate
        }
      },
      status: 'posted',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in global payroll accounting data for integration
    if (!global.payrollAccountingData) {
      global.payrollAccountingData = [];
    }
    global.payrollAccountingData.push(payrollAccountingData);

    console.log('=== PAYROLL ACCOUNTING ENTRY ===');
    console.log('Journal Entry:', journalEntryData.reference);
    console.log('Description:', journalEntryData.description);
    console.log('Total Payroll Expense:', payrollRun.totalAmount);
    console.log('Net Pay Payable:', totalNetPay);
    console.log('Tax Payable:', totalTaxDeductions);
    console.log('Benefits Payable:', totalBenefitsDeductions);
    console.log('Other Deductions:', totalOtherDeductions);
    console.log('=== END PAYROLL ACCOUNTING ENTRY ===');

    console.log('Payroll accounting entries created and stored for integration');
  } catch (error) {
    console.error('Error creating payroll journal entries:', error);
    throw error;
  }
}

  // Get payroll run from database
  private async getPayrollRun(id: string): Promise<PayrollRun | null> {
    // In a real implementation, you would fetch from the database
    console.log('Getting payroll run:', id);
    return null;
  }

  // Update payroll run status
  private async updatePayrollRunStatus(id: string, status: string, processedAt?: Date): Promise<void> {
    console.log(`Updating payroll run ${id} status to ${status}`);
  }

  // Update payroll entry status
  private async updatePayrollEntryStatus(employeeId: string, status: string): Promise<void> {
    console.log(`Updating payroll entry for employee ${employeeId} status to ${status}`);
  }

  // Update payroll entry with transaction hash
  private async updatePayrollEntryWithTransaction(employeeId: string, transactionHash: string): Promise<void> {
    console.log(`Updating payroll entry for employee ${employeeId} with transaction ${transactionHash}`);
  }

  // Send payroll notifications
  private async sendPayrollNotifications(payrollRun: PayrollRun): Promise<void> {
    console.log('Sending payroll notifications for run:', payrollRun.id);
    
    for (const entry of payrollRun.entries) {
      try {
        // Get employee details
        const employee = await prisma.user.findUnique({
          where: { id: entry.employeeId },
          select: { email: true, firstName: true, lastName: true }
        });

        if (employee && employee.email) {
          const period = `${payrollRun.period.startDate.toLocaleDateString()} - ${payrollRun.period.endDate.toLocaleDateString()}`;
          
          await sendPayrollNotification(
            employee.email,
            `${employee.firstName} ${employee.lastName}`,
            entry.netPay,
            payrollRun.currency,
            entry.paymentMethod,
            period,
            entry.transactionHash
          );
        }
      } catch (error) {
        console.error(`Failed to send payroll notification to employee ${entry.employeeId}:`, error);
      }
    }
  }

  // Process hybrid payment (part bank, part crypto)
  private async processHybridPayment(entry: PayrollEntry): Promise<void> {
    const bankAmount = entry.netPay * 0.7; // 70% to bank
    const cryptoAmount = entry.netPay * 0.3; // 30% to crypto
    
    // Process bank portion
    if (entry.bankAccount) {
      const bankEntry = { ...entry, netPay: bankAmount };
      await this.processBankPayment(bankEntry);
    }
    
    // Process crypto portion
    if (entry.cryptoWallet) {
      const cryptoEntry = { ...entry, netPay: cryptoAmount };
      await this.processCryptoPayment(cryptoEntry);
    }
  }
}

export const payrollService = new PayrollService();
import { Organization, Transaction, Customer, Employee, Invoice } from '../mongodb/models';
import type { Types } from 'mongoose';

interface InsightMetrics {
  revenue: number;
  expenses: number;
  customerGrowth: number;
  employeePerformance: number;
  cashFlow: number;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  metric: string;
  message: string;
  recommendation?: string;
}

export class AIInsightsService {
  private async getMetrics(organizationId: Types.ObjectId): Promise<InsightMetrics> {
    const [
      transactions,
      customers,
      employees,
      invoices
    ] = await Promise.all([
      Transaction.find({ organizationId }).sort({ createdAt: -1 }).limit(100),
      Customer.find({ organizationId }).sort({ createdAt: -1 }),
      Employee.find({ organizationId }),
      Invoice.find({ organizationId }).sort({ createdAt: -1 }).limit(100)
    ]);

    // Calculate revenue (from completed sales transactions)
    const revenue = transactions
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate expenses
    const expenses = transactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate customer growth rate
    const recentCustomers = customers.filter(c => 
      c.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const customerGrowth = (recentCustomers / customers.length) * 100;

    // Calculate employee performance (based on transactions per employee)
    const transactionsPerEmployee = transactions.length / (employees.length || 1);
    const employeePerformance = transactionsPerEmployee / 10; // Normalized to 0-1

    // Calculate cash flow
    const cashFlow = revenue - expenses;

    return {
      revenue,
      expenses,
      customerGrowth,
      employeePerformance,
      cashFlow
    };
  }

  async generateInsights(organizationId: Types.ObjectId): Promise<Insight[]> {
    const metrics = await this.getMetrics(organizationId);
    const insights: Insight[] = [];

    // Revenue insights
    if (metrics.revenue > metrics.expenses * 1.2) {
      insights.push({
        type: 'positive',
        metric: 'revenue',
        message: 'Strong revenue performance with healthy profit margins',
        recommendation: 'Consider reinvesting in growth opportunities'
      });
    } else if (metrics.revenue < metrics.expenses) {
      insights.push({
        type: 'negative',
        metric: 'revenue',
        message: 'Revenue is below expenses, indicating potential profitability issues',
        recommendation: 'Review pricing strategy and cost structure'
      });
    }

    // Customer growth insights
    if (metrics.customerGrowth > 10) {
      insights.push({
        type: 'positive',
        metric: 'customers',
        message: 'Strong customer acquisition rate',
        recommendation: 'Focus on retention strategies for new customers'
      });
    } else if (metrics.customerGrowth < 2) {
      insights.push({
        type: 'negative',
        metric: 'customers',
        message: 'Slow customer growth rate',
        recommendation: 'Review marketing strategies and customer acquisition channels'
      });
    }

    // Employee performance insights
    if (metrics.employeePerformance > 0.7) {
      insights.push({
        type: 'positive',
        metric: 'employees',
        message: 'High employee productivity',
        recommendation: 'Consider implementing reward programs'
      });
    } else if (metrics.employeePerformance < 0.3) {
      insights.push({
        type: 'negative',
        metric: 'employees',
        message: 'Employee productivity below target',
        recommendation: 'Review training programs and work processes'
      });
    }

    // Cash flow insights
    if (metrics.cashFlow > 0) {
      insights.push({
        type: 'positive',
        metric: 'cashFlow',
        message: 'Positive cash flow position',
        recommendation: metrics.cashFlow > metrics.revenue * 0.3 
          ? 'Consider strategic investments or expansion'
          : 'Monitor working capital to maintain stability'
      });
    } else {
      insights.push({
        type: 'negative',
        metric: 'cashFlow',
        message: 'Negative cash flow position',
        recommendation: 'Review payment terms and inventory management'
      });
    }

    return insights;
  }
}

export const aiInsights = new AIInsightsService(); 
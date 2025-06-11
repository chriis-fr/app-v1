export const financialData = {
  // B2B Transactions
  b2bTransactions: [
    {
      id: 'B2B-001',
      type: 'Invoice',
      partner: 'Tech Solutions Inc.',
      amount: 15000.00,
      currency: 'USD',
      status: 'Paid',
      dueDate: '2024-03-15',
      createdAt: '2024-02-15',
      items: [
        { description: 'Software License', quantity: 5, unitPrice: 2000.00 },
        { description: 'Support Services', quantity: 1, unitPrice: 5000.00 }
      ]
    },
    {
      id: 'B2B-002',
      type: 'Payment',
      partner: 'Global Services Ltd.',
      amount: 8750.00,
      currency: 'EUR',
      status: 'Pending',
      dueDate: '2024-03-20',
      createdAt: '2024-02-20',
      items: [
        { description: 'Consulting Services', quantity: 35, unitPrice: 250.00 }
      ]
    }
  ],

  // Payroll Data
  payroll: {
    currentMonth: {
      totalPayroll: 125000.00,
      employeeCount: 25,
      averageSalary: 5000.00,
      deductions: 25000.00,
      netPayroll: 100000.00
    },
    employees: [
      {
        id: 'EMP-001',
        name: 'John Doe',
        position: 'Senior Developer',
        salary: 8000.00,
        deductions: {
          tax: 1600.00,
          insurance: 400.00,
          retirement: 800.00
        },
        netSalary: 5200.00,
        paymentStatus: 'Paid',
        paymentDate: '2024-02-28'
      },
      {
        id: 'EMP-002',
        name: 'Jane Smith',
        position: 'Project Manager',
        salary: 7500.00,
        deductions: {
          tax: 1500.00,
          insurance: 375.00,
          retirement: 750.00
        },
        netSalary: 4875.00,
        paymentStatus: 'Paid',
        paymentDate: '2024-02-28'
      }
    ]
  },

  // Fund Tracking
  funds: {
    totalAssets: 1500000.00,
    liquidAssets: 750000.00,
    investments: 500000.00,
    accounts: [
      {
        id: 'ACC-001',
        name: 'Operating Account',
        type: 'Checking',
        balance: 250000.00,
        currency: 'USD',
        lastUpdated: '2024-02-28'
      },
      {
        id: 'ACC-002',
        name: 'Investment Account',
        type: 'Investment',
        balance: 500000.00,
        currency: 'USD',
        lastUpdated: '2024-02-28'
      },
      {
        id: 'ACC-003',
        name: 'Savings Account',
        type: 'Savings',
        balance: 750000.00,
        currency: 'USD',
        lastUpdated: '2024-02-28'
      }
    ],
    transactions: [
      {
        id: 'TRX-001',
        type: 'Deposit',
        amount: 50000.00,
        account: 'Operating Account',
        description: 'Client Payment',
        date: '2024-02-25',
        status: 'Completed'
      },
      {
        id: 'TRX-002',
        type: 'Withdrawal',
        amount: 25000.00,
        account: 'Operating Account',
        description: 'Vendor Payment',
        date: '2024-02-26',
        status: 'Completed'
      }
    ]
  },

  // Financial Metrics
  metrics: {
    revenue: {
      monthly: 250000.00,
      quarterly: 750000.00,
      yearly: 3000000.00
    },
    expenses: {
      monthly: 150000.00,
      quarterly: 450000.00,
      yearly: 1800000.00
    },
    profit: {
      monthly: 100000.00,
      quarterly: 300000.00,
      yearly: 1200000.00
    },
    cashFlow: {
      operating: 75000.00,
      investing: -25000.00,
      financing: 50000.00
    }
  },

  // Budget Tracking
  budgets: {
    departments: [
      {
        id: 'DEPT-001',
        name: 'Engineering',
        allocated: 500000.00,
        spent: 350000.00,
        remaining: 150000.00,
        period: '2024'
      },
      {
        id: 'DEPT-002',
        name: 'Marketing',
        allocated: 200000.00,
        spent: 125000.00,
        remaining: 75000.00,
        period: '2024'
      }
    ],
    categories: [
      {
        id: 'CAT-001',
        name: 'Software Licenses',
        allocated: 100000.00,
        spent: 75000.00,
        remaining: 25000.00
      },
      {
        id: 'CAT-002',
        name: 'Office Supplies',
        allocated: 50000.00,
        spent: 25000.00,
        remaining: 25000.00
      }
    ]
  }
}; 
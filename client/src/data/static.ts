// Static data matching schema structure
export const staticData = {
  companies: [
    {
      id: "1",
      companyName: "Demo Corp",
      password: "hashed_password",
      ownerName: "John Doe",
      domain: "demo.chain.erp",
      email: "demo@chain.erp",
      modules: ["POS", "HR", "Accounting", "CRM", "Blockchain"],
      walletAddress: "0x123...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      businessMetrics: {
        revenue: 1500000,
        expenses: 1000000,
        profit: 500000,
        growthRate: 15,
        cashFlow: 250000,
        assetsValue: 2000000,
        liabilities: 800000,
        equity: 1200000
      },
      aiAnalytics: {
        marketTrends: {
          growthOpportunities: [
            "Expansion into renewable energy sector",
            "Digital transformation services",
            "Sustainable supply chain solutions"
          ],
          riskFactors: [
            "Market volatility in traditional sectors",
            "Emerging competitors in tech space",
            "Regulatory changes in finance sector"
          ],
          recommendedActions: [
            "Invest in AI/ML capabilities",
            "Strengthen digital presence",
            "Develop sustainable practices"
          ]
        },
        performanceInsights: {
          strengths: [
            "Strong cash flow position",
            "High employee satisfaction",
            "Efficient operations"
          ],
          improvements: [
            "Inventory turnover could be optimized",
            "Customer acquisition cost is above industry average",
            "Digital marketing ROI needs improvement"
          ]
        },
        blockchainMetrics: {
          walletHealth: {
            securityScore: 95,
            transactionEfficiency: 98,
            gasOptimization: 92
          },
          smartContractAnalysis: {
            activeContracts: 3,
            avgExecutionCost: "0.002 ETH",
            successRate: 99.9,
            recommendedOptimizations: [
              "Implement batch transactions",
              "Upgrade to newer contract standards",
              "Enable gas price optimization"
            ]
          }
        },
        industryComparison: {
          revenuePercentile: 85,
          growthPercentile: 92,
          efficiencyScore: 88,
          sustainabilityRank: "A-",
          competitiveAdvantages: [
            "Advanced blockchain integration",
            "Automated operations",
            "Strong customer relationships"
          ]
        },
        growthProjections: {
          shortTerm: {
            expectedRevenue: 1800000,
            projectedGrowth: 20,
            potentialMarkets: ["Asia-Pacific", "European Union"],
            riskLevel: "Moderate"
          },
          longTerm: {
            marketPotential: 5000000,
            sustainableGrowthRate: 15,
            requiredInvestments: [
              "R&D in blockchain technology",
              "Sustainable infrastructure",
              "Talent acquisition"
            ]
          }
        }
      }
    }
  ],
  users: [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@chain.erp",
      password: "hashed_password",
      phoneNumber: "1234567890",
      role: "SuperAdmin",
      department: "Executive",
      companyId: "1",
      walletAddress: "0x123...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@chain.erp",
      password: "hashed_password",
      phoneNumber: "0987654321",
      role: "Manager",
      department: "POS",
      companyId: "1",
      walletAddress: "0x456...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  pos: {
    orders: [
      {
        id: "1",
        posId: "1",
        customerId: "1",
        totalAmount: 299.99,
        status: "Completed",
        items: [
          {
            id: "1",
            orderId: "1",
            productId: "1",
            quantity: 2,
            price: 149.99
          }
        ],
        createdAt: new Date().toISOString(),
        paymentMethod: "Credit Card",
        tax: 30.00,
        discount: 0,
        netAmount: 269.99
      }
    ],
    products: [
      {
        id: "1",
        name: "Premium Widget",
        category: "Electronics",
        basePrice: 149.99,
        currentPrice: 149.99,
        costPrice: 100.00,
        margin: 49.99,
        sku: "WDG001"
      }
    ],
    inventory: [
      {
        id: "1",
        posId: "1",
        productId: "1",
        stockLevel: 100,
        reorderPoint: 20,
        optimalStock: 150,
        updatedAt: new Date().toISOString(),
        location: "Main Warehouse",
        value: 10000.00
      }
    ],
    analytics: {
      dailySales: 2999.90,
      weeklyGrowth: 15,
      popularProducts: ["Premium Widget", "Basic Widget"],
      averageOrderValue: 299.99,
      conversionRate: 65
    }
  },
  hr: {
    employees: [
      {
        id: "1",
        hrId: "1",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@chain.erp",
        role: "Manager",
        walletAddress: "0x456...",
        department: "Sales",
        salary: 75000,
        joinDate: new Date().toISOString(),
        performanceScore: 4.5,
        createdAt: new Date().toISOString()
      }
    ],
    payroll: [
      {
        id: "1",
        employeeId: "1",
        amount: 5000,
        hrId: "1",
        currency: "USD",
        status: "Paid",
        type: "Salary",
        deductions: 1000,
        benefits: 500,
        netPay: 4500,
        createdAt: new Date().toISOString()
      }
    ],
    attendance: [
      {
        id: "1",
        employeeId: "1",
        hrId: "1",
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
        status: "Present",
        workHours: 8,
        overtime: 1
      }
    ],
    analytics: {
      headcount: 50,
      turnoverRate: 5,
      avgTenure: 2.5,
      trainingCosts: 25000,
      satisfactionScore: 4.2
    }
  },
  accounting: {
    invoices: [
      {
        id: "1",
        accountingId: "1",
        customerId: "1",
        amount: 999.99,
        status: "Paid",
        dueDate: new Date().toISOString(),
        items: [
          {
            description: "Consulting Services",
            amount: 999.99,
            quantity: 1
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    ledger: [
      {
        id: "1",
        accountingId: "1",
        type: "Credit",
        description: "Sales Revenue",
        amount: 999.99,
        category: "Revenue",
        account: "Sales",
        createdAt: new Date().toISOString()
      }
    ],
    analytics: {
      revenueGrowth: 25,
      profitMargin: 35,
      operatingExpenses: 750000,
      cashflowHealth: "Positive",
      accountsReceivable: 50000,
      accountsPayable: 30000
    }
  },
  blockchain: {
    transactions: [
      {
        id: "1",
        blockchainId: "1",
        txHash: "0x789...",
        type: "Payment",
        amount: 1.5,
        status: "Confirmed",
        from: "0x123...",
        to: "0x456...",
        gasUsed: 21000,
        createdAt: new Date().toISOString()
      }
    ],
    contracts: [
      {
        id: "1",
        name: "PaymentProcessor",
        address: "0x789...",
        network: "Ethereum",
        status: "Active",
        deployedAt: new Date().toISOString()
      }
    ],
    analytics: {
      totalTransactions: 150,
      averageGasUsed: 21000,
      successRate: 99.9,
      activeContracts: 3,
      dailyVolume: 25.5
    }
  }
};
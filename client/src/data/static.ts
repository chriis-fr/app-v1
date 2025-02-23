// Static data matching Prisma schema structure
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
      updatedAt: new Date().toISOString()
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
      companyId: "1",
      walletAddress: "0x123...",
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
        ]
      }
    ],
    inventory: [
      {
        id: "1",
        posId: "1",
        productId: "1", 
        stockLevel: 100,
        updatedAt: new Date().toISOString()
      }
    ]
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
        createdAt: new Date().toISOString()
      }
    ],
    attendance: [
      {
        id: "1",
        employeeId: "1",
        hrId: "1",
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString()
      }
    ]
  },

  accounting: {
    invoices: [
      {
        id: "1",
        accountingId: "1",
        customerId: "1",
        amount: 999.99,
        status: "Paid",
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
        createdAt: new Date().toISOString()
      }
    ]
  },

  blockchain: {
    transactions: [
      {
        id: "1",
        blockchainId: "1",
        txHash: "0x789...",
        type: "Payment",
        amount: 1.5,
        createdAt: new Date().toISOString()
      }
    ]
  }
};

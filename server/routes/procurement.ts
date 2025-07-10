import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/auth';
import { Request, Response } from 'express';

const router = express.Router();

// Extend Request to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}


const prisma = new PrismaClient();

// ============================================================================
// PROCUREMENT REQUESTS
// ============================================================================

// Get all procurement requests
router.get('/requests', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const requests = await (prisma as any).procurementRequest.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        purchaseOrders: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching procurement requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new procurement request
router.post('/requests', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      title,
      description,
      category,
      estimatedCost,
      priority,
      urgency,
      justification,
      attachments
    } = req.body;

    const request = await (prisma as any).procurementRequest.create({
      data: {
        title,
        description,
        category,
        estimatedCost: parseFloat(estimatedCost),
        priority,
        urgency,
        status: 'pending',
        requesterId: req.user.id,
        justification,
        attachments: attachments || [],
        organizationId: req.user.organizationId
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    // Send notification to admin and finance department
    await sendProcurementNotification(request, 'created');

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating procurement request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update procurement request
router.put('/requests/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const request = await (prisma as any).procurementRequest.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification if status changed
    if (updateData.status && updateData.status !== request.status) {
      await sendProcurementNotification(request, 'status_updated');
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating procurement request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve/reject procurement request
router.post('/requests/:id/approve', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    const request = await (prisma as any).procurementRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Add comment if provided
    if (comment) {
      await (prisma as any).procurementComment.create({
        data: {
          content: comment,
          authorId: req.user.id,
          procurementRequestId: id,
          organizationId: req.user.organizationId
        }
      });
    }

    // Send notification
    await sendProcurementNotification(request, 'approved');

    res.json(request);
  } catch (error) {
    console.error('Error approving procurement request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to procurement request
router.post('/requests/:id/comments', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await (prisma as any).procurementComment.create({
      data: {
        content,
        authorId: req.user.id,
        procurementRequestId: id,
        organizationId: req.user.organizationId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

// Get all purchase orders
router.get('/orders', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await (prisma as any).purchaseOrder.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new purchase order
router.post('/orders', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      supplierId,
      items,
      totalAmount,
      currency,
      terms,
      deliveryDate,
      paymentTerms
    } = req.body;

    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = await (prisma as any).purchaseOrder.create({
      data: {
        supplierId,
        createdById: req.user.id,
        poNumber,
        status: 'draft',
        totalAmount: parseFloat(totalAmount),
        currency,
        items,
        terms,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        paymentTerms,
        organizationId: req.user.organizationId
      },
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update purchase order
router.put('/orders/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const order = await (prisma as any).purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve purchase order
router.post('/orders/:id/approve', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    const order = await (prisma as any).purchaseOrder.update({
      where: { id },
      data: {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Add comment if provided
    if (comment) {
      await (prisma as any).procurementComment.create({
        data: {
          content: comment,
          authorId: req.user.id,
          purchaseOrderId: id,
          organizationId: req.user.organizationId
        }
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Error approving purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to purchase order
router.post('/orders/:id/comments', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await (prisma as any).procurementComment.create({
      data: {
        content,
        authorId: req.user.id,
        purchaseOrderId: id,
        organizationId: req.user.organizationId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// SUPPLIERS
// ============================================================================

// Get all suppliers
router.get('/suppliers', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const suppliers = await (prisma as any).supplier.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new supplier
router.post('/suppliers', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      taxId,
      category,
      paymentTerms,
      notes
    } = req.body;

    const supplier = await (prisma as any).supplier.create({
      data: {
        name,
        contactPerson,
        email,
        phone,
        address,
        taxId,
        category,
        paymentTerms,
        notes,
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update supplier
router.put('/suppliers/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const supplier = await (prisma as any).supplier.update({
      where: { id },
      data: updateData
    });

    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get supplier by ID
router.get('/suppliers/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;

    const supplier = await (prisma as any).supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// EXPENSE REQUESTS
// ============================================================================

// Get all expense requests
router.get('/expenses', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const expenses = await (prisma as any).expenseRequest.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expense requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new expense request
router.post('/expenses', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      title,
      description,
      amount,
      currency,
      category,
      priority,
      urgency,
      justification,
      attachments
    } = req.body;

    const expense = await (prisma as any).expenseRequest.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        currency,
        category,
        priority,
        urgency,
        status: 'pending',
        requesterId: req.user.id,
        justification,
        attachments: attachments || [],
        organizationId: req.user.organizationId
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    // Send notification
    await sendExpenseNotification(expense, 'created');

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update expense request
router.put('/expenses/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const expense = await (prisma as any).expenseRequest.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification if status changed
    if (updateData.status && updateData.status !== expense.status) {
      await sendExpenseNotification(expense, 'status_updated');
    }

    res.json(expense);
  } catch (error) {
    console.error('Error updating expense request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve/reject expense request
router.post('/expenses/:id/approve', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    const expense = await (prisma as any).expenseRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Add comment if provided
    if (comment) {
      await (prisma as any).procurementComment.create({
        data: {
          content: comment,
          authorId: req.user.id,
          expenseRequestId: id,
          organizationId: req.user.organizationId
        }
      });
    }

    // Send notification
    await sendExpenseNotification(expense, 'approved');

    res.json(expense);
  } catch (error) {
    console.error('Error approving expense request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to expense request
router.post('/expenses/:id/comments', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await (prisma as any).procurementComment.create({
      data: {
        content,
        authorId: req.user.id,
        expenseRequestId: id,
        organizationId: req.user.organizationId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// BUDGETS
// ============================================================================

// Get all budgets
router.get('/budgets', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const budgets = await (prisma as any).budget.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new budget
router.post('/budgets', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      name,
      description,
      amount,
      currency,
      period,
      startDate,
      endDate,
      category,
      notes
    } = req.body;

    const budget = await (prisma as any).budget.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        currency,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        notes,
        createdById: req.user.id,
        organizationId: req.user.organizationId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update budget
router.put('/budgets/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const budget = await (prisma as any).budget.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// PAYMENTS
// ============================================================================

// Get all payments
router.get('/payments', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const payments = await (prisma as any).payment.findMany({
      where: {
        organizationId: req.user.organizationId
      },
      include: {
        expenseRequest: {
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        purchaseOrder: {
          include: {
            supplier: true
          }
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new payment
router.post('/payments', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      expenseRequestId,
      purchaseOrderId,
      amount,
      currency,
      paymentMethod,
      notes
    } = req.body;

    const payment = await (prisma as any).payment.create({
      data: {
        expenseRequestId,
        purchaseOrderId,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        status: 'pending',
        notes,
        processedById: req.user.id,
        organizationId: req.user.organizationId
      },
      include: {
        expenseRequest: {
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        purchaseOrder: {
          include: {
            supplier: true
          }
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update payment status
router.put('/payments/:id/status', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, transactionId } = req.body;

    const payment = await (prisma as any).payment.update({
      where: { id },
      data: {
        status,
        transactionId,
        processedAt: status === 'completed' ? new Date() : null
      },
      include: {
        expenseRequest: {
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        purchaseOrder: {
          include: {
            supplier: true
          }
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(payment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

async function sendProcurementNotification(request: any, action: string) {
  try {
    // Get admin and finance users
    const adminUsers = await prisma.user.findMany({
      where: {
        organizationId: request.organizationId,
        role: { in: ['admin', 'owner'] }
      }
    });

    const financeUsers = await prisma.user.findMany({
      where: {
        organizationId: request.organizationId,
        department: 'finance'
      }
    });

    const allUsers = [...adminUsers, ...financeUsers];

    for (const user of allUsers) {
      let title = '';
      let message = '';

      switch (action) {
        case 'created':
          title = 'New Procurement Request';
          message = `A new procurement request "${request.title}" has been created by ${request.requester?.firstName} ${request.requester?.lastName}`;
          break;
        case 'approved':
          title = 'Procurement Request Approved';
          message = `The procurement request "${request.title}" has been approved`;
          break;
        case 'status_updated':
          title = 'Procurement Request Updated';
          message = `The procurement request "${request.title}" status has been updated to ${request.status}`;
          break;
      }

      await prisma.notification.create({
        data: {
          type: 'procurement',
          title,
          message,
          userId: user.id,
          organizationId: request.organizationId,
          priority: 'medium',
          actionUrl: `/procurement/requests/${request.id}`,
          metadata: JSON.stringify({ requestId: request.id, action })
        }
      });
    }
  } catch (error) {
    console.error('Error sending procurement notification:', error);
  }
}

async function sendExpenseNotification(expense: any, action: string) {
  try {
    // Get admin and finance users
    const adminUsers = await prisma.user.findMany({
      where: {
        organizationId: expense.organizationId,
        role: { in: ['admin', 'owner'] }
      }
    });

    const financeUsers = await prisma.user.findMany({
      where: {
        organizationId: expense.organizationId,
        department: 'finance'
      }
    });

    const allUsers = [...adminUsers, ...financeUsers];

    for (const user of allUsers) {
      let title = '';
      let message = '';

      switch (action) {
        case 'created':
          title = 'New Expense Request';
          message = `A new expense request "${expense.title}" for ${expense.currency} ${expense.amount} has been created by ${expense.requester?.firstName} ${expense.requester?.lastName}`;
          break;
        case 'approved':
          title = 'Expense Request Approved';
          message = `The expense request "${expense.title}" has been approved`;
          break;
        case 'status_updated':
          title = 'Expense Request Updated';
          message = `The expense request "${expense.title}" status has been updated to ${expense.status}`;
          break;
      }

      await prisma.notification.create({
        data: {
          type: 'expense',
          title,
          message,
          userId: user.id,
          organizationId: expense.organizationId,
          priority: 'medium',
          actionUrl: `/procurement/expenses/${expense.id}`,
          metadata: JSON.stringify({ expenseId: expense.id, action })
        }
      });
    }
  } catch (error) {
    console.error('Error sending expense notification:', error);
  }
}

export default router; 
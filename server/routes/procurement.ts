import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/auth';
import { checkPermission } from '../middleware/check-permission';

const prisma = new PrismaClient();

const router = express.Router();

// ============================================================================
// PROCUREMENT POLICY ROUTES
// ============================================================================

// Get procurement policies
router.get('/policies', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const policies = await (prisma as any).procurementPolicy.findMany({
      where: { organizationId: req.user.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(policies);
  } catch (error) {
    console.error('Error fetching procurement policies:', error);
    res.status(500).json({ error: 'Failed to fetch procurement policies' });
  }
});

// Create procurement policy
router.post('/policies', isAuthenticated, checkPermission('procurement', 'create'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, spendThresholds, approvalWorkflow, ethicalStandards, mandatorySteps } = req.body;

    const policy = await (prisma as any).procurementPolicy.create({
      data: {
        name,
        description,
        spendThresholds,
        approvalWorkflow,
        ethicalStandards,
        mandatorySteps,
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating procurement policy:', error);
    res.status(500).json({ error: 'Failed to create procurement policy' });
  }
});

// ============================================================================
// ENHANCED PROCUREMENT REQUEST ROUTES
// ============================================================================

// Get procurement requests with enhanced filtering
router.get('/requests', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { status, priority, department, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { organizationId: req.user.organizationId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (department) where.department = department;
    if (category) where.category = category;

    const requests = await (prisma as any).procurementRequest.findMany({
      where,
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { firstName: true, lastName: true, email: true } },
        comments: { include: { author: { select: { firstName: true, lastName: true } } } },
        purchaseOrders: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await (prisma as any).procurementRequest.count({ where });

    res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching procurement requests:', error);
    res.status(500).json({ error: 'Failed to fetch procurement requests' });
  }
});

// Create procurement request with enhanced validation
router.post('/requests', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      title,
      description,
      category,
      estimatedAmount,
      priority,
      urgency,
      department,
      justification,
      budgetCode,
      attachments,
      expectedDeliveryDate,
      preferredSupplier,
      specialRequirements,
      impactOnOperations,
      alternativesConsidered,
      riskAssessment
    } = req.body;

    // Determine spend threshold and approval level based on amount
    let spendThreshold = 'Low';
    let approvalLevel = 'Department';
    
    if (estimatedAmount >= 10000) {
      spendThreshold = 'High';
      approvalLevel = 'Executive';
    } else if (estimatedAmount >= 5000) {
      spendThreshold = 'Medium';
      approvalLevel = 'Finance';
    }

    // Generate PR number
    const prNumber = `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const request = await (prisma as any).procurementRequest.create({
      data: {
        title,
        description,
        category,
        estimatedCost: estimatedAmount,
        priority,
        urgency: urgency || 'normal',
        status: 'pending',
        requesterId: req.user.id,
        justification,
        attachments: attachments || [],
        organizationId: req.user.organizationId,
        department: department || 'HR',
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        preferredSupplier: preferredSupplier || null,
        specialRequirements: specialRequirements || null,
        impactOnOperations: impactOnOperations || null,
        alternativesConsidered: alternativesConsidered || null,
        riskAssessment: riskAssessment || null
      },
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    // Find department members to notify
    const departmentMembers = await (prisma as any).user.findMany({
      where: {
        organizationId: req.user.organizationId,
        department: department || 'HR',
        id: { not: req.user.id } // Exclude the requester
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    // Create notification for department members
    if (departmentMembers.length > 0) {
      const notificationPromises = departmentMembers.map((member: any) =>
        (prisma as any).notification.create({
          data: {
            title: 'New Procurement Request',
            message: `${req.user.firstName} ${req.user.lastName} has submitted a new procurement request: ${title}`,
            type: 'procurement_request',
            recipientId: member.id,
            organizationId: req.user.organizationId,
            metadata: {
              requestId: request.id,
              department: department || 'HR',
              estimatedAmount: estimatedAmount,
              category: category
            }
          }
        })
      );

      await Promise.all(notificationPromises);
    }

    // Also notify managers and admins
    const managersAndAdmins = await (prisma as any).user.findMany({
      where: {
        organizationId: req.user.organizationId,
        role: { in: ['admin', 'manager'] },
        id: { not: req.user.id }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (managersAndAdmins.length > 0) {
      const adminNotificationPromises = managersAndAdmins.map((admin: any) =>
        (prisma as any).notification.create({
          data: {
            title: 'Procurement Request Requires Approval',
            message: `New procurement request from ${department || 'HR'} department requires your approval: ${title}`,
            type: 'procurement_approval',
            recipientId: admin.id,
            organizationId: req.user.organizationId,
            metadata: {
              requestId: request.id,
              department: department || 'HR',
              estimatedAmount: estimatedAmount,
              category: category,
              requester: `${req.user.firstName} ${req.user.lastName}`
            }
          }
        })
      );

      await Promise.all(adminNotificationPromises);
    }

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating procurement request:', error);
    res.status(500).json({ error: 'Failed to create procurement request' });
  }
});

// Submit procurement request for approval
router.patch('/requests/:id/submit', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const request = await (prisma as any).procurementRequest.update({
      where: { id },
      data: { status: 'submitted' },
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    // Notify approvers based on approval level
    // This would integrate with your notification system

    res.json(request);
  } catch (error) {
    console.error('Error submitting procurement request:', error);
    res.status(500).json({ error: 'Failed to submit procurement request' });
  }
});

// Approve/Reject procurement request
router.patch('/requests/:id/approve', isAuthenticated, checkPermission('procurement', 'approve'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const updateData: any = {
      status,
      approvedBy: req.user.id,
      approvedAt: new Date()
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const request = await (prisma as any).procurementRequest.update({
      where: { id },
      data: updateData,
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.json(request);
  } catch (error) {
    console.error('Error approving procurement request:', error);
    res.status(500).json({ error: 'Failed to approve procurement request' });
  }
});

// ============================================================================
// RFP ROUTES - DISABLED (Models not in schema yet)
// ============================================================================

// TODO: Add RFP and RFPResponse models to schema before enabling these routes

// ============================================================================
// CONTRACT ROUTES
// ============================================================================

// Get contracts
router.get('/contracts', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const contracts = await (prisma as any).contract.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        supplier: true,
        procurementRequest: true,
        purchaseOrder: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        legalReviewer: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create contract
router.post('/contracts', isAuthenticated, checkPermission('procurement', 'create'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      title,
      description,
      supplierId,
      procurementRequestId,
      purchaseOrderId,
      contractType,
      startDate,
      endDate,
      totalValue,
      currency,
      paymentTerms,
      sla,
      penalties,
      attachments
    } = req.body;

    const contractNumber = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const contract = await (prisma as any).contract.create({
      data: {
        contractNumber,
        title,
        description,
        supplierId,
        procurementRequestId,
        purchaseOrderId,
        contractType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalValue,
        currency,
        paymentTerms,
        sla,
        penalties,
        status: 'Draft',
        attachments: attachments || [],
        organizationId: req.user.organizationId,
        createdBy: req.user.id
      },
      include: {
        supplier: true,
        procurementRequest: true,
        purchaseOrder: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Legal review contract
router.patch('/contracts/:id/legal-review', isAuthenticated, checkPermission('procurement', 'review'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const contract = await (prisma as any).contract.update({
      where: { id },
      data: {
        status,
        legalReviewBy: req.user.id,
        legalReviewAt: new Date()
      },
      include: {
        supplier: true,
        legalReviewer: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.json(contract);
  } catch (error) {
    console.error('Error reviewing contract:', error);
    res.status(500).json({ error: 'Failed to review contract' });
  }
});

// ============================================================================
// GOODS RECEIVED NOTE ROUTES
// ============================================================================

// Get GRNs
router.get('/grns', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const grns = await (prisma as any).goodsReceivedNote.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            items: true
          }
        },
        receivedBy: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            purchaseOrderItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(grns);
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    res.status(500).json({ error: 'Failed to fetch GRNs' });
  }
});

// Create GRN
router.post('/grns', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { purchaseOrderId, receivedDate, notes, items } = req.body;

    const grnNumber = `GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const grn = await (prisma as any).goodsReceivedNote.create({
      data: {
        grnNumber,
        purchaseOrderId,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        receivedBy: req.user.id,
        notes,
        status: 'Received',
        organizationId: req.user.organizationId,
        items: {
          create: items.map((item: any) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            receivedQuantity: item.receivedQuantity,
            acceptedQuantity: item.acceptedQuantity,
            rejectedQuantity: item.rejectedQuantity || 0,
            rejectionReason: item.rejectionReason,
            qualityCheck: item.qualityCheck,
            notes: item.notes
          }))
        }
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            items: true
          }
        },
        receivedBy: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            purchaseOrderItem: true
          }
        }
      }
    });

    res.status(201).json(grn);
  } catch (error) {
    console.error('Error creating GRN:', error);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
});

// ============================================================================
// VENDOR PERFORMANCE ROUTES
// ============================================================================

// Get vendor performances
router.get('/vendor-performances', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const performances = await (prisma as any).vendorPerformance.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        supplier: true,
        evaluatedBy: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { evaluationDate: 'desc' }
    });

    res.json(performances);
  } catch (error) {
    console.error('Error fetching vendor performances:', error);
    res.status(500).json({ error: 'Failed to fetch vendor performances' });
  }
});

// Create vendor performance evaluation
router.post('/vendor-performances', isAuthenticated, checkPermission('procurement', 'evaluate'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      supplierId,
      evaluationPeriod,
      evaluationDate,
      qualityScore,
      deliveryScore,
      priceScore,
      communicationScore,
      overallScore,
      strengths,
      weaknesses,
      recommendations
    } = req.body;

    const performance = await (prisma as any).vendorPerformance.create({
      data: {
        supplierId,
        evaluationPeriod,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : new Date(),
        qualityScore,
        deliveryScore,
        priceScore,
        communicationScore,
        overallScore,
        strengths,
        weaknesses,
        recommendations,
        evaluatedBy: req.user.id,
        organizationId: req.user.organizationId
      },
      include: {
        supplier: true,
        evaluatedBy: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.status(201).json(performance);
  } catch (error) {
    console.error('Error creating vendor performance:', error);
    res.status(500).json({ error: 'Failed to create vendor performance' });
  }
});

// ============================================================================
// PROCUREMENT AUDIT ROUTES (COMMENTED OUT - MODELS NOT IN SCHEMA)
// ============================================================================

// Get procurement audits
// router.get('/audits', isAuthenticated, checkPermission('procurement', 'audit'), async (req: any, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const audits = await (prisma as any).procurementAudit.findMany({
//       where: { organizationId: req.user.organizationId },
//       include: {
//         auditor: { select: { firstName: true, lastName: true, email: true } }
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     res.json(audits);
//   } catch (error) {
//     console.error('Error fetching procurement audits:', error);
//     res.status(500).json({ error: 'Failed to fetch procurement audits' });
//   }
// });

// Create procurement audit
// router.post('/audits', isAuthenticated, checkPermission('procurement', 'audit'), async (req: any, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const {
//       auditType,
//       auditPeriod,
//       startDate,
//       endDate,
//       scope,
//       findings,
//       recommendations,
//       status
//     } = req.body;

//     const auditNumber = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//     const audit = await (prisma as any).procurementAudit.create({
//       data: {
//         auditNumber,
//         auditType,
//         auditPeriod,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         scope,
//         findings,
//         recommendations,
//         status: status || 'In Progress',
//         auditorId: req.user.id,
//         organizationId: req.user.organizationId
//       },
//       include: {
//         auditor: { select: { firstName: true, lastName: true, email: true } }
//       }
//     });

//     res.status(201).json(audit);
//   } catch (error) {
//     console.error('Error creating procurement audit:', error);
//     res.status(500).json({ error: 'Failed to create procurement audit' });
//   }
// });

// ============================================================================
// PROCUREMENT COMMITTEE ROUTES (COMMENTED OUT - MODELS NOT IN SCHEMA)
// ============================================================================

// Get procurement committees
// router.get('/committees', isAuthenticated, async (req: any, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const committees = await (prisma as any).procurementCommittee.findMany({
//       where: { organizationId: req.user.organizationId },
//       orderBy: { createdAt: 'desc' }
//     });

//     res.json(committees);
//   } catch (error) {
//     console.error('Error fetching procurement committees:', error);
//     res.status(500).json({ error: 'Failed to fetch procurement committees' });
//   }
// });

// Create procurement committee
// router.post('/committees', isAuthenticated, checkPermission('procurement', 'committee'), async (req: any, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const { name, description, spendThreshold, members } = req.body;

//     const committee = await (prisma as any).procurementCommittee.create({
//       data: {
//         name,
//         description,
//         spendThreshold,
//         members,
//         organizationId: req.user.organizationId
//       }
//     });

//     res.status(201).json(committee);
//   } catch (error) {
//     console.error('Error creating procurement committee:', error);
//     res.status(500).json({ error: 'Failed to create procurement committee' });
//   }
// });

// ============================================================================
// EXISTING ROUTES (Enhanced)
// ============================================================================

// Get purchase orders with enhanced data
router.get('/purchase-orders', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { status, supplierId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { organizationId: req.user.organizationId };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const purchaseOrders = await (prisma as any).purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        procurementRequest: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payments: true,
        contracts: true,
        grns: {
          include: {
            items: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await (prisma as any).purchaseOrder.count({ where });

    res.json({
      purchaseOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Get suppliers with performance data
router.get('/suppliers', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const suppliers = await (prisma as any).supplier.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        purchaseOrders: true,
        rfpResponses: true,
        contracts: true,
        performances: {
          orderBy: { evaluationDate: 'desc' },
          take: 1
        },
        vendorContracts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get expense requests with enhanced filtering
router.get('/expenses', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { status, category, department, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { organizationId: req.user.organizationId };
    if (status) where.status = status;
    if (category) where.category = category;
    if (department) where.department = department;

    const expenses = await (prisma as any).expenseRequest.findMany({
      where,
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { firstName: true, lastName: true, email: true } },
        comments: { include: { author: { select: { firstName: true, lastName: true } } } },
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await (prisma as any).expenseRequest.count({ where });

    res.json({
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expense requests:', error);
    res.status(500).json({ error: 'Failed to fetch expense requests' });
  }
});

// Create expense request with department notifications
router.post('/expenses', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      title,
      description,
      amount,
      category,
      department,
      justification,
      currency = 'USD',
      expenseDate,
      receipts
    } = req.body;

    // Validate required fields
    if (!title || !description || !amount || !category || !department || !justification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create expense request
    const expense = await (prisma as any).expenseRequest.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        category,
        department,
        justification,
        currency,
        status: 'pending',
        priority: 'medium',
        urgency: 'normal',
        requesterId: req.user.id,
        organizationId: req.user.organizationId,
        attachments: receipts ? [receipts] : []
      },
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    // Find department members to notify
    const departmentMembers = await (prisma as any).user.findMany({
      where: {
        organizationId: req.user.organizationId,
        department: department,
        id: { not: req.user.id } // Exclude the requester
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    // Create notification for department members
    if (departmentMembers.length > 0) {
      const notificationPromises = departmentMembers.map((member: any) =>
        (prisma as any).notification.create({
          data: {
            title: 'New Expense Request',
            message: `${req.user.firstName} ${req.user.lastName} has submitted a new expense request: ${title}`,
            type: 'expense_request',
            recipientId: member.id,
            organizationId: req.user.organizationId,
            metadata: {
              expenseId: expense.id,
              department: department,
              amount: amount,
              category: category
            }
          }
        })
      );

      await Promise.all(notificationPromises);
    }

    // Also notify managers and admins
    const managersAndAdmins = await (prisma as any).user.findMany({
      where: {
        organizationId: req.user.organizationId,
        role: { in: ['admin', 'manager'] },
        id: { not: req.user.id }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (managersAndAdmins.length > 0) {
      const adminNotificationPromises = managersAndAdmins.map((admin: any) =>
        (prisma as any).notification.create({
          data: {
            title: 'Expense Request Requires Approval',
            message: `New expense request from ${department} department requires your approval: ${title}`,
            type: 'expense_approval',
            recipientId: admin.id,
            organizationId: req.user.organizationId,
            metadata: {
              expenseId: expense.id,
              department: department,
              amount: amount,
              category: category,
              requester: `${req.user.firstName} ${req.user.lastName}`
            }
          }
        })
      );

      await Promise.all(adminNotificationPromises);
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense request:', error);
    res.status(500).json({ error: 'Failed to create expense request' });
  }
});

// Get budgets with spending analysis
router.get('/budgets', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budgets = await (prisma as any).budget.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate spending percentages
    const budgetsWithAnalysis = budgets.map((budget: any) => ({
      ...budget,
      spendingPercentage: (budget.spentAmount / budget.amount) * 100,
      remainingPercentage: (budget.remainingAmount / budget.amount) * 100
    }));

    res.json(budgetsWithAnalysis);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Get payments with enhanced data
router.get('/payments', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { organizationId: req.user.organizationId };
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const payments = await (prisma as any).payment.findMany({
      where,
      include: {
        purchaseOrder: {
          include: {
            supplier: true
          }
        },
        expenseRequest: true,
        processedBy: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await (prisma as any).payment.count({ where });

    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

// Get procurement dashboard analytics
router.get('/analytics', isAuthenticated, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const organizationId = req.user.organizationId;

    // Get counts
    const [
      totalRequests,
      pendingRequests,
      totalPurchaseOrders,
      totalSuppliers,
      totalExpenses,
      totalBudgets,
      totalContracts,
      totalRFPs
    ] = await Promise.all([
      (prisma as any).procurementRequest.count({ where: { organizationId } }),
      (prisma as any).procurementRequest.count({ where: { organizationId, status: 'Submitted' } }),
      (prisma as any).purchaseOrder.count({ where: { organizationId } }),
      (prisma as any).supplier.count({ where: { organizationId } }),
      (prisma as any).expenseRequest.count({ where: { organizationId } }),
      (prisma as any).budget.count({ where: { organizationId } }),
      0, // (prisma as any).contract.count({ where: { organizationId } }),
      0  // (prisma as any).rFP.count({ where: { organizationId } })
    ]);

    // Get spending analytics
    const totalSpent = await (prisma as any).payment.aggregate({
      where: { organizationId, status: 'Completed' },
      _sum: { amount: true }
    });

    const monthlySpending = await (prisma as any).payment.groupBy({
      by: ['createdAt'],
      where: { organizationId, status: 'Completed' },
      _sum: { amount: true }
    });

    // Get top suppliers by spend
    const topSuppliers = await (prisma as any).supplier.findMany({
      where: { organizationId },
      include: {
        purchaseOrders: {
          include: {
            payments: {
              where: { status: 'Completed' }
            }
          }
        }
      },
      take: 5
    });

    const analytics = {
      counts: {
        totalRequests,
        pendingRequests,
        totalPurchaseOrders,
        totalSuppliers,
        totalExpenses,
        totalBudgets,
        totalContracts: 0,
        totalRFPs: 0
      },
      spending: {
        totalSpent: totalSpent._sum.amount || 0,
        monthlySpending
      },
      topSuppliers: topSuppliers.map((supplier: any) => ({
        ...supplier,
        totalSpent: supplier.purchaseOrders.reduce((sum: number, po: any) => 
          sum + po.payments.reduce((pSum: number, payment: any) => pSum + payment.amount, 0), 0
        )
      })).sort((a: any, b: any) => b.totalSpent - a.totalSpent)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching procurement analytics:', error);
    res.status(500).json({ error: 'Failed to fetch procurement analytics' });
  }
});

export default router; 
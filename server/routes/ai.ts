import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { aiService } from '../services/ai-service';

const router = express.Router();

// Chat endpoint
router.post('/chat', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { message, context, conversation_history } = req.body;
    const user = (req as any).user;

    // Add user context - prioritize frontend context over backend user object
    const enhancedContext = {
      ...context,
      user_id: user.id,
      user_name: context?.userName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user_role: user.role,
      department: user.department,
      organization_id: user.organizationId,
      organization_name: context?.organizationName || user.organization?.name || 'Unknown Organization'
    };

    // Debug logging
    console.log('🔍 AI Chat Request Debug:');
    console.log('  Frontend Context:', context);
    console.log('  Backend User:', {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      department: user.department,
      organizationId: user.organizationId,
      organizationName: user.organization?.name
    });
    console.log('  Message:', message);
    console.log('  Final Enhanced Context:', enhancedContext);

    const response = await aiService.chat({
      message,
      context: enhancedContext,
      conversation_history,
      user_role: user.role,
      organization_id: user.organizationId,
      department: user.department
    });

    res.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      text: 'Sorry, I encountered an error. Please try again.',
      context: req.body.context,
      suggestions: ['Try rephrasing your question', 'Check your connection'],
      confidence: 0.0,
      timestamp: new Date()
    });
  }
});

// Business insights endpoint
router.post('/insights/business', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    const user = (req as any).user;

    const response = await aiService.businessInsights({
      organization_id: user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_id: user.id,
        user_role: user.role,
        department: user.department
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Business Insights Error:', error);
    res.status(500).json({
      insights: ['Unable to generate business insights at this time'],
      recommendations: ['Please try again later'],
      confidence_score: 0.0,
      timestamp: new Date()
    });
  }
});

// HR insights endpoint
router.post('/insights/hr', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { insight_type, time_period, employee_data } = req.body;
    const user = (req as any).user;

    const response = await aiService.hrInsights({
      organization_id: user.organizationId,
      insight_type,
      time_period,
      employee_data,
      context: {
        user_id: user.id,
        user_role: user.role,
        department: user.department
      }
    });

    res.json(response);
  } catch (error) {
    console.error('HR Insights Error:', error);
    res.status(500).json({
      insights: ['Unable to generate HR insights at this time'],
      recommendations: ['Please try again later'],
      confidence_score: 0.0,
      timestamp: new Date()
    });
  }
});

// Financial insights endpoint
router.post('/insights/financial', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    const user = (req as any).user;

    const response = await aiService.financialInsights({
      organization_id: user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_id: user.id,
        user_role: user.role,
        department: user.department
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Financial Insights Error:', error);
    res.status(500).json({
      insights: ['Unable to generate financial insights at this time'],
      recommendations: ['Please try again later'],
      confidence_score: 0.0,
      timestamp: new Date()
    });
  }
});

// Sales insights endpoint
router.post('/insights/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    const user = (req as any).user;

    const response = await aiService.salesInsights({
      organization_id: user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_id: user.id,
        user_role: user.role,
        department: user.department
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Sales Insights Error:', error);
    res.status(500).json({
      insights: ['Unable to generate sales insights at this time'],
      recommendations: ['Please try again later'],
      confidence_score: 0.0,
      timestamp: new Date()
    });
  }
});

// Inventory insights endpoint
router.post('/insights/inventory', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    const user = (req as any).user;

    const response = await aiService.inventoryInsights({
      organization_id: user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_id: user.id,
        user_role: user.role,
        department: user.department
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Inventory Insights Error:', error);
    res.status(500).json({
      insights: ['Unable to generate inventory insights at this time'],
      recommendations: ['Please try again later'],
      confidence_score: 0.0,
      timestamp: new Date()
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ai',
    timestamp: new Date()
  });
});

// Test organization data endpoint
router.get('/test-org-data', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { OrganizationDataService } = await import('../services/organization-data.service');
    
    const orgData = await OrganizationDataService.getOrganizationData(user.organizationId);
    
    res.json({
      success: true,
      data: orgData
    });
  } catch (error) {
    console.error('Test org data error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
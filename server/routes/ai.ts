import express from 'express';
import { aiService } from '../services/ai-service';
import { AIInsightsService } from '../services/ai-insights.service';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Initialize AI insights service
const aiInsightsService = AIInsightsService.getInstance();

// Chat endpoint
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    const { message, context, conversation_history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

          const response = await aiService.chat({
        message,
        context: {
          ...context,
          user_id: req.user?.id,
          user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user?.email,
          user_role: req.user?.role,
          organization_id: req.user?.organizationId,
          organization_name: (req.user as any)?.organization?.name
        },
        conversation_history,
        organization_id: req.user?.organizationId
      });

    res.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Get AI insights for a specific department
router.get('/insights/:department', isAuthenticated, async (req, res) => {
  try {
    const { department } = req.params;
    const { forceRefresh } = req.query;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const insights = await aiInsightsService.getDepartmentInsights(
      req.user.organizationId,
      department,
      forceRefresh === 'true'
    );

    if (!insights) {
      return res.status(404).json({ error: 'No insights found for this department' });
    }

    res.json(insights);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ error: 'Failed to get AI insights' });
  }
});

// Get all AI insights for an organization
router.get('/insights', isAuthenticated, async (req, res) => {
  try {
    const { forceRefresh } = req.query;
    
    console.log('📡 GET /insights called:', { 
      organizationId: req.user?.organizationId, 
      forceRefresh,
      user: req.user?.email,
      userName: (req.user as any)?.firstName,
      userRole: req.user?.role,
      department: req.user?.department
    });
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const insights = await aiInsightsService.generateInsights({
      organizationId: req.user.organizationId,
      userRole: req.user.role,
      userName: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
      forceRefresh: forceRefresh === 'true'
    });

    console.log('✅ Insights response:', {
      count: insights?.length || 0,
      departments: insights?.map(i => i.department) || [],
      data: insights
    });

    // Return the insights array directly
    res.json(insights || []);
  } catch (error) {
    console.error('❌ AI Insights Error:', error);
    res.status(500).json({ error: 'Failed to get AI insights' });
  }
});

// Refresh insights for a specific department
router.post('/insights/:department/refresh', isAuthenticated, async (req, res) => {
  try {
    const { department } = req.params;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const insights = await aiInsightsService.getDepartmentInsights(
      req.user.organizationId,
      department,
      true // Force refresh
    );

    if (!insights) {
      return res.status(404).json({ error: 'No insights found for this department' });
    }

    res.json(insights);
  } catch (error) {
    console.error('AI Insights Refresh Error:', error);
    res.status(500).json({ error: 'Failed to refresh AI insights' });
  }
});

// Clear insights cache for an organization
router.delete('/insights/cache', isAuthenticated, async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    aiInsightsService.clearCache(req.user.organizationId);
    
    res.json({ message: 'Insights cache cleared successfully' });
  } catch (error) {
    console.error('AI Insights Cache Clear Error:', error);
    res.status(500).json({ error: 'Failed to clear insights cache' });
  }
});

// Business insights endpoint
router.post('/business-insights', isAuthenticated, async (req, res) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const response = await aiService.businessInsights({
      organization_id: req.user.organizationId,
      data_type,
      time_period,
      specific_metrics,
              context: {
          user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
          user_role: req.user.role,
          organization_name: (req.user as any)?.organization?.name,
          organization_id: req.user.organizationId
        }
    });

    res.json(response);
  } catch (error) {
    console.error('Business Insights Error:', error);
    res.status(500).json({ error: 'Failed to get business insights' });
  }
});

// HR insights endpoint
router.post('/hr-insights', isAuthenticated, async (req, res) => {
  try {
    const { insight_type, employee_data, time_period } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const response = await aiService.hrInsights({
      organization_id: req.user.organizationId,
      insight_type,
      employee_data,
      time_period,
      context: {
        user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
        user_role: req.user.role,
        organization_name: (req.user as any)?.organization?.name,
        organization_id: req.user.organizationId
      }
    });

    res.json(response);
  } catch (error) {
    console.error('HR Insights Error:', error);
    res.status(500).json({ error: 'Failed to get HR insights' });
  }
});

// HR department insights endpoint
router.get('/insights/hr', isAuthenticated, async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const { AIInsightsService } = await import('../services/ai-insights.service');
    const insightsService = AIInsightsService.getInstance();
    
    const insights = await insightsService.generateInsights({
      organizationId: req.user.organizationId,
      department: 'hr',
      userRole: req.user.role,
      userName: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
      forceRefresh: req.query.refresh === 'true'
    });

    if (insights.length > 0 && insights[0].insights.length > 0) {
      res.json({
        insights: insights[0].insights,
        lastUpdated: insights[0].lastUpdated,
        nextUpdate: insights[0].nextUpdate
      });
    } else {
      res.json({
        insights: [],
        message: 'No HR insights available'
      });
    }
  } catch (error) {
    console.error('HR Department Insights Error:', error);
    res.status(500).json({ error: 'Failed to get HR department insights' });
  }
});

// Financial insights endpoint
router.post('/financial-insights', isAuthenticated, async (req, res) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const response = await aiService.financialInsights({
      organization_id: req.user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
        user_role: req.user.role,
        organization_name: (req.user as any)?.organization?.name,
        organization_id: req.user.organizationId
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Financial Insights Error:', error);
    res.status(500).json({ error: 'Failed to get financial insights' });
  }
});

// Sales insights endpoint
router.post('/sales-insights', isAuthenticated, async (req, res) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const response = await aiService.salesInsights({
      organization_id: req.user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
        user_role: req.user.role,
        organization_name: (req.user as any)?.organization?.name,
        organization_id: req.user.organizationId
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Sales Insights Error:', error);
    res.status(500).json({ error: 'Failed to get sales insights' });
  }
});

// Inventory insights endpoint
router.post('/inventory-insights', isAuthenticated, async (req, res) => {
  try {
    const { data_type, time_period, specific_metrics } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const response = await aiService.inventoryInsights({
      organization_id: req.user.organizationId,
      data_type,
      time_period,
      specific_metrics,
      context: {
        user_name: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : req.user.email,
        user_role: req.user.role,
        organization_name: (req.user as any)?.organization?.name,
        organization_id: req.user.organizationId
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Inventory Insights Error:', error);
    res.status(500).json({ error: 'Failed to get inventory insights' });
  }
});

// Test organization data endpoint
router.get('/test-org-data', isAuthenticated, async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const { OrganizationDataService } = await import('../services/organization-data.service');
    const orgData = await OrganizationDataService.getOrganizationData(req.user.organizationId);
    
    res.json({
      message: 'Organization data retrieved successfully',
      data: orgData
    });
  } catch (error) {
    console.error('Test Org Data Error:', error);
    res.status(500).json({ error: 'Failed to get organization data' });
  }
});

// Test comprehensive organization data endpoint
router.get('/test-comprehensive-org-data', isAuthenticated, async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const { OrganizationDataService } = await import('../services/organization-data.service');
    const comprehensiveData = await OrganizationDataService.getComprehensiveOrganizationData(req.user.organizationId);
    
    res.json({
      message: 'Comprehensive organization data retrieved successfully',
      data: comprehensiveData
    });
  } catch (error) {
    console.error('Test Comprehensive Org Data Error:', error);
    res.status(500).json({ error: 'Failed to get comprehensive organization data' });
  }
});

// Test AI service endpoint
router.get('/test-ai-service', isAuthenticated, async (req, res) => {
  try {
    console.log('🧪 Test AI service called by:', req.user?.email);
    
    const testResponse = await aiService.chat({
      message: 'Hello, can you provide a simple test response?',
      context: {
        user_name: (req.user as any)?.firstName || 'Test User',
        user_role: req.user?.role || 'employee',
        organization_name: (req.user as any)?.organization?.name || 'Test Organization',
        department: 'test'
      },
      organization_id: req.user?.organizationId
    });
    
    console.log('✅ AI service test successful:', testResponse);
    
    res.json({
      message: 'AI service test successful',
      response: testResponse
    });
  } catch (error) {
    console.error('❌ AI Service Test Error:', error);
    res.status(500).json({ 
      error: 'AI service test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
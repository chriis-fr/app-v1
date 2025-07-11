import { aiService } from './ai-service';
import { OrganizationDataService, type OrganizationData, type ComprehensiveOrganizationData } from './organization-data.service';
import { getSystemPrompt, type PromptContext } from './ai-prompts';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  department: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  chatContext?: string;
  metrics?: {
    current?: number;
    target?: number;
    change?: number;
    unit?: string;
  };
  timestamp: Date;
  expiresAt?: Date;
}

export interface DepartmentInsights {
  department: string;
  insights: AIInsight[];
  lastUpdated: Date;
  nextUpdate: Date;
}

export interface InsightRequest {
  organizationId: string;
  department?: string;
  userRole?: string;
  userName?: string;
  forceRefresh?: boolean;
}

export class AIInsightsService {
  private static instance: AIInsightsService;
  private insightsCache: Map<string, DepartmentInsights> = new Map();
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  private constructor() {
    // Use the singleton aiService instance
  }

  static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  /**
   * Generate insights for a specific department or all departments
   */
  async generateInsights(request: InsightRequest): Promise<DepartmentInsights[]> {
    try {
      const { organizationId, department, userRole, userName, forceRefresh = false } = request;
      
      console.log('🔍 Generating insights for:', { organizationId, department, userRole, userName, forceRefresh });
      
      // Get comprehensive organization data including notifications, meetings, procurements
      const organizationData = await OrganizationDataService.getComprehensiveOrganizationData(organizationId);
      console.log('📊 Organization data retrieved:', {
        name: organizationData.name,
        departments: organizationData.departments,
        employeeCount: organizationData.employeeCount,
        notifications: organizationData.notifications.length,
        meetings: organizationData.meetings.length,
        procurements: organizationData.procurements.length
      });
      
      // Determine which departments to generate insights for
      const departments = department 
        ? [department] 
        : organizationData.departments;

      console.log('🏢 Generating insights for departments:', departments);

      const results: DepartmentInsights[] = [];

      for (const dept of departments) {
        const cacheKey = `${organizationId}-${dept}`;
        const cached = this.insightsCache.get(cacheKey);
        
        // Check if we can use cached insights
        if (!forceRefresh && cached && this.isCacheValid(cached)) {
          console.log(`📋 Using cached insights for ${dept}`);
          results.push(cached);
          continue;
        }

        console.log(`🤖 Generating new insights for ${dept}...`);
        
        // Generate new insights
        const insights = await this.generateDepartmentInsights({
          organizationData,
          department: dept,
          userRole,
          userName
        });

        console.log(`✅ Generated ${insights.length} insights for ${dept}`);

        const departmentInsights: DepartmentInsights = {
          department: dept,
          insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + this.CACHE_DURATION)
        };

        // Cache the results
        this.insightsCache.set(cacheKey, departmentInsights);
        results.push(departmentInsights);
      }

      console.log(`🎉 Successfully generated insights for ${results.length} departments`);
      return results;
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      throw error;
    }
  }

  /**
   * Generate insights for a specific department
   */
  private async generateDepartmentInsights(params: {
    organizationData: ComprehensiveOrganizationData;
    department: string;
    userRole?: string;
    userName?: string;
  }): Promise<AIInsight[]> {
    const { organizationData, department, userRole, userName } = params;
    
    console.log(`🤖 Starting insight generation for ${department}...`);
    
    const promptContext: PromptContext = {
      userName: userName || 'User',
      organizationName: organizationData.name,
      userRole: userRole || 'employee',
      department: department
    };

    const systemPrompt = getSystemPrompt(promptContext);
    
    // Create department-specific analysis prompt with comprehensive data
    const analysisPrompt = this.createDepartmentAnalysisPrompt(department, organizationData);
    
    console.log(`📝 Analysis prompt length: ${analysisPrompt.length} characters`);
    
    try {
      console.log(`🤖 Calling AI service for ${department}...`);
      
      const response = await aiService.chat({
        message: analysisPrompt,
        context: {
          organization_name: organizationData.name,
          user_name: userName || 'User',
          user_role: userRole || 'employee',
          department: department,
          organization_id: organizationData.id
        },
        organization_id: organizationData.id
      });

      console.log(`✅ AI response received for ${department}, length: ${response.text.length}`);

      // Parse the AI response into structured insights
      const insights = this.parseInsightsFromResponse(response.text, department, organizationData);
      console.log(`📊 Parsed ${insights.length} insights for ${department}`);
      
      return insights;
    } catch (error) {
      console.error(`❌ Error generating insights for ${department}:`, error);
      console.log(`🔄 Falling back to default insights for ${department}`);
      return this.generateFallbackInsights(department, organizationData);
    }
  }

  /**
   * Create department-specific analysis prompts with comprehensive data
   */
  private createDepartmentAnalysisPrompt(department: string, organizationData: ComprehensiveOrganizationData): string {
    const deptStats = organizationData.departmentStats[department] || { count: 0, positions: [] };
    const deptSummary = organizationData.departmentSummaries.find(d => d.department === department);
    
    // Get department-specific data
    const deptNotifications = organizationData.notifications.filter(n => n.department === department);
    const deptMeetings = organizationData.meetings.filter(m => m.department === department);
    const deptProcurements = organizationData.procurements.filter(p => p.department === department);
    const deptAlerts = organizationData.alerts.filter(a => a.department === department);
    
    const basePrompt = `Analyze the current state of the ${department} department for ${organizationData.name} and provide actionable insights.

ORGANIZATION CONTEXT:
- Total Employees: ${organizationData.employeeCount}
- ${department} Department: ${deptStats.count} employees
- Positions: ${deptStats.positions.join(', ')}
- Recent Hires: ${organizationData.recentHires}
- Turnover Rate: ${organizationData.turnoverRate.toFixed(1)}%

DEPARTMENT-SPECIFIC DATA:
- Active Employees: ${deptSummary?.activeEmployees || 0}
- Pending Procurements: ${deptSummary?.pendingProcurements || 0}
- Upcoming Meetings: ${deptSummary?.upcomingMeetings || 0}
- Unread Notifications: ${deptSummary?.unreadNotifications || 0}
- Recent Activity: ${deptSummary?.recentActivity.length || 0} items

NOTIFICATIONS (${deptNotifications.length}):
${deptNotifications.map(n => `- ${n.title} (${n.priority} priority, ${n.isRead ? 'read' : 'unread'})`).join('\n')}

UPCOMING MEETINGS (${deptMeetings.filter(m => m.status === 'scheduled' && m.startTime > new Date()).length}):
${deptMeetings.filter(m => m.status === 'scheduled' && m.startTime > new Date()).map(m => 
  `- ${m.title} (${m.organizerName}, ${new Date(m.startTime).toLocaleString()})`
).join('\n')}

PENDING PROCUREMENTS (${deptProcurements.filter(p => p.status === 'pending').length}):
${deptProcurements.filter(p => p.status === 'pending').map(p => 
  `- ${p.title} ($${p.requestedAmount}, ${p.priority} priority, due: ${p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No due date'})`
).join('\n')}

ALERTS:
${deptAlerts.map(a => `- ${a.message} (${a.priority} priority)`).join('\n')}

RECENT ACTIVITY:
${organizationData.recentActivity.filter(a => a.department === department).slice(0, 5).map(a => 
  `- ${a.description} (${new Date(a.timestamp).toLocaleString()})`
).join('\n')}

Please provide 3-5 specific, actionable insights in the following format:

INSIGHT 1:
Title: [Brief, actionable title]
Description: [Detailed explanation with specific recommendations]
Type: [success/warning/info/error]
Priority: [high/medium/low]
Actionable: [true/false]
Metrics: [if applicable, include current metrics and targets]

INSIGHT 2:
[Continue format...]

Focus on:
- Immediate actionable items based on notifications and alerts
- Meeting and procurement management
- Performance optimization opportunities
- Risk mitigation
- Growth opportunities
- Process improvements
- Resource optimization
- Department-specific challenges and opportunities

Make insights specific to the ${department} department and the organization's current state, considering all the data provided above.`;

    return basePrompt;
  }

  /**
   * Parse AI response into structured insights
   */
  private parseInsightsFromResponse(response: string, department: string, organizationData: ComprehensiveOrganizationData): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Split response by "INSIGHT" sections
    const insightSections = response.split(/INSIGHT \d+:/i).filter(Boolean);
    
    insightSections.forEach((section, index) => {
      try {
        const insight = this.parseInsightSection(section, department, index);
        if (insight) {
          insights.push(insight);
        }
      } catch (error) {
        console.error(`Error parsing insight ${index}:`, error);
      }
    });

    // If parsing failed, generate fallback insights
    if (insights.length === 0) {
      return this.generateFallbackInsights(department, organizationData);
    }

    return insights;
  }

  /**
   * Parse individual insight section
   */
  private parseInsightSection(section: string, department: string, index: number): AIInsight | null {
    const lines = section.trim().split('\n').filter(line => line.trim());
    
    let title = '';
    let description = '';
    let type: 'success' | 'warning' | 'info' | 'error' = 'info';
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let actionable = false;
    let metrics: any = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Title:')) {
        title = trimmed.replace('Title:', '').trim();
      } else if (trimmed.startsWith('Description:')) {
        description = trimmed.replace('Description:', '').trim();
      } else if (trimmed.startsWith('Type:')) {
        const typeValue = trimmed.replace('Type:', '').trim().toLowerCase();
        if (['success', 'warning', 'info', 'error'].includes(typeValue)) {
          type = typeValue as any;
        }
      } else if (trimmed.startsWith('Priority:')) {
        const priorityValue = trimmed.replace('Priority:', '').trim().toLowerCase();
        if (['high', 'medium', 'low'].includes(priorityValue)) {
          priority = priorityValue as any;
        }
      } else if (trimmed.startsWith('Actionable:')) {
        actionable = trimmed.replace('Actionable:', '').trim().toLowerCase() === 'true';
      } else if (trimmed.startsWith('Metrics:')) {
        // Parse metrics if provided
        const metricsText = trimmed.replace('Metrics:', '').trim();
        if (metricsText) {
          // Simple metric parsing - can be enhanced
          const match = metricsText.match(/(\d+(?:\.\d+)?)/g);
          if (match && match.length >= 2) {
            metrics = {
              current: parseFloat(match[0]),
              target: parseFloat(match[1]),
              unit: metricsText.includes('%') ? '%' : ''
            };
          }
        }
      }
    }

    if (!title || !description) {
      return null;
    }

    return {
      id: `${department}-${index}-${Date.now()}`,
      title,
      description,
      type,
      department,
      priority,
      actionable,
      chatContext: `Discussing ${title} for ${department} department`,
      metrics: Object.keys(metrics).length > 0 ? metrics : undefined,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_DURATION)
    };
  }

  /**
   * Generate fallback insights when AI parsing fails
   */
  private generateFallbackInsights(department: string, organizationData: ComprehensiveOrganizationData): AIInsight[] {
    console.log(`🔄 Generating fallback insights for ${department}`);
    
    const deptStats = organizationData.departmentStats[department] || { count: 0, positions: [] };
    const deptSummary = organizationData.departmentSummaries.find(d => d.department === department);
    
    const fallbackInsights: AIInsight[] = [
      {
        id: `${department}-fallback-1-${Date.now()}`,
        title: `${department} Department Overview`,
        description: `The ${department} department has ${deptStats.count} employees with roles including ${deptStats.positions.slice(0, 3).join(', ')}. Consider reviewing team performance and resource allocation.`,
        type: 'info',
        department,
        priority: 'medium',
        actionable: true,
        chatContext: `Discussing ${department} department overview and performance`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION)
      }
    ];

    // Add insights based on comprehensive data
    if (deptSummary) {
      if (deptSummary.pendingProcurements > 0) {
        fallbackInsights.push({
          id: `${department}-fallback-procurement-${Date.now()}`,
          title: 'Pending Procurement Requests',
          description: `There are ${deptSummary.pendingProcurements} pending procurement requests in the ${department} department that require attention.`,
          type: 'warning',
          department,
          priority: 'medium',
          actionable: true,
          chatContext: `Discussing pending procurements for ${department} department`,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + this.CACHE_DURATION)
        });
      }

      if (deptSummary.upcomingMeetings > 0) {
        fallbackInsights.push({
          id: `${department}-fallback-meetings-${Date.now()}`,
          title: 'Upcoming Meetings',
          description: `There are ${deptSummary.upcomingMeetings} upcoming meetings scheduled for the ${department} department.`,
          type: 'info',
          department,
          priority: 'low',
          actionable: true,
          chatContext: `Discussing upcoming meetings for ${department} department`,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + this.CACHE_DURATION)
        });
      }

      if (deptSummary.unreadNotifications > 0) {
        fallbackInsights.push({
          id: `${department}-fallback-notifications-${Date.now()}`,
          title: 'Unread Notifications',
          description: `There are ${deptSummary.unreadNotifications} unread notifications in the ${department} department that may require attention.`,
          type: 'warning',
          department,
          priority: 'medium',
          actionable: true,
          chatContext: `Discussing unread notifications for ${department} department`,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + this.CACHE_DURATION)
        });
      }
    }

    if (deptStats.count === 0) {
      fallbackInsights.push({
        id: `${department}-fallback-2-${Date.now()}`,
        title: 'Department Staffing Needed',
        description: `The ${department} department currently has no assigned employees. Consider hiring or reassigning staff to this department.`,
        type: 'warning',
        department,
        priority: 'high',
        actionable: true,
        chatContext: `Discussing staffing needs for ${department} department`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION)
      });
    }

    // Always ensure we have at least one insight
    if (fallbackInsights.length === 0) {
      fallbackInsights.push({
        id: `${department}-fallback-default-${Date.now()}`,
        title: `${department} Department Status`,
        description: `The ${department} department is operational. Monitor performance and address any emerging issues.`,
        type: 'info',
        department,
        priority: 'low',
        actionable: true,
        chatContext: `Discussing ${department} department status`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION)
      });
    }

    console.log(`✅ Generated ${fallbackInsights.length} fallback insights for ${department}`);
    return fallbackInsights;
  }

  /**
   * Check if cached insights are still valid
   */
  private isCacheValid(cached: DepartmentInsights): boolean {
    return cached.lastUpdated.getTime() + this.CACHE_DURATION > Date.now();
  }

  /**
   * Get insights for a specific department
   */
  async getDepartmentInsights(organizationId: string, department: string, forceRefresh = false): Promise<DepartmentInsights | null> {
    const results = await this.generateInsights({
      organizationId,
      department,
      forceRefresh
    });
    
    return results.find(result => result.department === department) || null;
  }

  /**
   * Get all insights for an organization
   */
  async getAllInsights(organizationId: string, forceRefresh = false): Promise<DepartmentInsights[]> {
    return await this.generateInsights({
      organizationId,
      forceRefresh
    });
  }

  /**
   * Clear cache for an organization
   */
  clearCache(organizationId: string): void {
    const keys = Array.from(this.insightsCache.keys());
    for (const key of keys) {
      if (key.startsWith(organizationId)) {
        this.insightsCache.delete(key);
      }
    }
  }
} 
import axios from 'axios';
import { 
  getSystemPrompt, 
  getBusinessAnalysisPrompt, 
  getHRAnalysisPrompt,
  getFinancialAnalysisPrompt,
  getSalesAnalysisPrompt,
  getInventoryAnalysisPrompt,
  type PromptContext 
} from './ai-prompts';
import { OrganizationDataService, type OrganizationData, type ComprehensiveOrganizationData } from './organization-data.service';

interface ChatRequest {
  message: string;
  context?: any;
  conversation_history?: any[];
  user_role?: string;
  organization_id?: string;
  department?: string;
}

interface ChatResponse {
  text: string;
  context?: any;
  suggestions?: string[];
  confidence?: number;
  timestamp: Date;
}

interface BusinessInsightRequest {
  organization_id: string;
  data_type: string;
  time_period?: string;
  specific_metrics?: string[];
  context?: any;
}

interface BusinessInsightResponse {
  insights: string[];
  recommendations: string[];
  metrics?: any;
  risk_alerts?: string[];
  opportunities?: string[];
  confidence_score: number;
  timestamp: Date;
}

interface HRInsightRequest {
  organization_id: string;
  insight_type: string;
  employee_data?: any;
  time_period?: string;
  context?: any;
}

interface HRInsightResponse {
  insights: string[];
  recommendations: string[];
  employee_suggestions?: any[];
  training_needs?: string[];
  retention_risks?: string[];
  hiring_recommendations?: string[];
  confidence_score: number;
  timestamp: Date;
}

class AIService {
  private groqApiKey: string;
  private groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private modelName = 'llama3-8b-8192';

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    if (!this.groqApiKey) {
      console.warn('⚠️  GROQ_API_KEY not found. AI features will not work.');
    }
  }

  private getSystemPrompt(context?: any): string {
    const promptContext: PromptContext = {
      userName: context?.user_name || context?.userName,
      organizationName: context?.organization_name || context?.organizationName,
      userRole: context?.user_role || context?.userRole,
      department: context?.department
    };
    
    return getSystemPrompt(promptContext);
  }

  private async callGroqAPI(messages: any[]): Promise<string> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await axios.post(this.groqApiUrl, {
        model: this.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.context);
      
      // Debug logging
      console.log('🧠 AI Service Debug:');
      console.log('  System Prompt:', systemPrompt);
      console.log('  Request Context:', request.context);
      
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Get comprehensive organization data including notifications, meetings, procurements
      let organizationData: ComprehensiveOrganizationData | null = null;
      try {
        if (request.organization_id) {
          organizationData = await OrganizationDataService.getComprehensiveOrganizationData(request.organization_id);
          console.log('📊 Comprehensive Organization Data Retrieved:', {
            name: organizationData.name,
            employeeCount: organizationData.employeeCount,
            departments: organizationData.departments,
            recentHires: organizationData.recentHires,
            turnoverRate: organizationData.turnoverRate,
            notifications: organizationData.notifications.length,
            meetings: organizationData.meetings.length,
            procurements: organizationData.procurements.length,
            alerts: organizationData.alerts.length
          });
        }
      } catch (error) {
        console.error('⚠️ Error fetching organization data:', error);
        // Continue without organization data if there's an error
      }

      // Add comprehensive organization data context if available
      if (organizationData) {
        const dataContext = `\n\nCOMPREHENSIVE ORGANIZATION DATA CONTEXT:
Organization: ${organizationData.name}
Total Employees: ${organizationData.employeeCount}
Active Employees: ${organizationData.activeEmployees}
Departments: ${organizationData.departments.join(', ')}
Recent Hires (30 days): ${organizationData.recentHires}
Turnover Rate: ${organizationData.turnoverRate.toFixed(1)}%
${organizationData.averageSalary ? `Average Salary: $${organizationData.averageSalary.toLocaleString()}` : ''}
${organizationData.totalPayroll ? `Total Payroll: $${organizationData.totalPayroll.toLocaleString()}` : ''}

Department Breakdown:
${Object.entries(organizationData.departmentStats).map(([dept, stats]) => 
  `${dept}: ${stats.count} employees (${stats.positions.join(', ')})`
).join('\n')}

NOTIFICATIONS (${organizationData.notifications.length}):
${organizationData.notifications.slice(0, 5).map(n => 
  `- ${n.title} (${n.priority} priority, ${n.isRead ? 'read' : 'unread'}, ${n.department || 'general'})`
).join('\n')}

UPCOMING MEETINGS (${organizationData.meetings.filter(m => m.status === 'scheduled' && m.startTime > new Date()).length}):
${organizationData.meetings.filter(m => m.status === 'scheduled' && m.startTime > new Date()).slice(0, 5).map(m => 
  `- ${m.title} (${m.organizerName}, ${new Date(m.startTime).toLocaleString()}, ${m.department || 'general'})`
).join('\n')}

PENDING PROCUREMENTS (${organizationData.procurements.filter(p => p.status === 'pending').length}):
${organizationData.procurements.filter(p => p.status === 'pending').slice(0, 5).map(p => 
  `- ${p.title} ($${p.requestedAmount}, ${p.priority} priority, ${p.department})`
).join('\n')}

ALERTS:
${organizationData.alerts.slice(0, 5).map(a => 
  `- ${a.message} (${a.priority} priority, ${a.department || 'general'})`
).join('\n')}

RECENT ACTIVITY:
${organizationData.recentActivity.slice(0, 5).map(a => 
  `- ${a.description} (${new Date(a.timestamp).toLocaleString()}, ${a.department || 'general'})`
).join('\n')}

IMPORTANT: Use this real data when answering questions about the organization. You have access to notifications, meetings, procurements, and recent activity. Consider this context when providing advice and insights.

CRITICAL: Do NOT generate fake meetings, notifications, or procurements. Only reference the actual data provided above. If asked about meetings, notifications, or procurements that are not in this data, say "I don't have any [meetings/notifications/procurements] data available at the moment."`;

        messages[0].content += dataContext;
      }

      // Add conversation history if provided
      if (request.conversation_history) {
        for (const msg of request.conversation_history.slice(-5)) {
          if (msg.sender === 'user') {
            messages.push({ role: 'user', content: msg.text });
          } else {
            messages.push({ role: 'assistant', content: msg.text });
          }
        }
      }

      // Add detailed context information
      if (request.context) {
        const contextInfo = `Current Session Context:
- Organization: ${request.context.organization_name || 'Chains ERP'}
- User: ${request.context.user_name || 'Unknown User'}
- User Role: ${request.context.user_role || 'User'}
- Department: ${request.context.department || 'General'}
- User ID: ${request.context.user_id || 'Unknown'}

Remember this context for the entire conversation and always address the user by their name when appropriate.`;
        messages.push({ role: 'system', content: contextInfo });
      }

      // Add current user message
      messages.push({ role: 'user', content: request.message });

      const aiResponse = await this.callGroqAPI(messages);
      
      // Generate suggestions based on the conversation
      const suggestions = this.generateSuggestions(request.message, aiResponse, request.context);

      return {
        text: aiResponse,
        context: request.context,
        suggestions,
        confidence: 0.85,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Chat Error:', error);
      return {
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        context: request.context,
        suggestions: ['Try rephrasing your question', 'Check your internet connection'],
        confidence: 0.0,
        timestamp: new Date()
      };
    }
  }

  async businessInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      const promptContext: PromptContext = {
        userName: request.context?.user_name || request.context?.userName,
        organizationName: request.context?.organization_name || request.context?.organizationName,
        userRole: request.context?.user_role || request.context?.userRole,
        department: request.context?.department
      };

      // Get real organization data
      let organizationData: OrganizationData | null = null;
      let financialData: any = null;
      
      try {
        if (request.organization_id) {
          organizationData = await OrganizationDataService.getOrganizationData(request.organization_id);
          financialData = await OrganizationDataService.getFinancialData(request.organization_id);
          
          console.log('📊 Business Data Retrieved:', {
            organizationName: organizationData.name,
            employeeCount: organizationData.employeeCount,
            departments: organizationData.departments,
            totalPayroll: financialData?.totalPayroll,
            averageSalary: financialData?.averageSalary
          });
        }
      } catch (error) {
        console.error('⚠️ Error fetching business data:', error);
      }

      const systemPrompt = `You are a Business Intelligence AI specializing in business analysis. Analyze the provided data and provide:
- Key business insights and trends
- Strategic recommendations for improvement
- Performance metrics interpretation
- Risk assessment and alerts
- Opportunities for growth

Provide actionable, data-driven insights.`;

      let analysisPrompt = getBusinessAnalysisPrompt(promptContext, request);

      // Add real data to the analysis prompt
      if (organizationData) {
        const businessDataContext = `\n\nREAL ORGANIZATION DATA:
Organization: ${organizationData.name}
Industry: ${organizationData.industry}
Type: ${organizationData.type}
Total Employees: ${organizationData.employeeCount}
Active Employees: ${organizationData.activeEmployees}
Departments: ${organizationData.departments.join(', ')}
Recent Hires (30 days): ${organizationData.recentHires}
Turnover Rate: ${organizationData.turnoverRate.toFixed(1)}%
${organizationData.averageSalary ? `Average Salary: $${organizationData.averageSalary.toLocaleString()}` : ''}
${organizationData.totalPayroll ? `Total Payroll: $${organizationData.totalPayroll.toLocaleString()}` : ''}

Department Breakdown:
${Object.entries(organizationData.departmentStats).map(([dept, stats]) => 
  `${dept}: ${stats.count} employees (${stats.positions.join(', ')})`
).join('\n')}

${financialData ? `Financial Data:
Total Payroll: $${financialData.totalPayroll.toLocaleString()}
Average Salary: $${financialData.averageSalary.toLocaleString()}
Salary Distribution: ${Object.entries(financialData.salaryDistribution).map(([range, count]) => `${range}: ${count} employees`).join(', ')}` : ''}

IMPORTANT: Use this real data when providing business insights. Do not make up or guess any numbers.`;

        analysisPrompt += businessDataContext;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ];

      const aiResponse = await this.callGroqAPI(messages);
      
      // Parse the response into structured format
      const { insights, recommendations, risk_alerts, opportunities } = this.parseBusinessResponse(aiResponse);

      return {
        insights,
        recommendations,
        risk_alerts,
        opportunities,
        confidence_score: 0.88,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Business Insights Error:', error);
      return {
        insights: ['Unable to generate business insights at this time'],
        recommendations: ['Please try again later'],
        confidence_score: 0.0,
        timestamp: new Date()
      };
    }
  }

  async hrInsights(request: HRInsightRequest): Promise<HRInsightResponse> {
    try {
      const promptContext: PromptContext = {
        userName: request.context?.user_name || request.context?.userName,
        organizationName: request.context?.organization_name || request.context?.organizationName,
        userRole: request.context?.user_role || request.context?.userRole,
        department: request.context?.department
      };

      // Get real organization and employee data
      let organizationData: OrganizationData | null = null;
      let employeeData: any[] = [];
      
      try {
        if (request.organization_id) {
          organizationData = await OrganizationDataService.getOrganizationData(request.organization_id);
          employeeData = await OrganizationDataService.getEmployeeData(request.organization_id);
          
          console.log('📊 HR Data Retrieved:', {
            organizationName: organizationData.name,
            employeeCount: organizationData.employeeCount,
            activeEmployees: organizationData.activeEmployees,
            recentHires: organizationData.recentHires,
            turnoverRate: organizationData.turnoverRate,
            employeeDataCount: employeeData.length
          });
        }
      } catch (error) {
        console.error('⚠️ Error fetching HR data:', error);
      }

      const systemPrompt = `You are an HR AI assistant specializing in HR analysis. Analyze the provided data and provide:
- Employee performance insights
- HR strategy recommendations
- Training and development needs
- Retention and engagement strategies
- Hiring and recruitment insights

Provide actionable HR insights and recommendations.`;

      let analysisPrompt = getHRAnalysisPrompt(promptContext, request);

      // Add real data to the analysis prompt
      if (organizationData) {
        const hrDataContext = `\n\nREAL ORGANIZATION DATA:
Organization: ${organizationData.name}
Total Employees: ${organizationData.employeeCount}
Active Employees: ${organizationData.activeEmployees}
Recent Hires (30 days): ${organizationData.recentHires}
Turnover Rate: ${organizationData.turnoverRate.toFixed(1)}%
${organizationData.averageSalary ? `Average Salary: $${organizationData.averageSalary.toLocaleString()}` : ''}

Department Breakdown:
${Object.entries(organizationData.departmentStats).map(([dept, stats]) => 
  `${dept}: ${stats.count} employees (${stats.positions.join(', ')})`
).join('\n')}

Employee Sample Data (${employeeData.length} employees):
${employeeData.slice(0, 10).map(emp => 
  `- ${emp.firstName} ${emp.lastName} (${emp.department}, ${emp.position}, ${emp.status})`
).join('\n')}

IMPORTANT: Use this real data when providing HR insights. Do not make up or guess any numbers.`;

        analysisPrompt += hrDataContext;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ];

      const aiResponse = await this.callGroqAPI(messages);
      
      // Parse the response into structured format
      const { insights, recommendations, employee_suggestions, training_needs, retention_risks, hiring_recommendations } = this.parseHRResponse(aiResponse);

      return {
        insights,
        recommendations,
        employee_suggestions,
        training_needs,
        retention_risks,
        hiring_recommendations,
        confidence_score: 0.87,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('HR Insights Error:', error);
      return {
        insights: ['Unable to generate HR insights at this time'],
        recommendations: ['Please try again later'],
        confidence_score: 0.0,
        timestamp: new Date()
      };
    }
  }

  // Department-specific analysis methods
  async financialInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      const promptContext: PromptContext = {
        userName: request.context?.user_name || request.context?.userName,
        organizationName: request.context?.organization_name || request.context?.organizationName,
        userRole: request.context?.user_role || request.context?.userRole,
        department: request.context?.department
      };

      const systemPrompt = `You are a Financial AI assistant specializing in financial analysis. Analyze the provided data and provide:
- Financial performance insights
- Cost optimization recommendations
- Financial risk assessment
- Investment and growth strategies
- Compliance and regulatory guidance

Provide actionable financial insights and recommendations.`;

      const analysisPrompt = getFinancialAnalysisPrompt(promptContext, request);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ];

      const aiResponse = await this.callGroqAPI(messages);
      
      // Parse the response into structured format
      const { insights, recommendations, risk_alerts, opportunities } = this.parseBusinessResponse(aiResponse);

      return {
        insights,
        recommendations,
        risk_alerts,
        opportunities,
        confidence_score: 0.89,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Financial Insights Error:', error);
      return {
        insights: ['Unable to generate financial insights at this time'],
        recommendations: ['Please try again later'],
        confidence_score: 0.0,
        timestamp: new Date()
      };
    }
  }

  async salesInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      const promptContext: PromptContext = {
        userName: request.context?.user_name || request.context?.userName,
        organizationName: request.context?.organization_name || request.context?.organizationName,
        userRole: request.context?.user_role || request.context?.userRole,
        department: request.context?.department
      };

      const systemPrompt = `You are a Sales AI assistant specializing in sales analysis. Analyze the provided data and provide:
- Sales performance insights
- Customer analysis and segmentation
- Market and competitive analysis
- Sales strategy recommendations
- Revenue optimization strategies

Provide actionable sales insights and recommendations.`;

      const analysisPrompt = getSalesAnalysisPrompt(promptContext, request);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ];

      const aiResponse = await this.callGroqAPI(messages);
      
      // Parse the response into structured format
      const { insights, recommendations, risk_alerts, opportunities } = this.parseBusinessResponse(aiResponse);

      return {
        insights,
        recommendations,
        risk_alerts,
        opportunities,
        confidence_score: 0.88,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sales Insights Error:', error);
      return {
        insights: ['Unable to generate sales insights at this time'],
        recommendations: ['Please try again later'],
        confidence_score: 0.0,
        timestamp: new Date()
      };
    }
  }

  async inventoryInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      const promptContext: PromptContext = {
        userName: request.context?.user_name || request.context?.userName,
        organizationName: request.context?.organization_name || request.context?.organizationName,
        userRole: request.context?.user_role || request.context?.userRole,
        department: request.context?.department
      };

      const systemPrompt = `You are an Inventory AI assistant specializing in inventory analysis. Analyze the provided data and provide:
- Inventory performance insights
- Supply chain optimization recommendations
- Demand forecasting analysis
- Warehouse operations insights
- Cost and quality management strategies

Provide actionable inventory insights and recommendations.`;

      const analysisPrompt = getInventoryAnalysisPrompt(promptContext, request);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ];

      const aiResponse = await this.callGroqAPI(messages);
      
      // Parse the response into structured format
      const { insights, recommendations, risk_alerts, opportunities } = this.parseBusinessResponse(aiResponse);

      return {
        insights,
        recommendations,
        risk_alerts,
        opportunities,
        confidence_score: 0.87,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Inventory Insights Error:', error);
      return {
        insights: ['Unable to generate inventory insights at this time'],
        recommendations: ['Please try again later'],
        confidence_score: 0.0,
        timestamp: new Date()
      };
    }
  }

  private generateSuggestions(userMessage: string, aiResponse: string, context?: any): string[] {
    const suggestions = [];
    
    // Basic suggestions based on common patterns
    if (userMessage.toLowerCase().includes('performance')) {
      suggestions.push('View detailed performance metrics', 'Generate performance reports', 'Set up performance alerts');
    }
    
    if (userMessage.toLowerCase().includes('employee') || userMessage.toLowerCase().includes('hr')) {
      suggestions.push('Review employee data', 'Generate HR reports', 'Check hiring pipeline');
    }
    
    if (userMessage.toLowerCase().includes('financial') || userMessage.toLowerCase().includes('budget')) {
      suggestions.push('View financial dashboard', 'Generate budget reports', 'Analyze cost trends');
    }
    
    if (userMessage.toLowerCase().includes('inventory') || userMessage.toLowerCase().includes('stock')) {
      suggestions.push('Check inventory levels', 'View stock alerts', 'Generate inventory reports');
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Ask for more specific insights', 'Request a detailed report', 'Get recommendations for improvement');
    }
    
    return suggestions.slice(0, 3);
  }

  private parseBusinessResponse(response: string): { insights: string[], recommendations: string[], risk_alerts: string[], opportunities: string[] } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const risk_alerts: string[] = [];
    const opportunities: string[] = [];
    
    // Simple parsing logic
    const lines = response.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.toLowerCase().includes('insight') || trimmedLine.toLowerCase().includes('trend')) {
        currentSection = 'insights';
      } else if (trimmedLine.toLowerCase().includes('recommendation') || trimmedLine.toLowerCase().includes('suggestion')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.toLowerCase().includes('risk') || trimmedLine.toLowerCase().includes('alert')) {
        currentSection = 'risks';
      } else if (trimmedLine.toLowerCase().includes('opportunity') || trimmedLine.toLowerCase().includes('improvement')) {
        currentSection = 'opportunities';
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.substring(1).trim();
        switch (currentSection) {
          case 'insights':
            insights.push(content);
            break;
          case 'recommendations':
            recommendations.push(content);
            break;
          case 'risks':
            risk_alerts.push(content);
            break;
          case 'opportunities':
            opportunities.push(content);
            break;
        }
      }
    }
    
    // If no structured sections found, treat the whole response as insights
    if (insights.length === 0 && recommendations.length === 0) {
      insights.push(response.length > 500 ? response.substring(0, 500) + '...' : response);
    }
    
    return { insights, recommendations, risk_alerts, opportunities };
  }

  private parseHRResponse(response: string): { insights: string[], recommendations: string[], employee_suggestions: any[], training_needs: string[], retention_risks: string[], hiring_recommendations: string[] } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const employee_suggestions: any[] = [];
    const training_needs: string[] = [];
    const retention_risks: string[] = [];
    const hiring_recommendations: string[] = [];
    
    // Simple parsing logic
    const lines = response.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.toLowerCase().includes('insight') || trimmedLine.toLowerCase().includes('trend')) {
        currentSection = 'insights';
      } else if (trimmedLine.toLowerCase().includes('recommendation') || trimmedLine.toLowerCase().includes('suggestion')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.toLowerCase().includes('employee') || trimmedLine.toLowerCase().includes('individual')) {
        currentSection = 'employee_suggestions';
      } else if (trimmedLine.toLowerCase().includes('training') || trimmedLine.toLowerCase().includes('development')) {
        currentSection = 'training_needs';
      } else if (trimmedLine.toLowerCase().includes('retention') || trimmedLine.toLowerCase().includes('risk')) {
        currentSection = 'retention_risks';
      } else if (trimmedLine.toLowerCase().includes('hiring') || trimmedLine.toLowerCase().includes('recruitment')) {
        currentSection = 'hiring_recommendations';
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.substring(1).trim();
        switch (currentSection) {
          case 'insights':
            insights.push(content);
            break;
          case 'recommendations':
            recommendations.push(content);
            break;
          case 'employee_suggestions':
            employee_suggestions.push({ suggestion: content, type: 'general' });
            break;
          case 'training_needs':
            training_needs.push(content);
            break;
          case 'retention_risks':
            retention_risks.push(content);
            break;
          case 'hiring_recommendations':
            hiring_recommendations.push(content);
            break;
        }
      }
    }
    
    // If no structured sections found, treat the whole response as insights
    if (insights.length === 0 && recommendations.length === 0) {
      insights.push(response.length > 500 ? response.substring(0, 500) + '...' : response);
    }
    
    return { insights, recommendations, employee_suggestions, training_needs, retention_risks, hiring_recommendations };
  }
}

export const aiService = new AIService(); 
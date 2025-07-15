# AI Prompts Documentation

## Overview

The AI system uses a modular prompt structure located in `server/services/ai-prompts.ts`. This file contains all system prompts and analysis prompts organized by department and function, making it easy to extend and customize the AI's behavior.

## File Structure

```
server/services/
├── ai-prompts.ts          # Main prompts file
└── ai-service.ts          # AI service using the prompts

server/routes/
└── ai.ts                  # API routes for different AI endpoints
```

## Core Components

### 1. PromptContext Interface

```typescript
interface PromptContext {
  userName?: string;
  organizationName?: string;
  userRole?: string;
  department?: string;
}
```

This interface defines the context passed to all prompt functions for personalization.

### 2. System Prompts

#### Base System Prompt
- **Function**: `createBasePrompt(context: PromptContext)`
- **Purpose**: Creates the foundation prompt with user and organization context
- **Usage**: Called by all department-specific prompts

#### Department-Specific System Prompts
- **Function**: `getSystemPrompt(context: PromptContext)`
- **Departments Supported**:
  - **Owner**: Strategic business decisions and planning
  - **HR**: Employee management, hiring, training, retention
  - **Finance/Accounting**: Financial analysis, budgeting, compliance
  - **Inventory/Warehouse**: Stock management, supply chain, operations
  - **Sales/CRM**: Sales strategy, customer management, revenue optimization
  - **Marketing**: Brand development, campaigns, market analysis
  - **IT/Technology**: Infrastructure, cybersecurity, digital transformation
  - **Operations**: Process optimization, quality management, efficiency

### 3. Analysis Prompts

Each department has specialized analysis prompts:

#### Business Analysis
- **Function**: `getBusinessAnalysisPrompt(context, request)`
- **Sections**:
  - Key Insights and Trends
  - Strategic Recommendations
  - Risk Assessment
  - Opportunities for Growth
  - Actionable Next Steps

#### HR Analysis
- **Function**: `getHRAnalysisPrompt(context, request)`
- **Sections**:
  - HR Insights and Trends
  - Strategic HR Recommendations
  - Employee-Specific Suggestions
  - Training and Development Needs
  - Retention and Engagement
  - Hiring and Recruitment

#### Financial Analysis
- **Function**: `getFinancialAnalysisPrompt(context, request)`
- **Sections**:
  - Financial Performance Overview
  - Cost Analysis and Optimization
  - Financial Risk Assessment
  - Strategic Financial Recommendations
  - Compliance and Regulatory

#### Sales Analysis
- **Function**: `getSalesAnalysisPrompt(context, request)`
- **Sections**:
  - Sales Performance Overview
  - Customer Analysis
  - Market and Competitive Analysis
  - Sales Strategy Recommendations
  - Revenue Optimization

#### Inventory Analysis
- **Function**: `getInventoryAnalysisPrompt(context, request)`
- **Sections**:
  - Inventory Performance Overview
  - Supply Chain Optimization
  - Demand Forecasting
  - Warehouse Operations
  - Cost and Quality Management

## API Endpoints

### Chat Endpoint
- **Route**: `POST /api/ai/chat`
- **Purpose**: General AI chat with context-aware responses
- **Context**: User role, organization, department, conversation history

### Business Insights
- **Route**: `POST /api/ai/insights/business`
- **Purpose**: General business analysis and insights

### Department-Specific Insights
- **HR**: `POST /api/ai/insights/hr`
- **Financial**: `POST /api/ai/insights/financial`
- **Sales**: `POST /api/ai/insights/sales`
- **Inventory**: `POST /api/ai/insights/inventory`

## How to Extend

### Adding a New Department

1. **Add to System Prompts**:
```typescript
// In getSystemPrompt function
case 'new_department':
  return basePrompt + `As a New Department AI assistant for ${organizationName}, you help ${userName} with:
- Specific capability 1
- Specific capability 2
- Specific capability 3

Provide specialized advice for ${organizationName}'s needs.`;
```

2. **Create Analysis Prompt**:
```typescript
export const getNewDepartmentAnalysisPrompt = (context: PromptContext, request: {
  data_type: string;
  time_period?: string;
  organization_id: string;
  specific_metrics?: string[];
}): string => {
  const { organizationName = 'Unknown Organization' } = context;
  
  return `You are a New Department AI assistant specializing in analysis for ${organizationName}.

Analyze the following data and provide comprehensive insights:

Data Type: ${request.data_type}
Time Period: ${request.time_period || 'Recent'}
Organization: ${organizationName}

${request.specific_metrics ? `Specific Metrics: ${request.specific_metrics.join(', ')}` : ''}

Please provide a structured analysis with the following sections:

1. **Key Insights and Trends**
2. **Strategic Recommendations**
3. **Risk Assessment**
4. **Opportunities for Growth**
5. **Actionable Next Steps**

Format your response with clear headings and bullet points.`;
};
```

3. **Add to AI Service**:
```typescript
// In ai-service.ts
async newDepartmentInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
  // Implementation similar to other department methods
}
```

4. **Add API Route**:
```typescript
// In ai.ts
router.post('/insights/new_department', isAuthenticated, async (req: Request, res: Response) => {
  // Implementation similar to other department routes
});
```

### Adding New Analysis Types

1. **Create New Analysis Function**:
```typescript
export const getCustomAnalysisPrompt = (context: PromptContext, request: CustomRequest): string => {
  // Custom analysis prompt implementation
};
```

2. **Add to AI Service**:
```typescript
async customAnalysis(request: CustomRequest): Promise<CustomResponse> {
  // Implementation
}
```

3. **Add API Route**:
```typescript
router.post('/analysis/custom', isAuthenticated, async (req: Request, res: Response) => {
  // Implementation
});
```

## Best Practices

### 1. Context Personalization
- Always use the `PromptContext` interface
- Include user name and organization name in prompts
- Reference the user's role and department

### 2. Structured Responses
- Use clear section headers
- Include bullet points for readability
- Provide actionable recommendations

### 3. Error Handling
- Include fallback responses for each department
- Log errors for debugging
- Return structured error responses

### 4. Performance
- Keep prompts concise but comprehensive
- Use template literals for dynamic content
- Cache frequently used prompts if needed

## Example Usage

### Frontend Integration
```typescript
// In React component
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    context: {
      userRole: user.role,
      organizationId: user.organizationId,
      department: user.department,
      userName: user.name,
      organizationName: user.organization.name
    },
    conversation_history: messages
  })
});
```

### Department-Specific Analysis
```typescript
// HR Analysis
const hrResponse = await fetch('/api/ai/insights/hr', {
  method: 'POST',
  body: JSON.stringify({
    insight_type: 'performance_review',
    time_period: 'last_quarter',
    employee_data: employeeData
  })
});

// Financial Analysis
const financialResponse = await fetch('/api/ai/insights/financial', {
  method: 'POST',
  body: JSON.stringify({
    data_type: 'financial_performance',
    time_period: 'last_month',
    specific_metrics: ['revenue', 'expenses', 'profit_margin']
  })
});
```

## Maintenance

### Updating Prompts
1. Edit the relevant function in `ai-prompts.ts`
2. Test with different user contexts
3. Verify response quality and structure
4. Update documentation if needed

### Adding New Capabilities
1. Identify the department or analysis type
2. Follow the extension pattern above
3. Test thoroughly with various inputs
4. Update API documentation

### Monitoring
- Log prompt usage and response quality
- Monitor API response times
- Track user satisfaction with responses
- A/B test different prompt variations

## Troubleshooting

### Common Issues

1. **"Unknown Organization" in responses**
   - Check that `organizationName` is being passed correctly
   - Verify the context object structure
   - Ensure the user object has organization data

2. **Generic responses**
   - Verify the department is being detected correctly
   - Check that the system prompt is being applied
   - Ensure the context includes all necessary fields

3. **Missing personalization**
   - Confirm `userName` is being passed
   - Check that the user role is correct
   - Verify the department mapping

### Debug Steps
1. Check the console logs for context information
2. Verify the prompt being sent to the AI
3. Test with different user roles and departments
4. Compare responses across different contexts 
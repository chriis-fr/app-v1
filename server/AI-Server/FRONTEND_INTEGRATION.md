# Frontend Integration Guide

This guide explains how to integrate the Python AI service with your existing React frontend.

## Overview

Your existing React components (`AIChatBox.tsx`, `AIFloatingButton.tsx`, etc.) need to be updated to call the new Python AI service instead of the Node.js endpoints.

## Required Changes

### 1. Update API Configuration

Create a new API configuration for the AI service:

```typescript
// client/src/lib/aiApi.ts
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export const aiApi = {
  async chat(request: {
    message: string;
    context?: any;
    userRole?: string;
    organizationId?: string;
    department?: string;
  }) {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: request.message,
        context: request.context,
        user_role: request.userRole,
        organization_id: request.organizationId,
        department: request.department,
      }),
    });

    if (!response.ok) {
      throw new Error('AI service error');
    }

    return response.json();
  },

  async businessInsights(request: {
    organizationId: string;
    dataType: string;
    timePeriod?: string;
    specificMetrics?: string[];
  }) {
    const response = await fetch(`${AI_SERVICE_URL}/api/insights/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: request.organizationId,
        data_type: request.dataType,
        time_period: request.timePeriod,
        specific_metrics: request.specificMetrics,
      }),
    });

    if (!response.ok) {
      throw new Error('Business insights error');
    }

    return response.json();
  },

  async hrInsights(request: {
    organizationId: string;
    insightType: string;
    timePeriod?: string;
    employeeData?: any;
  }) {
    const response = await fetch(`${AI_SERVICE_URL}/api/insights/hr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: request.organizationId,
        insight_type: request.insightType,
        time_period: request.timePeriod,
        employee_data: request.employeeData,
      }),
    });

    if (!response.ok) {
      throw new Error('HR insights error');
    }

    return response.json();
  },
};
```

### 2. Update AIChatBox.tsx

Replace the existing API call in `AIChatBox.tsx`:

```typescript
// client/src/components/ai/AIChatBox.tsx
// Replace the existing fetch call with:

import { aiApi } from '@/lib/aiApi';

// In the handleSendMessage function:
try {
  const aiResponse = await aiApi.chat({
    message: inputValue,
    context: {
      userRole,
      organizationId,
      department: user?.department,
    },
  });

  setMessages(prev => 
    prev.map(msg => 
      msg.id === aiMessage.id 
        ? { ...msg, text: aiResponse.text, isLoading: false }
        : msg
    )
  );
} catch (error) {
  console.error('Error getting AI response:', error);
  setMessages(prev => 
    prev.map(msg => 
      msg.id === aiMessage.id 
        ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
        : msg
    )
  );
}
```

### 3. Update Environment Variables

Add the AI service URL to your environment:

```env
# client/.env.local
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.onrender.com
```

### 4. Create New AI Components (Optional)

You can create new components for business and HR insights:

```typescript
// client/src/components/ai/BusinessInsights.tsx
import { useState } from 'react';
import { aiApi } from '@/lib/aiApi';

export function BusinessInsights({ organizationId }: { organizationId: string }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const result = await aiApi.businessInsights({
        organizationId,
        dataType: 'financial',
        timePeriod: 'last_quarter',
      });
      setInsights(result);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generateInsights} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Business Insights'}
      </button>
      {insights && (
        <div>
          <h3>Insights</h3>
          <ul>
            {insights.insights.map((insight: string, index: number) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
          <h3>Recommendations</h3>
          <ul>
            {insights.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

```typescript
// client/src/components/ai/HRInsights.tsx
import { useState } from 'react';
import { aiApi } from '@/lib/aiApi';

export function HRInsights({ organizationId }: { organizationId: string }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateHRInsights = async () => {
    setLoading(true);
    try {
      const result = await aiApi.hrInsights({
        organizationId,
        insightType: 'performance',
        timePeriod: 'last_month',
      });
      setInsights(result);
    } catch (error) {
      console.error('Error generating HR insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generateHRInsights} disabled={loading}>
        {loading ? 'Generating...' : 'Generate HR Insights'}
      </button>
      {insights && (
        <div>
          <h3>HR Insights</h3>
          <ul>
            {insights.insights.map((insight: string, index: number) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
          <h3>Recommendations</h3>
          <ul>
            {insights.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 5. Update Package.json Scripts

Add scripts for running both services:

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:ai\"",
    "dev:frontend": "next dev",
    "dev:ai": "cd server/AI-Server && python start.py"
  }
}
```

## Testing the Integration

1. **Start the AI service:**
   ```bash
   cd server/AI-Server
   python start.py
   ```

2. **Start your React frontend:**
   ```bash
   npm run dev
   ```

3. **Test the AI chatbot:**
   - Open your app
   - Click the AI floating button
   - Send a message
   - Verify the response comes from the Python service

## Troubleshooting

### CORS Errors
If you get CORS errors, ensure your AI service has the correct CORS origins configured:

```env
# server/AI-Server/.env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### API Key Issues
Make sure your Groq API key is configured:

```env
# server/AI-Server/.env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### Network Issues
If the AI service is not reachable:
1. Check that the service is running on port 8000
2. Verify the URL in your frontend configuration
3. Check firewall settings

## Production Deployment

1. **Deploy the AI service to Render:**
   - Create a new Web Service
   - Point to your `server/AI-Server` directory
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python start.py`
   - Add environment variables

2. **Update frontend environment:**
   ```env
   NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.onrender.com
   ```

3. **Deploy your frontend as usual**

## Migration Checklist

- [ ] Create `aiApi.ts` configuration
- [ ] Update `AIChatBox.tsx` API calls
- [ ] Add environment variables
- [ ] Test local integration
- [ ] Deploy AI service to Render
- [ ] Update production environment variables
- [ ] Test production integration 
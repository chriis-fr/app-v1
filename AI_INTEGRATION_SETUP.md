# AI Integration Setup Guide

Your AI chatbot is now **fully integrated** into your existing Node.js server on port 5000! 🎉

## ✅ What's Been Done

1. **AI Service Created**: `server/services/ai-service.ts`
   - Uses Groq API with Llama model
   - Context-aware responses based on user role/department
   - Business and HR insights generation

2. **AI Routes Added**: `server/routes/ai.ts`
   - `/api/ai/chat` - Main chatbot endpoint
   - `/api/ai/insights/business` - Business insights
   - `/api/ai/insights/hr` - HR insights
   - `/api/ai/health` - Health check

3. **Frontend Updated**: Your existing `AIChatBox.tsx` now calls the integrated endpoints

4. **Dependencies Added**: `axios` for HTTP requests to Groq API

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install axios
```

### 2. Get Groq API Key
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up/login and create an API key
3. Copy your API key (starts with `gsk_`)

### 3. Add Environment Variable
Add to your `server/.env` file:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### 4. Start Everything
```bash
# From the root directory
npm run dev
```

This will start:
- ✅ Your Node.js server on port 5000
- ✅ Your React frontend on port 3000
- ✅ AI chatbot integrated and ready to use

## 🎯 API Endpoints

All AI endpoints are now available on your existing server:

### Chat
```bash
POST http://localhost:5000/api/ai/chat
{
  "message": "How can I improve employee retention?",
  "context": {
    "department": "hr",
    "userRole": "manager"
  }
}
```

### Business Insights
```bash
POST http://localhost:5000/api/ai/insights/business
{
  "data_type": "financial",
  "time_period": "last_quarter",
  "specific_metrics": ["revenue", "profit_margin"]
}
```

### HR Insights
```bash
POST http://localhost:5000/api/ai/insights/hr
{
  "insight_type": "performance",
  "time_period": "last_month",
  "employee_data": {
    "total_employees": 50
  }
}
```

## 🧠 AI Features

### Context-Aware Responses
- **HR Department**: Employee management, hiring, training advice
- **Finance Department**: Financial analysis, budgeting, reporting
- **Sales Department**: Sales strategy, customer management
- **Inventory Department**: Stock management, supply chain
- **Organization Owners**: Strategic business insights

### Smart Suggestions
- Follow-up questions based on conversation
- Relevant action items
- Department-specific recommendations

### Business & HR Insights
- Financial performance analysis
- Employee performance insights
- Strategic recommendations
- Risk assessment
- Training needs identification

## 🔧 Configuration

### Environment Variables
```env
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional (defaults shown)
AI_MODEL=llama3-8b-8192
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
```

### AI Model Settings
- **Model**: `llama3-8b-8192` (fast, cost-effective)
- **Temperature**: `0.7` (balanced creativity)
- **Max Tokens**: `4096` (reasonable response length)

## 🧪 Testing

### Test the Chat
1. Start your server: `npm run dev`
2. Open your app in the browser
3. Click the AI floating button
4. Ask a question like: "How can I improve our sales performance?"

### Test Business Insights
```bash
curl -X POST http://localhost:5000/api/ai/insights/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data_type": "financial",
    "time_period": "last_quarter"
  }'
```

### Test HR Insights
```bash
curl -X POST http://localhost:5000/api/ai/insights/hr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "insight_type": "performance",
    "time_period": "last_month"
  }'
```

## 🐛 Troubleshooting

### "GROQ_API_KEY not found" Warning
- Add your API key to `server/.env`
- Restart the server

### CORS Errors
- The AI endpoints use the same CORS settings as your existing server
- No additional configuration needed

### API Key Issues
- Ensure your Groq API key starts with `gsk_`
- Check your Groq account has sufficient credits
- Verify the API key is valid at [console.groq.com](https://console.groq.com/)

### Network Errors
- Check your internet connection
- Verify Groq API is accessible from your location
- Check firewall settings

## 📈 Production Deployment

### Render Deployment
1. Add environment variable in Render dashboard:
   ```
   GROQ_API_KEY=gsk_your_production_api_key
   ```

2. Deploy as usual - no changes needed to deployment process

### Environment Variables for Production
```env
GROQ_API_KEY=gsk_your_production_api_key
NODE_ENV=production
```

## 🎉 Success!

Your AI chatbot is now:
- ✅ **Integrated** into your existing server
- ✅ **Running on port 5000** with everything else
- ✅ **Context-aware** based on user roles and departments
- ✅ **Production-ready** for deployment
- ✅ **No separate services** to manage

Just run `npm run dev` and everything works together! 🚀 
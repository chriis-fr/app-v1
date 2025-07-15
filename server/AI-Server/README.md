# AI Chatbot Service

A Python FastAPI-based AI chatbot service that provides business insights and HR recommendations using LangChain and Groq's Llama model.

## Features

- **AI Chatbot**: Context-aware conversations with business intelligence
- **Business Insights**: Financial analysis, performance metrics, and strategic recommendations
- **HR Insights**: Employee performance analysis, hiring recommendations, and retention strategies
- **Department-Specific AI**: Tailored responses based on user role and department
- **RESTful API**: Clean, documented API endpoints
- **Authentication**: JWT-based authentication (optional for development)

## Technology Stack

- **Framework**: FastAPI (Python)
- **AI/ML**: LangChain + Groq (Llama model)
- **Authentication**: JWT tokens
- **Documentation**: Auto-generated OpenAPI/Swagger docs

## Quick Start

### Prerequisites

- Python 3.8+
- Groq API key (get one at [groq.com](https://groq.com))

### Installation

1. **Clone and navigate to the AI service directory:**
   ```bash
   cd server/AI-Server
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

5. **Run the service:**
   ```bash
   python main.py
   ```

The service will be available at `http://localhost:8000`

## API Endpoints

### Chat Endpoints

- `POST /api/chat` - Chat with the AI assistant
- `GET /api/health` - Health check

### Insights Endpoints

- `POST /api/insights/business` - Generate business insights
- `POST /api/insights/hr` - Generate HR insights
- `GET /api/insights/health` - Health check

### Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage Examples

### Chat with AI Assistant

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve our employee retention?",
    "context": {
      "department": "hr",
      "user_role": "manager"
    }
  }'
```

### Generate Business Insights

```bash
curl -X POST "http://localhost:8000/api/insights/business" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org123",
    "data_type": "financial",
    "time_period": "last_quarter",
    "specific_metrics": ["revenue", "profit_margin", "costs"]
  }'
```

### Generate HR Insights

```bash
curl -X POST "http://localhost:8000/api/insights/hr" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org123",
    "insight_type": "performance",
    "time_period": "last_month",
    "employee_data": {
      "total_employees": 50,
      "performance_metrics": "available"
    }
  }'
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Your Groq API key | Yes | - |
| `JWT_SECRET` | JWT secret for authentication | No | `your-secret-key` |
| `CORS_ORIGINS` | Allowed CORS origins | No | `http://localhost:3000,http://localhost:5000` |
| `MODEL_NAME` | Groq model name | No | `llama3-8b-8192` |
| `MAX_TOKENS` | Maximum tokens for AI responses | No | `4096` |
| `TEMPERATURE` | AI response creativity (0-1) | No | `0.7` |

### AI Model Configuration

The service uses Groq's Llama model by default. You can configure:

- **Model**: `llama3-8b-8192` (default), `llama3-70b-8192`, etc.
- **Temperature**: Controls response creativity (0.0 = focused, 1.0 = creative)
- **Max Tokens**: Maximum response length

## Development

### Project Structure

```
server/AI-Server/
├── app/
│   ├── api/routes/          # API endpoints
│   ├── core/               # Configuration and security
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── prompts/                # AI prompt templates
├── tests/                  # Test files
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Adding New Features

1. **New API Endpoints**: Add routes in `app/api/routes/`
2. **New Services**: Add business logic in `app/services/`
3. **New Models**: Add Pydantic models in `app/models/`
4. **New Prompts**: Add prompt templates in `prompts/`

### Testing

```bash
# Run tests (when implemented)
python -m pytest tests/
```

## Deployment

### Render Deployment

1. **Create a new Web Service on Render**
2. **Set build command:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set start command:**
   ```bash
   python main.py
   ```
4. **Add environment variables:**
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGINS`

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

## Integration with Frontend

Update your React frontend to call the Python AI service:

```typescript
// Example: Update AIChatBox.tsx API call
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: inputValue,
    context: {
      userRole,
      organizationId,
      department: user?.department,
    },
  }),
});
```

## Troubleshooting

### Common Issues

1. **Groq API Key Error**: Ensure your `GROQ_API_KEY` is valid and starts with `gsk_`
2. **CORS Errors**: Check `CORS_ORIGINS` in your environment variables
3. **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`

### Logs

The service logs requests and errors to stdout. Check your deployment platform's logs for debugging.

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use type hints and docstrings

## License

This project is part of the ERP system and follows the same license terms. 
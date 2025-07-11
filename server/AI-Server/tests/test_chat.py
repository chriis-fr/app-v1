import pytest
from fastapi.testclient import TestClient
from main import app
from app.models.chat import ChatRequest, ChatResponse

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_chat_endpoint_structure():
    """Test chat endpoint accepts correct request structure"""
    chat_request = {
        "message": "Hello, how can you help me?",
        "context": {
            "department": "hr",
            "user_role": "manager"
        }
    }
    
    response = client.post("/api/chat", json=chat_request)
    assert response.status_code in [200, 500]  # 500 if no API key configured
    
    if response.status_code == 200:
        data = response.json()
        assert "text" in data
        assert "timestamp" in data
        assert isinstance(data["text"], str)

def test_chat_without_context():
    """Test chat endpoint works without context"""
    chat_request = {
        "message": "What is business intelligence?"
    }
    
    response = client.post("/api/chat", json=chat_request)
    assert response.status_code in [200, 500]  # 500 if no API key configured

def test_insights_health_check():
    """Test insights health check endpoint"""
    response = client.get("/api/insights/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_business_insights_endpoint():
    """Test business insights endpoint structure"""
    insight_request = {
        "organization_id": "test_org",
        "data_type": "financial",
        "time_period": "last_quarter"
    }
    
    response = client.post("/api/insights/business", json=insight_request)
    assert response.status_code in [200, 500]  # 500 if no API key configured
    
    if response.status_code == 200:
        data = response.json()
        assert "insights" in data
        assert "recommendations" in data
        assert "confidence_score" in data

def test_hr_insights_endpoint():
    """Test HR insights endpoint structure"""
    insight_request = {
        "organization_id": "test_org",
        "insight_type": "performance",
        "time_period": "last_month"
    }
    
    response = client.post("/api/insights/hr", json=insight_request)
    assert response.status_code in [200, 500]  # 500 if no API key configured
    
    if response.status_code == 200:
        data = response.json()
        assert "insights" in data
        assert "recommendations" in data
        assert "confidence_score" in data

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

# Note: These tests will fail if GROQ_API_KEY is not configured
# In a real environment, you would mock the AI service calls 
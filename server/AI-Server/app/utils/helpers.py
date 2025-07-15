import json
from typing import Dict, Any, Optional
from datetime import datetime

def format_context_for_ai(context: Optional[Dict[str, Any]]) -> str:
    """Format context data for AI consumption"""
    if not context:
        return ""
    
    formatted_parts = []
    for key, value in context.items():
        if isinstance(value, (dict, list)):
            formatted_parts.append(f"{key}: {json.dumps(value)}")
        else:
            formatted_parts.append(f"{key}: {value}")
    
    return " | ".join(formatted_parts)

def validate_groq_api_key(api_key: str) -> bool:
    """Validate Groq API key format"""
    if not api_key:
        return False
    
    # Basic validation - Groq API keys typically start with 'gsk_'
    return api_key.startswith('gsk_')

def sanitize_user_input(text: str) -> str:
    """Sanitize user input for AI processing"""
    if not text:
        return ""
    
    # Remove potentially harmful characters
    sanitized = text.strip()
    # Add more sanitization as needed
    
    return sanitized

def generate_conversation_id() -> str:
    """Generate a unique conversation ID"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return f"conv_{timestamp}_{unique_id}"

def extract_keywords(text: str) -> list[str]:
    """Extract keywords from text for better context understanding"""
    # Simple keyword extraction - in production, you might use NLP libraries
    keywords = []
    common_business_terms = [
        "performance", "revenue", "profit", "cost", "budget", "employee",
        "hiring", "training", "retention", "sales", "inventory", "finance",
        "hr", "management", "strategy", "analysis", "report", "metrics"
    ]
    
    text_lower = text.lower()
    for term in common_business_terms:
        if term in text_lower:
            keywords.append(term)
    
    return keywords

def format_timestamp(timestamp: datetime) -> str:
    """Format timestamp for display"""
    return timestamp.strftime("%Y-%m-%d %H:%M:%S") 
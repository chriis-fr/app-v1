from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    id: str
    text: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime
    context: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    user_role: Optional[str] = None
    organization_id: Optional[str] = None
    department: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    confidence: Optional[float] = None
    timestamp: datetime = datetime.now() 
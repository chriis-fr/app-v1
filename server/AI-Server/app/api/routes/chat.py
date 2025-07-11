from fastapi import APIRouter, Depends, HTTPException, status
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.security import get_optional_user
from typing import Optional, Dict, Any

router = APIRouter()
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Chat with the AI assistant
    """
    try:
        # Add user context if available
        if current_user:
            if not request.context:
                request.context = {}
            request.context.update({
                "user_id": current_user.get("id"),
                "user_name": current_user.get("name"),
                "user_role": current_user.get("role"),
                "department": current_user.get("department")
            })
        
        # Process the chat request
        response = await chat_service.chat(request)
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check for the chat service
    """
    return {"status": "healthy", "service": "chat"} 
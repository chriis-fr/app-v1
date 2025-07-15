import os
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from app.core.config import settings
from app.models.chat import ChatRequest, ChatResponse
import json

class ChatService:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS
        )
        self._load_prompts()
    
    def _load_prompts(self):
        """Load system prompts for different contexts"""
        self.prompts = {
            "general": """You are an AI assistant for a business ERP system. You help users with various business tasks including:
- Business analysis and insights
- HR management and employee relations
- Financial reporting and analysis
- Inventory and supply chain management
- Sales and customer relationship management

Provide helpful, accurate, and actionable advice. Always be professional and concise.""",
            
            "hr": """You are an HR AI assistant. You help with:
- Employee performance analysis
- Hiring and recruitment strategies
- Training and development recommendations
- Employee retention strategies
- HR policy guidance
- Workforce planning

Provide practical HR advice based on best practices.""",
            
            "finance": """You are a Finance AI assistant. You help with:
- Financial analysis and reporting
- Budget planning and forecasting
- Cost optimization strategies
- Revenue analysis
- Financial risk assessment
- Investment recommendations

Provide accurate financial insights and recommendations.""",
            
            "inventory": """You are an Inventory AI assistant. You help with:
- Stock management and optimization
- Supply chain analysis
- Warehouse operations
- Inventory forecasting
- Supplier management
- Cost optimization

Provide practical inventory and supply chain advice.""",
            
            "sales": """You are a Sales AI assistant. You help with:
- Sales strategy and planning
- Customer relationship management
- Lead generation and qualification
- Sales performance analysis
- Market analysis
- Revenue optimization

Provide actionable sales and marketing advice."""
        }
    
    def _get_system_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        """Get appropriate system prompt based on context"""
        if not context:
            return self.prompts["general"]
        
        department = context.get("department", "").lower()
        user_role = context.get("user_role", "").lower()
        
        if user_role == "owner":
            return self.prompts["general"]
        
        if department in ["hr", "human resources"]:
            return self.prompts["hr"]
        elif department in ["finance", "accounting"]:
            return self.prompts["finance"]
        elif department in ["inventory", "warehouse", "supply chain"]:
            return self.prompts["inventory"]
        elif department in ["sales", "marketing", "crm"]:
            return self.prompts["sales"]
        
        return self.prompts["general"]
    
    def _build_conversation_context(self, request: ChatRequest) -> str:
        """Build conversation context for the AI"""
        context_parts = []
        
        if request.context:
            if request.context.get("organization_name"):
                context_parts.append(f"Organization: {request.context['organization_name']}")
            
            if request.context.get("user_name"):
                context_parts.append(f"User: {request.context['user_name']}")
            
            if request.context.get("department"):
                context_parts.append(f"Department: {request.context['department']}")
        
        if request.user_role:
            context_parts.append(f"User Role: {request.user_role}")
        
        if request.organization_id:
            context_parts.append(f"Organization ID: {request.organization_id}")
        
        if context_parts:
            return f"Context: {' | '.join(context_parts)}"
        
        return ""
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Process chat message and return AI response"""
        try:
            # Get system prompt
            system_prompt = self._get_system_prompt(request.context)
            
            # Build conversation context
            context_info = self._build_conversation_context(request)
            
            # Prepare messages
            messages = [
                SystemMessage(content=system_prompt)
            ]
            
            # Add conversation history if provided
            if request.conversation_history:
                for msg in request.conversation_history[-5:]:  # Last 5 messages for context
                    if msg.sender == "user":
                        messages.append(HumanMessage(content=msg.text))
                    else:
                        messages.append(SystemMessage(content=f"AI: {msg.text}"))
            
            # Add context information
            if context_info:
                messages.append(SystemMessage(content=context_info))
            
            # Add current user message
            messages.append(HumanMessage(content=request.message))
            
            # Get AI response
            response = await self.llm.agenerate([messages])
            
            # Extract response text
            ai_response = response.generations[0][0].text.strip()
            
            # Generate suggestions based on the conversation
            suggestions = self._generate_suggestions(request.message, ai_response, request.context)
            
            return ChatResponse(
                text=ai_response,
                context=request.context,
                suggestions=suggestions,
                confidence=0.85  # Placeholder confidence score
            )
            
        except Exception as e:
            # Fallback response
            return ChatResponse(
                text="I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                context=request.context,
                suggestions=["Try rephrasing your question", "Check your internet connection"],
                confidence=0.0
            )
    
    def _generate_suggestions(self, user_message: str, ai_response: str, context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions = []
        
        # Basic suggestions based on common patterns
        if "performance" in user_message.lower():
            suggestions.extend([
                "View detailed performance metrics",
                "Generate performance reports",
                "Set up performance alerts"
            ])
        
        if "employee" in user_message.lower() or "hr" in user_message.lower():
            suggestions.extend([
                "Review employee data",
                "Generate HR reports",
                "Check hiring pipeline"
            ])
        
        if "financial" in user_message.lower() or "budget" in user_message.lower():
            suggestions.extend([
                "View financial dashboard",
                "Generate budget reports",
                "Analyze cost trends"
            ])
        
        if "inventory" in user_message.lower() or "stock" in user_message.lower():
            suggestions.extend([
                "Check inventory levels",
                "View stock alerts",
                "Generate inventory reports"
            ])
        
        # Default suggestions
        if not suggestions:
            suggestions = [
                "Ask for more specific insights",
                "Request a detailed report",
                "Get recommendations for improvement"
            ]
        
        return suggestions[:3]  # Return max 3 suggestions 
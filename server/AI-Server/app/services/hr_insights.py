from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from app.models.insights import HRInsightRequest, HRInsightResponse
import json

class HRInsightsService:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS
        )
        self._load_prompts()
    
    def _load_prompts(self):
        """Load system prompts for HR insights"""
        self.prompts = {
            "performance": """You are an HR Performance Analysis AI. Analyze employee performance data and provide:
- Performance trend analysis
- Individual and team performance insights
- Performance improvement recommendations
- Recognition and reward suggestions
- Performance management strategies
- Career development opportunities

Provide actionable HR insights based on performance data.""",
            
            "hiring": """You are an HR Recruitment AI. Analyze hiring data and provide:
- Recruitment strategy recommendations
- Candidate sourcing insights
- Hiring process optimization
- Talent acquisition strategies
- Recruitment cost analysis
- Diversity and inclusion recommendations

Focus on effective hiring and talent acquisition strategies.""",
            
            "training": """You are an HR Training & Development AI. Analyze training data and provide:
- Training needs assessment
- Skill gap analysis
- Learning and development recommendations
- Training program optimization
- Career development pathways
- Knowledge transfer strategies

Provide insights for employee development and growth.""",
            
            "retention": """You are an HR Retention AI. Analyze employee retention data and provide:
- Retention risk assessment
- Employee satisfaction insights
- Retention strategy recommendations
- Employee engagement suggestions
- Workplace culture recommendations
- Compensation and benefits insights

Focus on employee retention and satisfaction.""",
            
            "workforce": """You are an HR Workforce Planning AI. Analyze workforce data and provide:
- Workforce planning insights
- Staffing optimization recommendations
- Organizational structure analysis
- Succession planning suggestions
- Workforce diversity analysis
- Strategic HR planning

Provide strategic workforce insights and recommendations."""
        }
    
    def _get_system_prompt(self, insight_type: str) -> str:
        """Get appropriate system prompt based on insight type"""
        insight_type_lower = insight_type.lower()
        
        if "performance" in insight_type_lower:
            return self.prompts["performance"]
        elif "hiring" in insight_type_lower or "recruitment" in insight_type_lower:
            return self.prompts["hiring"]
        elif "training" in insight_type_lower or "development" in insight_type_lower:
            return self.prompts["training"]
        elif "retention" in insight_type_lower or "satisfaction" in insight_type_lower:
            return self.prompts["retention"]
        elif "workforce" in insight_type_lower or "planning" in insight_type_lower:
            return self.prompts["workforce"]
        
        return self.prompts["performance"]  # Default to performance analysis
    
    async def generate_insights(self, request: HRInsightRequest) -> HRInsightResponse:
        """Generate HR insights based on the request"""
        try:
            # Get system prompt
            system_prompt = self._get_system_prompt(request.insight_type)
            
            # Build analysis prompt
            analysis_prompt = f"""
            Analyze the following HR data and provide comprehensive insights:
            
            Insight Type: {request.insight_type}
            Time Period: {request.time_period or 'Recent'}
            Organization ID: {request.organization_id}
            
            {f"Employee Data: {json.dumps(request.employee_data)}" if request.employee_data else ""}
            
            {f"Additional Context: {json.dumps(request.context)}" if request.context else ""}
            
            Please provide:
            1. Key HR insights and trends
            2. Strategic HR recommendations
            3. Employee-specific suggestions (if applicable)
            4. Training and development needs
            5. Retention risk assessment
            6. Hiring recommendations (if applicable)
            
            Format your response as a structured analysis with clear sections.
            """
            
            # Prepare messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=analysis_prompt)
            ]
            
            # Get AI response
            response = await self.llm.agenerate([messages])
            ai_response = response.generations[0][0].text.strip()
            
            # Parse the response into structured format
            insights, recommendations, employee_suggestions, training_needs, retention_risks, hiring_recommendations = self._parse_ai_response(ai_response)
            
            return HRInsightResponse(
                insights=insights,
                recommendations=recommendations,
                employee_suggestions=employee_suggestions,
                training_needs=training_needs,
                retention_risks=retention_risks,
                hiring_recommendations=hiring_recommendations,
                confidence_score=0.87
            )
            
        except Exception as e:
            # Fallback response
            return HRInsightResponse(
                insights=["Unable to generate HR insights at this time"],
                recommendations=["Please try again later"],
                confidence_score=0.0
            )
    
    def _parse_ai_response(self, response: str) -> tuple[List[str], List[str], List[Dict[str, Any]], List[str], List[str], List[str]]:
        """Parse AI response into structured format"""
        insights = []
        recommendations = []
        employee_suggestions = []
        training_needs = []
        retention_risks = []
        hiring_recommendations = []
        
        # Simple parsing logic - in production, you might want more sophisticated parsing
        lines = response.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect sections
            if "insight" in line.lower() or "trend" in line.lower():
                current_section = "insights"
            elif "recommendation" in line.lower() or "suggestion" in line.lower():
                current_section = "recommendations"
            elif "employee" in line.lower() or "individual" in line.lower():
                current_section = "employee_suggestions"
            elif "training" in line.lower() or "development" in line.lower():
                current_section = "training_needs"
            elif "retention" in line.lower() or "risk" in line.lower():
                current_section = "retention_risks"
            elif "hiring" in line.lower() or "recruitment" in line.lower():
                current_section = "hiring_recommendations"
            elif line.startswith('-') or line.startswith('•') or line.startswith('*'):
                # Add to current section
                content = line[1:].strip()
                if current_section == "insights":
                    insights.append(content)
                elif current_section == "recommendations":
                    recommendations.append(content)
                elif current_section == "employee_suggestions":
                    employee_suggestions.append({"suggestion": content, "type": "general"})
                elif current_section == "training_needs":
                    training_needs.append(content)
                elif current_section == "retention_risks":
                    retention_risks.append(content)
                elif current_section == "hiring_recommendations":
                    hiring_recommendations.append(content)
        
        # If no structured sections found, treat the whole response as insights
        if not insights and not recommendations:
            insights = [response[:500] + "..." if len(response) > 500 else response]
        
        return insights, recommendations, employee_suggestions, training_needs, retention_risks, hiring_recommendations 
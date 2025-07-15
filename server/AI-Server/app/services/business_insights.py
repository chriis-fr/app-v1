from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from app.models.insights import BusinessInsightRequest, BusinessInsightResponse
import json

class BusinessInsightsService:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS
        )
        self._load_prompts()
    
    def _load_prompts(self):
        """Load system prompts for business insights"""
        self.prompts = {
            "financial": """You are a Business Intelligence AI specializing in financial analysis. Analyze the provided data and provide:
- Key financial insights and trends
- Risk assessment and alerts
- Strategic recommendations for improvement
- Performance metrics interpretation
- Cost optimization opportunities
- Revenue growth suggestions

Provide actionable, data-driven insights.""",
            
            "performance": """You are a Business Performance AI. Analyze business performance data and provide:
- Performance trend analysis
- Benchmark comparisons
- Efficiency improvement recommendations
- Operational insights
- Strategic planning suggestions
- Performance optimization strategies

Focus on practical, implementable recommendations.""",
            
            "market": """You are a Market Analysis AI. Provide market insights including:
- Market trend analysis
- Competitive landscape assessment
- Market opportunity identification
- Risk factor analysis
- Strategic positioning recommendations
- Market entry/expansion advice

Base insights on market data and industry best practices.""",
            
            "operational": """You are an Operational Excellence AI. Analyze operational data and provide:
- Process efficiency insights
- Operational bottleneck identification
- Resource optimization recommendations
- Quality improvement suggestions
- Operational risk assessment
- Best practice recommendations

Focus on operational efficiency and effectiveness."""
        }
    
    def _get_system_prompt(self, data_type: str) -> str:
        """Get appropriate system prompt based on data type"""
        data_type_lower = data_type.lower()
        
        if "financial" in data_type_lower or "finance" in data_type_lower:
            return self.prompts["financial"]
        elif "performance" in data_type_lower or "metrics" in data_type_lower:
            return self.prompts["performance"]
        elif "market" in data_type_lower or "competitive" in data_type_lower:
            return self.prompts["market"]
        elif "operational" in data_type_lower or "process" in data_type_lower:
            return self.prompts["operational"]
        
        return self.prompts["performance"]  # Default to performance analysis
    
    async def generate_insights(self, request: BusinessInsightRequest) -> BusinessInsightResponse:
        """Generate business insights based on the request"""
        try:
            # Get system prompt
            system_prompt = self._get_system_prompt(request.data_type)
            
            # Build analysis prompt
            analysis_prompt = f"""
            Analyze the following business data and provide comprehensive insights:
            
            Data Type: {request.data_type}
            Time Period: {request.time_period or 'Recent'}
            Organization ID: {request.organization_id}
            
            {f"Specific Metrics: {', '.join(request.specific_metrics)}" if request.specific_metrics else ""}
            
            {f"Additional Context: {json.dumps(request.context)}" if request.context else ""}
            
            Please provide:
            1. Key insights and trends
            2. Strategic recommendations
            3. Risk alerts (if any)
            4. Opportunities for improvement
            5. Actionable next steps
            
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
            insights, recommendations, risk_alerts, opportunities = self._parse_ai_response(ai_response)
            
            return BusinessInsightResponse(
                insights=insights,
                recommendations=recommendations,
                risk_alerts=risk_alerts,
                opportunities=opportunities,
                confidence_score=0.88
            )
            
        except Exception as e:
            # Fallback response
            return BusinessInsightResponse(
                insights=["Unable to generate insights at this time"],
                recommendations=["Please try again later"],
                confidence_score=0.0
            )
    
    def _parse_ai_response(self, response: str) -> tuple[List[str], List[str], List[str], List[str]]:
        """Parse AI response into structured format"""
        insights = []
        recommendations = []
        risk_alerts = []
        opportunities = []
        
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
            elif "risk" in line.lower() or "alert" in line.lower():
                current_section = "risks"
            elif "opportunity" in line.lower() or "improvement" in line.lower():
                current_section = "opportunities"
            elif line.startswith('-') or line.startswith('•') or line.startswith('*'):
                # Add to current section
                content = line[1:].strip()
                if current_section == "insights":
                    insights.append(content)
                elif current_section == "recommendations":
                    recommendations.append(content)
                elif current_section == "risks":
                    risk_alerts.append(content)
                elif current_section == "opportunities":
                    opportunities.append(content)
        
        # If no structured sections found, treat the whole response as insights
        if not insights and not recommendations:
            insights = [response[:500] + "..." if len(response) > 500 else response]
        
        return insights, recommendations, risk_alerts, opportunities 
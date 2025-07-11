from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class BusinessInsightRequest(BaseModel):
    organization_id: str
    data_type: str  # 'financial', 'performance', 'market', etc.
    time_period: Optional[str] = None
    specific_metrics: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None

class BusinessInsightResponse(BaseModel):
    insights: List[str]
    recommendations: List[str]
    metrics: Optional[Dict[str, Any]] = None
    risk_alerts: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    confidence_score: float
    timestamp: datetime = datetime.now()

class HRInsightRequest(BaseModel):
    organization_id: str
    insight_type: str  # 'performance', 'hiring', 'training', 'retention', etc.
    employee_data: Optional[Dict[str, Any]] = None
    time_period: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class HRInsightResponse(BaseModel):
    insights: List[str]
    recommendations: List[str]
    employee_suggestions: Optional[List[Dict[str, Any]]] = None
    training_needs: Optional[List[str]] = None
    retention_risks: Optional[List[str]] = None
    hiring_recommendations: Optional[List[str]] = None
    confidence_score: float
    timestamp: datetime = datetime.now() 
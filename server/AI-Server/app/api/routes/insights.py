from fastapi import APIRouter, Depends, HTTPException, status
from app.models.insights import (
    BusinessInsightRequest, BusinessInsightResponse,
    HRInsightRequest, HRInsightResponse
)
from app.services.business_insights import BusinessInsightsService
from app.services.hr_insights import HRInsightsService
from app.core.security import get_optional_user
from typing import Optional, Dict, Any

router = APIRouter()
business_service = BusinessInsightsService()
hr_service = HRInsightsService()

@router.post("/business", response_model=BusinessInsightResponse)
async def business_insights(
    request: BusinessInsightRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Generate business insights and recommendations
    """
    try:
        # Add user context if available
        if current_user and not request.context:
            request.context = {}
            if current_user:
                request.context.update({
                    "user_id": current_user.get("id"),
                    "user_name": current_user.get("name"),
                    "user_role": current_user.get("role"),
                    "department": current_user.get("department")
                })
        
        # Generate business insights
        response = await business_service.generate_insights(request)
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating business insights: {str(e)}"
        )

@router.post("/hr", response_model=HRInsightResponse)
async def hr_insights(
    request: HRInsightRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Generate HR insights and recommendations
    """
    try:
        # Add user context if available
        if current_user and not request.context:
            request.context = {}
            if current_user:
                request.context.update({
                    "user_id": current_user.get("id"),
                    "user_name": current_user.get("name"),
                    "user_role": current_user.get("role"),
                    "department": current_user.get("department")
                })
        
        # Generate HR insights
        response = await hr_service.generate_insights(request)
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating HR insights: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check for the insights service
    """
    return {"status": "healthy", "service": "insights"} 
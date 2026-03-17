"""
Enhanced AI Router for Claims Workbench.
Endpoints:
  POST /ai/chat          — conversational AI assistant
  POST /ai/insight       — GEN AI INSIGHT per screen (FR-26.7)
  POST /ai/claim-summary — AI Claim Summary Box + Recommended Steps (FR-5.4/5.5)
  POST /ai/similar-incidents — Similar Incident Detection (FR-5.6)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ..schemas.schemas import ChatRequest, ChatResponse
from ..services.agent_service import chat, generate_insight, generate_claim_summary, find_similar_incidents
from ..database import get_db

router = APIRouter(prefix="/ai", tags=["AI"])


class InsightRequest(BaseModel):
    screen: str           # "Litigation" | "Subrogation" | "SIU" | "Salvage" | "Reserve" | "Settlement" | "Vendor"
    context: Optional[str] = None
    claim_id: Optional[str] = None
    sub_claim_id: Optional[str] = None
    extra: Optional[dict] = None  # screen-specific payload (amounts, party names, etc.)


class InsightResponse(BaseModel):
    insight: str
    screen: str
    confidence: Optional[str] = None


class ClaimSummaryRequest(BaseModel):
    claim_id: str
    sub_claim_id: Optional[str] = None


class ClaimSummaryResponse(BaseModel):
    summary: str
    recommended_steps: list[str]
    risk_level: str
    fraud_level: str


class SimilarIncidentRequest(BaseModel):
    claim_id: str
    incident_type: Optional[str] = None
    location: Optional[str] = None


class SimilarIncidentResponse(BaseModel):
    incidents: list[dict]


@router.post("/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest):
    response_text, cid = chat(
        message=req.message,
        conversation_id=req.conversation_id,
        context=req.context,
        claim_id=req.claim_id,
        sub_claim_id=req.sub_claim_id,
    )
    return {"response": response_text, "conversation_id": cid}


@router.post("/insight", response_model=InsightResponse)
def ai_insight(req: InsightRequest):
    """GEN AI INSIGHT — context-aware analysis per screen (FR-26.7)."""
    insight_text = generate_insight(
        screen=req.screen,
        context=req.context,
        claim_id=req.claim_id,
        sub_claim_id=req.sub_claim_id,
        extra=req.extra or {},
    )
    return {
        "insight": insight_text,
        "screen": req.screen,
        "confidence": "High" if req.claim_id else "Medium",
    }


@router.post("/claim-summary", response_model=ClaimSummaryResponse)
def ai_claim_summary(req: ClaimSummaryRequest, db: Session = Depends(get_db)):
    """AI-generated Claim Summary Box + Recommended Steps (FR-5.4, FR-5.5)."""
    result = generate_claim_summary(
        claim_id=req.claim_id,
        sub_claim_id=req.sub_claim_id,
        db=db,
    )
    return result


@router.post("/similar-incidents", response_model=SimilarIncidentResponse)
def ai_similar_incidents(req: SimilarIncidentRequest, db: Session = Depends(get_db)):
    """Similar Incident Detection (FR-5.6)."""
    incidents = find_similar_incidents(
        claim_id=req.claim_id,
        incident_type=req.incident_type,
        location=req.location,
        db=db,
    )
    return {"incidents": incidents}

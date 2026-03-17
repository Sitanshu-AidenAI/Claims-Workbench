"""
Claim Manager Dashboard Router (FR-25)
- Pending payment approvals queue
- Approve / Decline settlement actions
- Manager-level dashboard stats
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..models.models import Settlement, Claim, SubClaim, User
from ..schemas.schemas import SettlementResponse
from ..auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/manager", tags=["Manager"])

AUTHORITY_LIMIT = 100_000  # £100,000


class ApprovalAction(BaseModel):
    approved_by: str
    notes: Optional[str] = None


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/dashboard")
def manager_dashboard(db: Session = Depends(get_db)):
    """
    Returns:
    - pending_approvals: settlements awaiting manager sign-off
    - stats: count summary
    - chart data: claim type distribution, approval time trend
    """
    # Pending settlements requiring approval
    pending = (
        db.query(Settlement)
        .options(
            joinedload(Settlement.sub_claim).joinedload(SubClaim.claim)
        )
        .filter(
            Settlement.requires_approval == True,
            Settlement.status == "Pending Manager Approval",
        )
        .order_by(Settlement.created_at.desc())
        .all()
    )

    pending_data = []
    for s in pending:
        sc = s.sub_claim
        claim = sc.claim if sc else None
        pending_data.append({
            "id": s.id,
            "settlement_id": f"PAY-{s.id:04d}",
            "claim_id": claim.claim_id if claim else "—",
            "policy_holder": claim.company_name if claim else "—",
            "policy_number": claim.policy_number if claim else "—",
            "handler": claim.assigned_handler if claim else "—",
            "sub_claim_id": sc.sub_claim_id if sc else "—",
            "coverage_name": sc.coverage_name if sc else "—",
            "payment_amount": s.payment_amount,
            "net_payment": s.net_payment,
            "deductible_applied": s.deductible_applied,
            "payment_method": s.payment_method,
            "authority_limit": AUTHORITY_LIMIT,
            "status": s.status,
            "requires_approval": s.requires_approval,
            "approved_by": s.approved_by,
            "created_at": s.created_at.isoformat(),
        })

    # Stats
    total_pending = len(pending_data)
    approved_count = db.query(func.count(Settlement.id)).filter(Settlement.status == "Approved").scalar() or 0
    declined_count = db.query(func.count(Settlement.id)).filter(Settlement.status == "Declined").scalar() or 0
    total_approved_amount = db.query(func.sum(Settlement.net_payment)).filter(Settlement.status == "Approved").scalar() or 0

    # Claim type distribution for chart
    from ..models.models import Claim
    motor = db.query(func.count(Claim.id)).filter(Claim.policy_number == "POL-1000").scalar() or 0
    do = db.query(func.count(Claim.id)).filter(Claim.policy_number == "POL-1004").scalar() or 0

    # Approval time trend (last 6 months - mocked for demo)
    trend_data = [
        {"month": "Sep", "avg_days": 3.2},
        {"month": "Oct", "avg_days": 2.8},
        {"month": "Nov", "avg_days": 4.1},
        {"month": "Dec", "avg_days": 2.5},
        {"month": "Jan", "avg_days": 1.9},
        {"month": "Feb", "avg_days": 2.2},
    ]

    return {
        "stats": {
            "pending_approvals": total_pending,
            "approved_count": approved_count,
            "declined_count": declined_count,
            "total_approved_amount": total_approved_amount,
        },
        "pending_approvals": pending_data,
        "chart_claim_type": [
            {"name": "Motor Fleet", "value": motor, "color": "#03448C"},
            {"name": "D&O Insurance", "value": do, "color": "#2CC9A2"},
        ],
        "chart_approval_trend": trend_data,
    }


# ─── Approve Settlement ───────────────────────────────────────────────────────

@router.put("/settlements/{settlement_id}/approve", response_model=SettlementResponse)
def approve_settlement(
    settlement_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Approve a payment that exceeded authority limit (FR-25.5)."""
    s = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Settlement not found")
    if not s.requires_approval:
        raise HTTPException(status_code=400, detail="This settlement does not require approval")
    s.status = "Approved"
    s.approved_by = action.approved_by
    db.commit()
    db.refresh(s)
    return s


# ─── Decline Settlement ───────────────────────────────────────────────────────

@router.put("/settlements/{settlement_id}/decline", response_model=SettlementResponse)
def decline_settlement(
    settlement_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Decline a payment that exceeded authority limit (FR-25.5)."""
    s = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Settlement not found")
    s.status = "Declined"
    s.approved_by = action.approved_by
    db.commit()
    db.refresh(s)
    return s

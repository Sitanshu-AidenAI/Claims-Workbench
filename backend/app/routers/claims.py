from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models.models import Claim, Policy, SubClaim, Task
from ..schemas.schemas import ClaimCreate, ClaimUpdate, ClaimResponse, ClaimListResponse
from ..auth import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims"])

CLAIM_PREFIX = "CL"


def generate_claim_id(db: Session) -> str:
    count = db.query(func.count(Claim.id)).scalar()
    return f"{CLAIM_PREFIX}-{(count or 0) + 237}"  # start from CL-237 to match demo data


@router.get("/", response_model=dict)
def list_claims(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Claim).options(joinedload(Claim.documents))
    if search:
        query = query.filter(
            or_(
                Claim.claim_id.ilike(f"%{search}%"),
                Claim.policy_number.ilike(f"%{search}%"),
                Claim.company_name.ilike(f"%{search}%"),
                Claim.insured_name.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.filter(Claim.status == status)
    if priority:
        query = query.filter(Claim.priority == priority)

    total = query.count()
    items = query.order_by(Claim.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [ClaimListResponse.model_validate(c) for c in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/", response_model=ClaimResponse)
def create_claim(data: ClaimCreate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.policy_number == data.policy_number).first()
    claim_id = generate_claim_id(db)
    claim = Claim(
        claim_id=claim_id,
        policy_id=policy.id if policy else None,
        policy_number=data.policy_number,
        company_name=data.company_name or (policy.company_name if policy else None),
        insured_name=data.insured_name or (policy.insured_name if policy else None),
        date_of_loss=data.date_of_loss,
        time_of_loss=data.time_of_loss,
        description_of_loss=data.description_of_loss,
        type_of_incident=data.type_of_incident,
        cause_of_loss=data.cause_of_loss,
        police_officer_name=data.police_officer_name,
        police_station=data.police_station,
        police_telephone=data.police_telephone,
        incident_reference=data.incident_reference,
        location_of_loss=data.location_of_loss,
        severity=data.severity,
        priority=data.priority,
        requested_amount=data.requested_amount,
        reporting_status="Late Report",
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # Auto-generate SubClaim for the Handler
    sub_claim = SubClaim(
        sub_claim_id=f"{claim_id}-SC1",
        claim_id=claim.id,
        coverage_name="Initial Request",
        sub_claim_type=data.type_of_incident or "General",
        status="New"
    )
    db.add(sub_claim)
    db.commit()
    db.refresh(sub_claim)

    # Auto-generate Task for the Handler Workflow
    task = Task(
        sub_claim_id=sub_claim.id,
        description="Review New Claim Submission",
        details="A new claim has been submitted by FNOL. Please review the details.",
        assigned_to="handler@arch.com",
        due_date=datetime.utcnow().strftime("%Y-%m-%d"),
        status="New",
        urgency="Standard"
    )
    db.add(task)
    db.commit()
    
    # Refresh claim to attach related queries
    db.refresh(claim)
    return claim


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Claim.id)).scalar()
    new = db.query(func.count(Claim.id)).filter(Claim.status == "New").scalar()
    in_progress = db.query(func.count(Claim.id)).filter(Claim.status == "In Progress").scalar()
    completed = db.query(func.count(Claim.id)).filter(Claim.status == "Completed").scalar()
    recent = (
        db.query(Claim)
        .order_by(Claim.created_at.desc())
        .limit(5)
        .all()
    )
    return {
        "total": total,
        "new": new,
        "in_progress": in_progress,
        "completed": completed,
        "recent": [ClaimListResponse.model_validate(c) for c in recent],
    }


@router.get("/dashboard/my-tasks")
def get_my_tasks(email: str, db: Session = Depends(get_db)):
    """Fetch tasks assigned to a specific user, including the parent Claim ID for routing."""
    tasks = (
        db.query(Task, SubClaim.sub_claim_id, Claim.claim_id, Claim.company_name, Claim.insured_name)
        .join(SubClaim, Task.sub_claim_id == SubClaim.id)
        .join(Claim, SubClaim.claim_id == Claim.id)
        .filter(Task.assigned_to == email)
        .filter(Task.status != "Completed")
        .order_by(Task.created_at.desc())
        .limit(10)
        .all()
    )
    
    result = []
    for t, sc_ident, c_ident, comp, curr_ins in tasks:
        result.append({
            "id": t.id,
            "description": t.description,
            "details": t.details,
            "due_date": t.due_date,
            "status": t.status,
            "urgency": t.urgency,
            "claim_id": c_ident,
            "sub_claim_id": sc_ident,
            "insured_name": curr_ins or comp
        })
    return result


@router.get("/{claim_id_str}", response_model=ClaimResponse)
def get_claim(claim_id_str: str, db: Session = Depends(get_db)):
    claim = (
        db.query(Claim)
        .options(joinedload(Claim.documents), joinedload(Claim.sub_claims))
        .filter(Claim.claim_id == claim_id_str)
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.put("/{claim_id_str}", response_model=ClaimResponse)
def update_claim(
    claim_id_str: str,
    data: ClaimUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id_str).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(claim, field, value)
    db.commit()
    db.refresh(claim)
    return claim

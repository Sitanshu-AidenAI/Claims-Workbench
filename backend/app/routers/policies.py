from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Policy
from ..schemas.schemas import PolicyResponse

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("/{policy_number}", response_model=PolicyResponse)
def get_policy(policy_number: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.policy_number == policy_number).first()
    if not policy:
        raise HTTPException(status_code=404, detail=f"Policy {policy_number} not found")
    return policy


@router.get("/", response_model=list[PolicyResponse])
def list_policies(db: Session = Depends(get_db)):
    return db.query(Policy).all()

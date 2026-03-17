from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from ..database import get_db
from ..models.models import (
    SubClaim, Task, SubClaimDocument, Reserve, ReinsuranceSplit,
    Deductible, Litigation, SubrogationParty, SIU, Stakeholder, Party,
    CollaborationMessage, Settlement, LossAdjusterReport, Claim, Policy
)
from ..schemas.schemas import (
    SubClaimCreate, SubClaimUpdate, SubClaimResponse, TaskCreate, TaskUpdate,
    TaskResponse, SubClaimDocumentCreate, SubClaimDocumentResponse,
    ReserveCreate, ReserveResponse, DeductibleCreate, DeductibleResponse,
    LitigationUpdate, LitigationResponse, SIUUpdate, SIUResponse,
    StakeholderCreate, StakeholderResponse, PartyCreate, PartyResponse,
    CollaborationMessageCreate, CollaborationMessageResponse,
    SettlementCreate, SettlementResponse
)
from ..auth import get_current_user

router = APIRouter(prefix="/sub-claims", tags=["SubClaims"])

SC_PREFIX = "SC"


def generate_sc_id(db: Session) -> str:
    count = db.query(func.count(SubClaim.id)).scalar()
    return f"{SC_PREFIX}-{(count or 0) + 165}"


# ─── Sub Claims CRUD ─────────────────────────────────────────────────────────

@router.get("/by-claim/{claim_id_str}", response_model=list[SubClaimResponse])
def get_sub_claims_by_claim(claim_id_str: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id_str).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return (
        db.query(SubClaim)
        .options(
            joinedload(SubClaim.tasks),
            joinedload(SubClaim.documents),
            joinedload(SubClaim.reserves).joinedload(Reserve.reinsurance_splits),
            joinedload(SubClaim.deductibles),
        )
        .filter(SubClaim.claim_id == claim.id)
        .all()
    )


@router.post("/", response_model=SubClaimResponse)
def create_sub_claim(data: SubClaimCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc_id = generate_sc_id(db)
    sc = SubClaim(sub_claim_id=sc_id, **data.model_dump())
    db.add(sc)
    db.commit()
    db.refresh(sc)
    # Auto-create Litigation and SIU records
    lit = Litigation(sub_claim_id=sc.id, is_locked=True)
    siu = SIU(sub_claim_id=sc.id, siu_status="Normal")
    db.add_all([lit, siu])
    db.commit()
    return sc


@router.get("/{sc_id_str}", response_model=SubClaimResponse)
def get_sub_claim(sc_id_str: str, db: Session = Depends(get_db)):
    sc = (
        db.query(SubClaim)
        .options(
            joinedload(SubClaim.tasks),
            joinedload(SubClaim.documents),
            joinedload(SubClaim.reserves).joinedload(Reserve.reinsurance_splits),
            joinedload(SubClaim.deductibles),
        )
        .filter(SubClaim.sub_claim_id == sc_id_str)
        .first()
    )
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return sc


@router.put("/{sc_id_str}", response_model=SubClaimResponse)
def update_sub_claim(sc_id_str: str, data: SubClaimUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sc, field, value)
    db.commit()
    db.refresh(sc)
    return sc


@router.delete("/{sc_id_str}", status_code=204)
def delete_sub_claim(sc_id_str: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    db.delete(sc)
    db.commit()


# ─── Tasks ───────────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/tasks", response_model=list[TaskResponse])
def get_tasks(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return db.query(Task).filter(Task.sub_claim_id == sc.id).all()


@router.post("/{sc_id_str}/tasks", response_model=TaskResponse)
def create_task(sc_id_str: str, data: TaskCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    task = Task(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


# ─── Documents ───────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/documents", response_model=list[SubClaimDocumentResponse])
def get_documents(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return db.query(SubClaimDocument).filter(SubClaimDocument.sub_claim_id == sc.id).all()


@router.post("/{sc_id_str}/documents", response_model=SubClaimDocumentResponse)
def add_document(sc_id_str: str, data: SubClaimDocumentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    doc = SubClaimDocument(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/documents/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doc = db.query(SubClaimDocument).filter(SubClaimDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()


# ─── Reserves ────────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/reserves", response_model=list[ReserveResponse])
def get_reserves(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return (
        db.query(Reserve)
        .options(joinedload(Reserve.reinsurance_splits))
        .filter(Reserve.sub_claim_id == sc.id)
        .all()
    )


@router.post("/{sc_id_str}/reserves", response_model=ReserveResponse)
def add_reserve(sc_id_str: str, data: ReserveCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    reserve = Reserve(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(reserve)
    db.commit()
    db.refresh(reserve)
    # Auto-generate reinsurance splits from policy reinsurers
    claim = db.query(Claim).filter(Claim.id == sc.claim_id).first()
    if claim and claim.policy_id:
        policy = db.query(Policy).filter(Policy.id == claim.policy_id).first()
        if policy and policy.reinsurers:
            for r in policy.reinsurers:
                split_amount = reserve.reserve_amount * (r.share_percentage / 100)
                split = ReinsuranceSplit(
                    reserve_id=reserve.id,
                    reinsurer_name=r.reinsurer_name,
                    agreement_type=r.agreement_type,
                    share_percentage=r.share_percentage,
                    coded_amount=split_amount,
                    payment_amount=split_amount,
                )
                db.add(split)
    db.commit()
    db.refresh(reserve)
    return reserve


@router.put("/reserves/{reserve_id}/approve", response_model=ReserveResponse)
def approve_reserve(reserve_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    reserve = db.query(Reserve).filter(Reserve.id == reserve_id).first()
    if not reserve:
        raise HTTPException(status_code=404, detail="Reserve not found")
    reserve.status = "Approved"
    db.commit()
    db.refresh(reserve)
    return reserve


# ─── Deductibles ─────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/deductibles", response_model=list[DeductibleResponse])
def get_deductibles(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return db.query(Deductible).filter(Deductible.sub_claim_id == sc.id).all()


@router.post("/{sc_id_str}/deductibles", response_model=DeductibleResponse)
def add_deductible(sc_id_str: str, data: DeductibleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    ded = Deductible(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(ded)
    db.commit()
    db.refresh(ded)
    return ded


# ─── Litigation ──────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/litigation", response_model=LitigationResponse)
def get_litigation(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    lit = db.query(Litigation).filter(Litigation.sub_claim_id == sc.id).first()
    if not lit:
        lit = Litigation(sub_claim_id=sc.id, is_locked=True)
        db.add(lit)
        db.commit()
        db.refresh(lit)
    return lit


@router.put("/{sc_id_str}/litigation", response_model=LitigationResponse)
def update_litigation(sc_id_str: str, data: LitigationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    lit = db.query(Litigation).filter(Litigation.sub_claim_id == sc.id).first()
    if not lit:
        lit = Litigation(sub_claim_id=sc.id)
        db.add(lit)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lit, field, value)
    db.commit()
    db.refresh(lit)
    return lit


# ─── SIU ─────────────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/siu", response_model=SIUResponse)
def get_siu(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    siu = db.query(SIU).filter(SIU.sub_claim_id == sc.id).first()
    if not siu:
        siu = SIU(sub_claim_id=sc.id, siu_status="Normal")
        db.add(siu)
        db.commit()
        db.refresh(siu)
    return siu


@router.put("/{sc_id_str}/siu", response_model=SIUResponse)
def update_siu(sc_id_str: str, data: SIUUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    siu = db.query(SIU).filter(SIU.sub_claim_id == sc.id).first()
    if not siu:
        siu = SIU(sub_claim_id=sc.id)
        db.add(siu)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(siu, field, value)
    db.commit()
    db.refresh(siu)
    return siu


# ─── Stakeholders ────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/stakeholders", response_model=list[StakeholderResponse])
def get_stakeholders(sc_id_str: str, section: str = None, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    q = db.query(Stakeholder).filter(Stakeholder.sub_claim_id == sc.id)
    if section:
        q = q.filter(Stakeholder.section == section)
    return q.all()


@router.post("/{sc_id_str}/stakeholders", response_model=StakeholderResponse)
def add_stakeholder(sc_id_str: str, data: StakeholderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    sh = Stakeholder(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(sh)
    db.commit()
    db.refresh(sh)
    return sh


@router.delete("/stakeholders/{sh_id}", status_code=204)
def delete_stakeholder(sh_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sh = db.query(Stakeholder).filter(Stakeholder.id == sh_id).first()
    if not sh:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    db.delete(sh)
    db.commit()


# ─── Parties ─────────────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/parties", response_model=list[PartyResponse])
def get_parties(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return db.query(Party).filter(Party.sub_claim_id == sc.id).all()


@router.post("/{sc_id_str}/parties", response_model=PartyResponse)
def add_party(sc_id_str: str, data: PartyCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    party = Party(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(party)
    db.commit()
    db.refresh(party)
    return party


# ─── Collaboration ───────────────────────────────────────────────────────────

@router.get("/{sc_id_str}/messages", response_model=list[CollaborationMessageResponse])
def get_messages(sc_id_str: str, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    return db.query(CollaborationMessage).filter(CollaborationMessage.sub_claim_id == sc.id).order_by(CollaborationMessage.created_at).all()


@router.post("/{sc_id_str}/messages", response_model=CollaborationMessageResponse)
def post_message(sc_id_str: str, data: CollaborationMessageCreate, db: Session = Depends(get_db)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    msg = CollaborationMessage(sub_claim_id=sc.id, **data.model_dump(exclude={"sub_claim_id"}))
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ─── Settlement ──────────────────────────────────────────────────────────────

@router.post("/{sc_id_str}/settlements", response_model=SettlementResponse)
def create_settlement(sc_id_str: str, data: SettlementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sc = db.query(SubClaim).filter(SubClaim.sub_claim_id == sc_id_str).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sub-claim not found")
    net = data.net_payment or (data.payment_amount - (data.deductible_applied or 0))
    requires_approval = net > 100000
    settlement = Settlement(
        sub_claim_id=sc.id,
        reserve_id=data.reserve_id,
        payment_method=data.payment_method,
        payment_amount=data.payment_amount,
        deductible_applied=data.deductible_applied or 0,
        net_payment=net,
        status="Pending Manager Approval" if requires_approval else "Pending",
        requires_approval=requires_approval,
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement

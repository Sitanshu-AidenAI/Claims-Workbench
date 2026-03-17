from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "handler"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    avatar_initials: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─── Policy ──────────────────────────────────────────────────────────────────

class InsuredVehicleResponse(BaseModel):
    id: int
    vin: str
    vehicle_make: Optional[str]
    vehicle_model: Optional[str]
    year_of_manufacture: Optional[int]
    is_covered: bool

    class Config:
        from_attributes = True


class CoverageResponse(BaseModel):
    id: int
    coverage_type: Optional[str]
    coverage_limit: Optional[float]
    deductible: Optional[float]

    class Config:
        from_attributes = True


class ReinsurerResponse(BaseModel):
    id: int
    reinsurer_name: Optional[str]
    agreement_type: Optional[str]
    share_percentage: Optional[float]
    coded_amount: Optional[float]
    payment_amount: Optional[float]

    class Config:
        from_attributes = True


class PolicyResponse(BaseModel):
    id: int
    policy_number: str
    insured_name: str
    company_name: Optional[str]
    address: Optional[str]
    zip_code: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    preferred_contact: Optional[str]
    preferred_contact_name: Optional[str]
    opening_hours: Optional[str]
    vat_registered: bool
    policy_start_date: Optional[str]
    policy_end_date: Optional[str]
    total_sum_insured: float
    line_of_business: Optional[str]
    status: str
    vehicles: List[InsuredVehicleResponse] = []
    coverages: List[CoverageResponse] = []
    reinsurers: List[ReinsurerResponse] = []

    class Config:
        from_attributes = True


# ─── Claim ───────────────────────────────────────────────────────────────────

class ClaimDocumentResponse(BaseModel):
    id: int
    vin: Optional[str]
    file_name: Optional[str]
    file_category: Optional[str]
    file_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ClaimCreate(BaseModel):
    policy_number: str
    company_name: Optional[str] = None
    insured_name: Optional[str] = None
    date_of_loss: Optional[str] = None
    time_of_loss: Optional[str] = None
    description_of_loss: Optional[str] = None
    type_of_incident: Optional[str] = None
    cause_of_loss: Optional[str] = None
    police_officer_name: Optional[str] = None
    police_station: Optional[str] = None
    police_telephone: Optional[str] = None
    incident_reference: Optional[str] = None
    location_of_loss: Optional[str] = None
    severity: Optional[str] = "Medium"
    priority: Optional[str] = "Medium"
    requested_amount: Optional[float] = 0


class ClaimUpdate(BaseModel):
    date_of_loss: Optional[str] = None
    time_of_loss: Optional[str] = None
    description_of_loss: Optional[str] = None
    type_of_incident: Optional[str] = None
    cause_of_loss: Optional[str] = None
    status: Optional[str] = None
    reporting_status: Optional[str] = None
    priority: Optional[str] = None
    assigned_handler: Optional[str] = None
    severity: Optional[str] = None
    requested_amount: Optional[float] = None
    claim_completion_date: Optional[str] = None
    previous_claim_history: Optional[bool] = None


class ClaimResponse(BaseModel):
    id: int
    claim_id: str
    policy_id: Optional[int]
    policy_number: str
    company_name: Optional[str]
    insured_name: Optional[str]
    date_of_loss: Optional[str]
    time_of_loss: Optional[str]
    description_of_loss: Optional[str]
    type_of_incident: Optional[str]
    cause_of_loss: Optional[str]
    police_officer_name: Optional[str]
    police_station: Optional[str]
    police_telephone: Optional[str]
    incident_reference: Optional[str]
    location_of_loss: Optional[str]
    severity: Optional[str]
    status: str
    reporting_status: Optional[str]
    priority: str
    assigned_handler: Optional[str]
    claim_completion_date: Optional[str]
    previous_claim_history: bool
    requested_amount: float
    created_at: datetime
    updated_at: datetime
    documents: List[ClaimDocumentResponse] = []

    class Config:
        from_attributes = True


class ClaimListResponse(BaseModel):
    id: int
    claim_id: str
    policy_number: str
    company_name: Optional[str]
    insured_name: Optional[str]
    date_of_loss: Optional[str]
    status: str
    priority: str
    reporting_status: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── SubClaim ─────────────────────────────────────────────────────────────────

class SubClaimCreate(BaseModel):
    claim_id: int
    coverage_name: Optional[str] = None
    sub_claim_type: Optional[str] = None
    damage_description: Optional[str] = None
    claim_owner: Optional[str] = None
    claimant_name: Optional[str] = None
    claimant_gender: Optional[str] = None
    claimant_dob: Optional[str] = None
    claimant_contact: Optional[str] = None
    part_of_body: Optional[str] = None
    cause_of_injury: Optional[str] = None
    nature_of_injury: Optional[str] = None
    injury_key: Optional[str] = None


class SubClaimUpdate(BaseModel):
    coverage_name: Optional[str] = None
    sub_claim_type: Optional[str] = None
    damage_description: Optional[str] = None
    claim_owner: Optional[str] = None
    claimant_name: Optional[str] = None
    claimant_gender: Optional[str] = None
    claimant_dob: Optional[str] = None
    claimant_contact: Optional[str] = None
    status: Optional[str] = None
    loss_estimate: Optional[float] = None
    risk_score: Optional[int] = None
    fraud_score: Optional[int] = None
    part_of_body: Optional[str] = None
    cause_of_injury: Optional[str] = None
    nature_of_injury: Optional[str] = None
    injury_key: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    sub_claim_id: int
    description: Optional[str]
    details: Optional[str]
    assigned_to: Optional[str]
    due_date: Optional[str]
    status: str
    urgency: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    sub_claim_id: int
    description: str
    details: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = "New"
    urgency: Optional[str] = "Standard"


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    details: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    urgency: Optional[str] = None


class ReserveCreate(BaseModel):
    sub_claim_id: int
    standing_reserve: Optional[str] = None
    reserve_amount: float
    deductible: Optional[float] = 0
    added_by: Optional[str] = None
    comments: Optional[str] = None
    status: Optional[str] = "Pending"


class ReinsuranceSplitResponse(BaseModel):
    id: int
    reinsurer_name: Optional[str]
    agreement_type: Optional[str]
    share_percentage: Optional[float]
    coded_amount: Optional[float]
    payment_amount: Optional[float]

    class Config:
        from_attributes = True


class ReserveResponse(BaseModel):
    id: int
    sub_claim_id: int
    standing_reserve: Optional[str]
    reserve_amount: float
    deductible: float
    added_by: Optional[str]
    comments: Optional[str]
    status: str
    reinsurance_splits: List[ReinsuranceSplitResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class DeductibleCreate(BaseModel):
    sub_claim_id: int
    deductible_type: Optional[str] = None
    deductible_amount: float
    applied_on: Optional[str] = None
    status: Optional[str] = "Pending"


class DeductibleResponse(BaseModel):
    id: int
    deductible_type: Optional[str]
    deductible_amount: float
    applied_on: Optional[str]
    status: str

    class Config:
        from_attributes = True


class SubClaimDocumentCreate(BaseModel):
    sub_claim_id: int
    vin: Optional[str] = None
    file_name: str
    file_category: str
    file_url: Optional[str] = None
    is_mandatory: Optional[bool] = False


class SubClaimDocumentResponse(BaseModel):
    id: int
    vin: Optional[str]
    file_name: str
    file_category: str
    file_url: Optional[str]
    is_mandatory: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LitigationUpdate(BaseModel):
    litigation_id: Optional[str] = None
    complainant: Optional[str] = None
    jurisdiction: Optional[str] = None
    date_of_complainant: Optional[str] = None
    date_complaint_received: Optional[str] = None
    total_complaint_received: Optional[int] = None
    description_of_complaint: Optional[str] = None
    legal_actions: Optional[str] = None
    is_locked: Optional[bool] = None


class LitigationResponse(BaseModel):
    id: int
    litigation_id: Optional[str]
    complainant: Optional[str]
    jurisdiction: Optional[str]
    date_of_complainant: Optional[str]
    date_complaint_received: Optional[str]
    total_complaint_received: int
    description_of_complaint: Optional[str]
    legal_actions: Optional[str]
    is_locked: bool

    class Config:
        from_attributes = True


class SIUUpdate(BaseModel):
    siu_status: Optional[str] = None
    investigator_assigned: Optional[str] = None
    investigator_start_date: Optional[str] = None
    reason_for_involvement: Optional[str] = None
    notes: Optional[str] = None


class SIUResponse(BaseModel):
    id: int
    siu_status: str
    investigator_assigned: Optional[str]
    investigator_start_date: Optional[str]
    reason_for_involvement: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class SubClaimResponse(BaseModel):
    id: int
    sub_claim_id: str
    claim_id: int
    coverage_name: Optional[str]
    sub_claim_type: Optional[str]
    damage_description: Optional[str]
    claim_owner: Optional[str]
    claimant_name: Optional[str]
    claimant_gender: Optional[str]
    claimant_dob: Optional[str]
    claimant_contact: Optional[str]
    status: str
    loss_estimate: float
    risk_score: int
    fraud_score: int
    risk_level: str
    fraud_level: str
    part_of_body: Optional[str]
    cause_of_injury: Optional[str]
    nature_of_injury: Optional[str]
    injury_key: Optional[str]
    tasks: List[TaskResponse] = []
    documents: List[SubClaimDocumentResponse] = []
    reserves: List[ReserveResponse] = []
    deductibles: List[DeductibleResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Stakeholder ─────────────────────────────────────────────────────────────

class StakeholderCreate(BaseModel):
    sub_claim_id: int
    section: str
    party_name: Optional[str] = None
    party_role: Optional[str] = None
    party_type: Optional[str] = None
    assigned_to: Optional[str] = None
    third_party_code: Optional[str] = None
    vendor_email: Optional[str] = None
    assignment_date: Optional[str] = None
    service_type: Optional[str] = None
    total_cost: Optional[float] = 0


class StakeholderResponse(BaseModel):
    id: int
    sub_claim_id: int
    section: str
    party_name: Optional[str]
    party_role: Optional[str]
    party_type: Optional[str]
    assigned_to: Optional[str]
    third_party_code: Optional[str]
    vendor_email: Optional[str]
    assignment_date: Optional[str]
    service_type: Optional[str]
    total_cost: float
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Party ───────────────────────────────────────────────────────────────────

class PartyCreate(BaseModel):
    sub_claim_id: int
    party_type: str
    party_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    reference_number: Optional[str] = None
    relation_with_sub_claim: Optional[str] = None
    organization_name: Optional[str] = None
    contact_person: Optional[str] = None
    organization_type: Optional[str] = None
    registration_number: Optional[str] = None
    sanction_check: Optional[bool] = False
    sanction_flagged: Optional[bool] = False


class PartyResponse(BaseModel):
    id: int
    party_type: str
    party_name: Optional[str]
    date_of_birth: Optional[str]
    contact_number: Optional[str]
    email: Optional[str]
    reference_number: Optional[str]
    relation_with_sub_claim: Optional[str]
    organization_name: Optional[str]
    contact_person: Optional[str]
    organization_type: Optional[str]
    registration_number: Optional[str]
    sanction_check: bool
    sanction_flagged: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Collaboration ───────────────────────────────────────────────────────────

class CollaborationMessageCreate(BaseModel):
    sub_claim_id: int
    sender_name: str
    sender_initials: Optional[str] = None
    tagged_users: Optional[List[str]] = []
    message: str
    parent_id: Optional[int] = None


class CollaborationMessageResponse(BaseModel):
    id: int
    sub_claim_id: int
    sender_name: Optional[str]
    sender_initials: Optional[str]
    tagged_users: Optional[List[str]]
    message: Optional[str]
    parent_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Settlement ──────────────────────────────────────────────────────────────

class SettlementCreate(BaseModel):
    sub_claim_id: int
    reserve_id: Optional[int] = None
    payment_method: Optional[str] = None
    payment_amount: float
    deductible_applied: Optional[float] = 0
    net_payment: Optional[float] = None


class SettlementResponse(BaseModel):
    id: int
    sub_claim_id: int
    reserve_id: Optional[int]
    payment_method: Optional[str]
    payment_amount: float
    deductible_applied: float
    net_payment: float
    status: str
    requires_approval: bool
    approved_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AI Chat ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[str] = None  # "Legal", "Medical", "Financial", "FNOL"
    claim_id: Optional[str] = None
    sub_claim_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


# ─── Pagination ──────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

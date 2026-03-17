from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="handler")  # fnol, handler, manager, specialist
    avatar_initials = Column(String(5))
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(50), unique=True, index=True, nullable=False)
    insured_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    address = Column(String(500))
    zip_code = Column(String(20))
    email = Column(String(255))
    phone = Column(String(50))
    preferred_contact = Column(String(50))
    preferred_contact_name = Column(String(255))
    opening_hours = Column(String(100))
    vat_registered = Column(Boolean, default=True)
    policy_start_date = Column(String(20))
    policy_end_date = Column(String(20))
    total_sum_insured = Column(Float, default=0)
    line_of_business = Column(String(100))  # Motor Fleet, D&O
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    claims = relationship("Claim", back_populates="policy")
    vehicles = relationship("InsuredVehicle", back_populates="policy", cascade="all, delete-orphan")
    coverages = relationship("Coverage", back_populates="policy", cascade="all, delete-orphan")
    reinsurers = relationship("Reinsurer", back_populates="policy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Policy {self.policy_number}>"


class InsuredVehicle(Base):
    __tablename__ = "insured_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    vin = Column(String(100), index=True)
    vehicle_make = Column(String(100))
    vehicle_model = Column(String(100))
    year_of_manufacture = Column(Integer)
    is_covered = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("Policy", back_populates="vehicles")

    def __repr__(self):
        return f"<InsuredVehicle {self.vin}>"


class Coverage(Base):
    __tablename__ = "coverages"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    coverage_type = Column(String(255))
    coverage_limit = Column(Float)
    deductible = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("Policy", back_populates="coverages")

    def __repr__(self):
        return f"<Coverage {self.coverage_type}>"


class Reinsurer(Base):
    __tablename__ = "reinsurers"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    reinsurer_name = Column(String(255))
    agreement_type = Column(String(100))
    share_percentage = Column(Float)
    coded_amount = Column(Float)
    payment_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("Policy", back_populates="reinsurers")

    def __repr__(self):
        return f"<Reinsurer {self.reinsurer_name}>"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String(20), unique=True, index=True)  # CL-0001
    policy_id = Column(Integer, ForeignKey("policies.id"))
    policy_number = Column(String(50))
    company_name = Column(String(255))
    insured_name = Column(String(255))

    # Loss Details
    date_of_loss = Column(String(20))
    time_of_loss = Column(String(20))
    description_of_loss = Column(Text)
    type_of_incident = Column(String(100))
    cause_of_loss = Column(String(100))
    police_officer_name = Column(String(255))
    police_station = Column(String(255))
    police_telephone = Column(String(50))
    incident_reference = Column(String(100))
    location_of_loss = Column(String(255))
    severity = Column(String(50), default="Medium")

    # Status & workflow
    status = Column(String(50), default="New")
    reporting_status = Column(String(100), default="None")
    priority = Column(String(20), default="Medium")
    assigned_handler = Column(String(255))
    claim_completion_date = Column(String(20))
    previous_claim_history = Column(Boolean, default=False)
    requested_amount = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    policy = relationship("Policy", back_populates="claims")
    sub_claims = relationship("SubClaim", back_populates="claim", cascade="all, delete-orphan")
    documents = relationship("ClaimDocument", back_populates="claim", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Claim {self.claim_id}>"


class SubClaim(Base):
    __tablename__ = "sub_claims"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(String(20), unique=True, index=True)  # SC-001
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    coverage_name = Column(String(255))
    sub_claim_type = Column(String(100))  # Bodily Injury, Vehicle Damage
    damage_description = Column(Text)
    claim_owner = Column(String(255))
    claimant_name = Column(String(255))
    claimant_gender = Column(String(20))
    claimant_dob = Column(String(20))
    claimant_contact = Column(String(50))
    status = Column(String(50), default="FNOL Completed")

    # Body injury info
    part_of_body = Column(String(100))
    cause_of_injury = Column(Text)
    nature_of_injury = Column(Text)
    injury_key = Column(Text)

    # Financial
    loss_estimate = Column(Float, default=0)
    risk_score = Column(Integer, default=0)
    fraud_score = Column(Integer, default=0)
    risk_level = Column(String(50), default="Low")
    fraud_level = Column(String(50), default="Low")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    claim = relationship("Claim", back_populates="sub_claims")
    tasks = relationship("Task", back_populates="sub_claim", cascade="all, delete-orphan")
    documents = relationship("SubClaimDocument", back_populates="sub_claim", cascade="all, delete-orphan")
    reserves = relationship("Reserve", back_populates="sub_claim", cascade="all, delete-orphan")
    deductibles = relationship("Deductible", back_populates="sub_claim", cascade="all, delete-orphan")
    litigation = relationship("Litigation", back_populates="sub_claim", uselist=False, cascade="all, delete-orphan")
    subrogation_parties = relationship("SubrogationParty", back_populates="sub_claim", cascade="all, delete-orphan")
    siu = relationship("SIU", back_populates="sub_claim", uselist=False, cascade="all, delete-orphan")
    stakeholders = relationship("Stakeholder", back_populates="sub_claim", cascade="all, delete-orphan")
    parties = relationship("Party", back_populates="sub_claim", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SubClaim {self.sub_claim_id}>"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    description = Column(String(500))
    details = Column(Text)
    assigned_to = Column(String(255))
    due_date = Column(String(20))
    status = Column(String(50), default="New")
    urgency = Column(String(50), default="Standard")  # Standard, High, SLA Bound
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="tasks")

    def __repr__(self):
        return f"<Task {self.id}>"


class ClaimDocument(Base):
    __tablename__ = "claim_documents"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    vin = Column(String(100))
    file_name = Column(String(500))
    file_category = Column(String(100))  # FIR, Images, Medical Documentation
    file_url = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="documents")

    def __repr__(self):
        return f"<ClaimDocument {self.file_name}>"


class SubClaimDocument(Base):
    __tablename__ = "sub_claim_documents"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    vin = Column(String(100))
    file_name = Column(String(500))
    file_category = Column(String(100))
    file_url = Column(String(1000))
    is_mandatory = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="documents")

    def __repr__(self):
        return f"<SubClaimDocument {self.file_name}>"


class Reserve(Base):
    __tablename__ = "reserves"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    standing_reserve = Column(String(50))
    reserve_amount = Column(Float)
    deductible = Column(Float, default=0)
    added_by = Column(String(255))
    comments = Column(Text)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="reserves")
    reinsurance_splits = relationship("ReinsuranceSplit", back_populates="reserve", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Reserve {self.id}>"


class ReinsuranceSplit(Base):
    __tablename__ = "reinsurance_splits"

    id = Column(Integer, primary_key=True, index=True)
    reserve_id = Column(Integer, ForeignKey("reserves.id"), nullable=False)
    reinsurer_name = Column(String(255))
    agreement_type = Column(String(100))
    share_percentage = Column(Float)
    coded_amount = Column(Float)
    payment_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    reserve = relationship("Reserve", back_populates="reinsurance_splits")

    def __repr__(self):
        return f"<ReinsuranceSplit {self.reinsurer_name}>"


class Deductible(Base):
    __tablename__ = "deductibles"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    deductible_type = Column(String(100))
    deductible_amount = Column(Float)
    applied_on = Column(String(20))
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="deductibles")

    def __repr__(self):
        return f"<Deductible {self.id}>"


class Litigation(Base):
    __tablename__ = "litigations"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False, unique=True)
    litigation_id = Column(String(100))
    complainant = Column(String(255))
    jurisdiction = Column(String(255))
    date_of_complainant = Column(String(20))
    date_complaint_received = Column(String(20))
    total_complaint_received = Column(Integer, default=0)
    description_of_complaint = Column(Text)
    legal_actions = Column(Text)
    is_locked = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="litigation")

    def __repr__(self):
        return f"<Litigation {self.litigation_id}>"


class SubrogationParty(Base):
    __tablename__ = "subrogation_parties"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    party_name = Column(String(255))
    party_role = Column(String(100))
    party_type = Column(String(100))
    assigned_to = Column(String(255))
    third_party_category = Column(String(100))
    total_subrogation_amount = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="subrogation_parties")

    def __repr__(self):
        return f"<SubrogationParty {self.party_name}>"


class SIU(Base):
    __tablename__ = "siu"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False, unique=True)
    siu_status = Column(String(50), default="Normal")  # Normal, Flagged
    investigator_assigned = Column(String(255))
    investigator_start_date = Column(String(20))
    reason_for_involvement = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="siu")

    def __repr__(self):
        return f"<SIU {self.id}>"


class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    section = Column(String(100))  # Salvage, Ext Vehicle Manage, Assign Vendor
    party_name = Column(String(255))
    party_role = Column(String(100))
    party_type = Column(String(100))
    assigned_to = Column(String(255))
    third_party_code = Column(String(100))
    vendor_email = Column(String(255))
    assignment_date = Column(String(20))
    service_type = Column(String(100))
    total_cost = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="stakeholders")

    def __repr__(self):
        return f"<Stakeholder {self.party_name}>"


class Party(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    party_type = Column(String(50))  # Individual, Organization
    party_name = Column(String(255))
    date_of_birth = Column(String(20))
    contact_number = Column(String(50))
    email = Column(String(255))
    reference_number = Column(String(100))
    relation_with_sub_claim = Column(String(255))
    organization_name = Column(String(255))
    contact_person = Column(String(255))
    organization_type = Column(String(100))
    registration_number = Column(String(100))
    sanction_check = Column(Boolean, default=False)
    sanction_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", back_populates="parties")

    def __repr__(self):
        return f"<Party {self.party_name}>"


class LossAdjusterReport(Base):
    __tablename__ = "loss_adjuster_reports"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    vin = Column(String(100))
    vehicle_make = Column(String(100))
    vehicle_model = Column(String(100))
    vehicle_year = Column(Integer)
    file_url = Column(String(1000))
    analysis_result = Column(Text)
    uploaded_images = Column(JSON)  # list of image URLs
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<LossAdjusterReport {self.id}>"


class CollaborationMessage(Base):
    __tablename__ = "collaboration_messages"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    sender_name = Column(String(255))
    sender_initials = Column(String(5))
    tagged_users = Column(JSON)  # list of user names
    message = Column(Text)
    parent_id = Column(Integer, ForeignKey("collaboration_messages.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CollaborationMessage {self.id}>"


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    sub_claim_id = Column(Integer, ForeignKey("sub_claims.id"), nullable=False)
    reserve_id = Column(Integer, ForeignKey("reserves.id"), nullable=True)
    payment_method = Column(String(100))
    payment_amount = Column(Float)
    deductible_applied = Column(Float, default=0)
    net_payment = Column(Float)
    status = Column(String(50), default="Pending")
    requires_approval = Column(Boolean, default=False)
    approved_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    sub_claim = relationship("SubClaim", foreign_keys=[sub_claim_id])

    def __repr__(self):
        return f"<Settlement {self.id}>"

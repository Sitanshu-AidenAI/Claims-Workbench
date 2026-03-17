"""
Script to inject demo pending-approval settlements into the database
so the Manager Dashboard has data to display.
Run from the backend directory: python inject_demo_settlements.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.models import Settlement, SubClaim, Reserve

db = SessionLocal()

# Find sub-claims SC-167 (Bodily Injury) and SC-168 (Vehicle)
sc167 = db.query(SubClaim).filter(SubClaim.sub_claim_id == "SC-167").first()
sc168 = db.query(SubClaim).filter(SubClaim.sub_claim_id == "SC-168").first()

# Get their reserve IDs if any
r167_id = None
r168_id = None
if sc167:
    r = db.query(Reserve).filter(Reserve.sub_claim_id == sc167.id).first()
    r167_id = r.id if r else None
if sc168:
    r = db.query(Reserve).filter(Reserve.sub_claim_id == sc168.id).first()
    r168_id = r.id if r else None

# Pending settlements that exceed £100k authority limit
settlements_to_add = []

if sc167:
    settlements_to_add.append(Settlement(
        sub_claim_id=sc167.id,
        reserve_id=r167_id,
        payment_method="Bank Transfer",
        payment_amount=118500.00,
        deductible_applied=5080.00,
        net_payment=113420.00,
        status="Pending Manager Approval",
        requires_approval=True,
        approved_by=None,
    ))

if sc168:
    settlements_to_add.append(Settlement(
        sub_claim_id=sc168.id,
        reserve_id=r168_id,
        payment_method="Bank Transfer",
        payment_amount=220000.00,
        deductible_applied=10000.00,
        net_payment=210000.00,
        status="Pending Manager Approval",
        requires_approval=True,
        approved_by=None,
    ))

# Also add one already-approved settlement for the "Approved" stat
sc_for_approved = sc167 or sc168
if sc_for_approved:
    settlements_to_add.append(Settlement(
        sub_claim_id=sc_for_approved.id,
        reserve_id=None,
        payment_method="Cheque",
        payment_amount=75000.00,
        deductible_applied=5080.00,
        net_payment=69920.00,
        status="Approved",
        requires_approval=False,
        approved_by="Sarah Mitchell",
    ))

if settlements_to_add:
    db.add_all(settlements_to_add)
    db.commit()
    print(f"✅ Injected {len(settlements_to_add)} demo settlements")
    for s in settlements_to_add:
        db.refresh(s)
        print(f"   Settlement ID {s.id}: £{s.net_payment:,.0f} — {s.status}")
else:
    print("❌ Sub-claims SC-167 / SC-168 not found — run seed_data.py first")

db.close()

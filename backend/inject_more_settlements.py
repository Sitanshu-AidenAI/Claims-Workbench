"""
Injects additional demo pending-approval settlements for the Manager Dashboard.
Run: python inject_more_settlements.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.models import Settlement, SubClaim

db = SessionLocal()

# Grab all available sub-claims to spread settlements across
sub_claims = db.query(SubClaim).all()
sc_map = {sc.sub_claim_id: sc for sc in sub_claims}

# 7 additional realistic pending approvals with varied amounts/methods
extra_settlements = [
    dict(sc_key="SC-168", payment_amount=145000.00, deductible=5080.00, net=139920.00,
         method="Bank Transfer", status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-167", payment_amount=310000.00, deductible=10000.00, net=300000.00,
         method="Bank Transfer", status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-168", payment_amount=187500.00, deductible=7500.00, net=180000.00,
         method="CHAPS",      status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-167", payment_amount=125000.00, deductible=5080.00, net=119920.00,
         method="Bank Transfer", status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-168", payment_amount=250000.00, deductible=12500.00, net=237500.00,
         method="Bank Transfer", status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-167", payment_amount=108000.00, deductible=5080.00, net=102920.00,
         method="Cheque",    status="Pending Manager Approval", req_approval=True, approved_by=None),

    dict(sc_key="SC-168", payment_amount=175000.00, deductible=8750.00, net=166250.00,
         method="BACS",      status="Pending Manager Approval", req_approval=True, approved_by=None),
]

added = 0
for d in extra_settlements:
    sc = sc_map.get(d["sc_key"])
    if not sc:
        print(f"  ⚠️  Sub-claim {d['sc_key']} not found — skipping")
        continue
    s = Settlement(
        sub_claim_id=sc.id,
        reserve_id=None,
        payment_method=d["method"],
        payment_amount=d["payment_amount"],
        deductible_applied=d["deductible"],
        net_payment=d["net"],
        status=d["status"],
        requires_approval=d["req_approval"],
        approved_by=d["approved_by"],
    )
    db.add(s)
    added += 1

db.commit()
print(f"✅ Injected {added} additional pending approvals")
db.close()

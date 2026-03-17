"""
Seed database with demo data for POL-1000 (Motor Fleet) and POL-1004 (D&O Insurance).
Run: python seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.models import (
    User, Policy, InsuredVehicle, Coverage, Reinsurer,
    Claim, SubClaim, Task, ClaimDocument, SubClaimDocument,
    Reserve, ReinsuranceSplit, Deductible, Litigation, SIU,
    Stakeholder, Party
)
from app.auth import get_password_hash
from datetime import datetime

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()


def clear_all():
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()


def seed():
    clear_all()

    # ── Users ──────────────────────────────────────────────────────────────
    users = [
        User(email="fnol@arch.com", hashed_password=get_password_hash("demo123"), full_name="FNOL Team", role="fnol", avatar_initials="FT"),
        User(email="handler@arch.com", hashed_password=get_password_hash("demo123"), full_name="Rithvika Parvathi", role="handler", avatar_initials="RP"),
        User(email="manager@arch.com", hashed_password=get_password_hash("demo123"), full_name="Claims Manager", role="manager", avatar_initials="CM"),
        User(email="andrew@arch.com", hashed_password=get_password_hash("demo123"), full_name="Andrew Khalatov", role="handler", avatar_initials="AK"),
    ]
    db.add_all(users)
    db.commit()

    # ── Policy POL-1000 (Motor Fleet) ──────────────────────────────────────
    pol1000 = Policy(
        policy_number="POL-1000",
        insured_name="Johnston, Johnson and Parrish",
        company_name="Johnston, Johnson and Parrish",
        address="28 Hawley Rd, Camden, London NW1 8NP",
        zip_code="NW1 8NP",
        email="mccarthyscott@yahoo.com",
        phone="(020) 794-6128",
        preferred_contact="Email",
        preferred_contact_name="Mrs. Brenda Ramsey",
        opening_hours="9:00 AM - 5:00 PM",
        vat_registered=True,
        policy_start_date="09/05/2024",
        policy_end_date="09/05/2025",
        total_sum_insured=500000,
        line_of_business="Motor Fleet",
        status="Active",
    )
    db.add(pol1000)
    db.commit()

    vehicles = [
        InsuredVehicle(policy_id=pol1000.id, vin="1AB7234588912345", vehicle_make="Toyota", vehicle_model="Camry", year_of_manufacture=2022),
        InsuredVehicle(policy_id=pol1000.id, vin="2B7654321A907654", vehicle_make="Mercedes", vehicle_model="C300", year_of_manufacture=2023),
        InsuredVehicle(policy_id=pol1000.id, vin="3C12345678901234", vehicle_make="Mercedes", vehicle_model="GL200", year_of_manufacture=2017),
        InsuredVehicle(policy_id=pol1000.id, vin="4D987654321O9876", vehicle_make="Ford", vehicle_model="Focus", year_of_manufacture=2015),
        InsuredVehicle(policy_id=pol1000.id, vin="5E12345678901234", vehicle_make="BMW", vehicle_model="118I", year_of_manufacture=2023),
        InsuredVehicle(policy_id=pol1000.id, vin="6F987654321O9876", vehicle_make="Mercedes", vehicle_model="B160", year_of_manufacture=2016),
        InsuredVehicle(policy_id=pol1000.id, vin="7G12345678901234", vehicle_make="BMW", vehicle_model="520I", year_of_manufacture=2023),
        InsuredVehicle(policy_id=pol1000.id, vin="8H987654321O9876", vehicle_make="Toyota", vehicle_model="Camry", year_of_manufacture=2017),
        InsuredVehicle(policy_id=pol1000.id, vin="9312345678901234", vehicle_make="Nissan", vehicle_model="Altima", year_of_manufacture=2017),
        InsuredVehicle(policy_id=pol1000.id, vin="0K987654321O9876", vehicle_make="Mercedes", vehicle_model="B160", year_of_manufacture=2023),
    ]
    db.add_all(vehicles)

    coverages_1000 = [
        Coverage(policy_id=pol1000.id, coverage_type="Comprehensive Insurance (Standard Coverage)", coverage_limit=121600, deductible=24300),
        Coverage(policy_id=pol1000.id, coverage_type="Collision", coverage_limit=117800, deductible=17700),
        Coverage(policy_id=pol1000.id, coverage_type="Third Party Liability", coverage_limit=125000, deductible=22500),
        Coverage(policy_id=pol1000.id, coverage_type="Emergency Medical Expense", coverage_limit=115200, deductible=11500),
        Coverage(policy_id=pol1000.id, coverage_type="Natural Disaster", coverage_limit=80000, deductible=8000),
        Coverage(policy_id=pol1000.id, coverage_type="Uninsured Motorist", coverage_limit=60000, deductible=5000),
        Coverage(policy_id=pol1000.id, coverage_type="Underinsured Motorist", coverage_limit=60000, deductible=5000),
    ]
    db.add_all(coverages_1000)

    reinsurers_1000 = [
        Reinsurer(policy_id=pol1000.id, reinsurer_name="Our Share", agreement_type="Quote Share", share_percentage=50, coded_amount=48000, payment_amount=48000),
        Reinsurer(policy_id=pol1000.id, reinsurer_name="Munich Re", agreement_type="Quote Share", share_percentage=30, coded_amount=36000, payment_amount=36000),
        Reinsurer(policy_id=pol1000.id, reinsurer_name="Berkshire Hathaway", agreement_type="Quote Share", share_percentage=20, coded_amount=12000, payment_amount=12000),
    ]
    db.add_all(reinsurers_1000)
    db.commit()

    # ── Policy POL-1004 (D&O) ──────────────────────────────────────────────
    pol1004 = Policy(
        policy_number="POL-1004",
        insured_name="PharmaCure",
        company_name="PharmaCure",
        address="15 Pharma Blvd, London EC1A 1BB",
        zip_code="EC1A 1BB",
        email="legal@pharmacure.com",
        phone="(020) 123-4567",
        preferred_contact="Email",
        preferred_contact_name="Mr. James Clarke",
        opening_hours="9:00 AM - 6:00 PM",
        vat_registered=True,
        policy_start_date="01/01/2024",
        policy_end_date="01/01/2025",
        total_sum_insured=2000000,
        line_of_business="D&O Insurance",
        status="Active",
    )
    db.add(pol1004)
    db.commit()

    coverages_1004 = [
        Coverage(policy_id=pol1004.id, coverage_type="Directors & Officers Liability", coverage_limit=1000000, deductible=50000),
        Coverage(policy_id=pol1004.id, coverage_type="Defense Cost Reimbursement", coverage_limit=500000, deductible=10000),
        Coverage(policy_id=pol1004.id, coverage_type="Company Reimbursement", coverage_limit=500000, deductible=25000),
    ]
    db.add_all(coverages_1004)

    reinsurers_1004 = [
        Reinsurer(policy_id=pol1004.id, reinsurer_name="Our Share", agreement_type="Quote Share", share_percentage=50, coded_amount=240000, payment_amount=240000),
        Reinsurer(policy_id=pol1004.id, reinsurer_name="Munich Re", agreement_type="Quote Share", share_percentage=30, coded_amount=144000, payment_amount=144000),
        Reinsurer(policy_id=pol1004.id, reinsurer_name="Berkshire Hathaway", agreement_type="Quote Share", share_percentage=20, coded_amount=96000, payment_amount=96000),
    ]
    db.add_all(reinsurers_1004)
    db.commit()

    # ── Claims ─────────────────────────────────────────────────────────────
    # Existing completed claims (for history view)
    old_claims_data = [
        ("CL-237", "POL-1004", pol1004.id, "PharmaCure", "Completed", "High", "25/05/2025"),
        ("CL-238", "POL-1004", pol1004.id, "PharmaCure", "Completed", "Medium", "25/05/2025"),
        ("CL-239", "POL-1004", pol1004.id, "PharmaCure", "Completed", "Medium", "02/06/2025"),
        ("CL-240", "POL-1004", pol1004.id, "PharmaCure", "Completed", "Low", "02/06/2025"),
        ("CL-241", "POL-1004", pol1004.id, "PharmaCure", "Completed", "Low", "02/06/2025"),
        ("CL-340", "POL-1000", pol1000.id, "Johnston, Johnson and Parrish", "Completed", "High", "25/05/2025"),
        ("CL-341", "POL-1000", pol1000.id, "Johnston, Johnson and Parrish", "Completed", "High", "25/05/2025"),
        ("CL-342", "POL-1000", pol1000.id, "Johnston, Johnson and Parrish", "Completed", "High", "30/05/2025"),
    ]
    for cid_str, pol_num, pol_id, cname, cstatus, cpriority, dloss in old_claims_data:
        c = Claim(
            claim_id=cid_str, policy_number=pol_num, policy_id=pol_id,
            company_name=cname, insured_name=cname,
            date_of_loss=dloss, status=cstatus, priority=cpriority,
            reporting_status="Late Report" if cpriority == "High" else "Timely Reported",
            description_of_loss="Historical claim", type_of_incident="Collision",
        )
        db.add(c)
    db.commit()

    # Main demo claim CL-242 (POL-1000 Motor Fleet)
    claim242 = Claim(
        claim_id="CL-242",
        policy_id=pol1000.id,
        policy_number="POL-1000",
        company_name="Johnston, Johnson and Parrish",
        insured_name="Johnston, Johnson and Parrish",
        date_of_loss="25/05/2025",
        time_of_loss="21:51:08",
        description_of_loss="A car collision occurred at Camden. The accident involved one of the insured vehicles and resulted in injury to the driver.",
        type_of_incident="Collision",
        cause_of_loss="Collision",
        police_officer_name="Louis Taylor",
        police_station="Polizeipräsidium Berlin",
        police_telephone="+44 7485 123456",
        incident_reference="INC 1370",
        location_of_loss="Camden",
        severity="Medium",
        status="In Progress",
        reporting_status="Late Report",
        priority="High",
        assigned_handler="Rithvika Parvathi",
        previous_claim_history=True,
        requested_amount=94200,
    )
    db.add(claim242)
    db.commit()

    # Sub-claims for CL-242
    sc_vehicle = SubClaim(
        sub_claim_id="SC-168",
        claim_id=claim242.id,
        coverage_name="Vehicle Coverage",
        sub_claim_type="PP Vehicle",
        damage_description="Vehicle damage from collision at Camden. Front-end impact, airbag deployment, structural damage.",
        claim_owner="Johnston, Johnson and Parrish",
        claimant_name="Mrs. Brenda Ramsey",
        claimant_gender="Female",
        claimant_dob="12/10/1985",
        claimant_contact="(447) 711-2345",
        status="FNOL Completed",
        loss_estimate=15000,
        risk_score=46,
        fraud_score=30,
        risk_level="Moderate Risk",
        fraud_level="Low",
    )
    sc_injury = SubClaim(
        sub_claim_id="SC-167",
        claim_id=claim242.id,
        coverage_name="Bodily Injury Liability",
        sub_claim_type="Bodily Injury",
        damage_description="A car collision occurred at Camden. The accident involved vehicles and resulted in the injury of the driver.",
        claim_owner="Johnston, Johnson and Parrish",
        claimant_name="Mrs. Brenda Ramsey",
        claimant_gender="Male",
        claimant_dob="12/10/2005",
        claimant_contact="(447) 711-2345",
        status="FNOL Completed",
        loss_estimate=15000,
        risk_score=46,
        fraud_score=30,
        risk_level="Moderate Risk",
        fraud_level="Low",
        part_of_body="Left Arm",
        cause_of_injury="Injury to the left arm caused by a vehicle collision at Werkstrabe involving the driver and the third party",
        nature_of_injury="Physical trauma including contusions and soft tissue damage to the left arm.",
        injury_key="contusions and soft tissue injury of the left arm.",
    )
    db.add_all([sc_vehicle, sc_injury])
    db.commit()

    # Tasks for SC-167 (Bodily Injury)
    tasks_167 = [
        Task(sub_claim_id=sc_injury.id, description="Update Claim Records", details="Analyse the report detailing mild to tissue injury to the left arm.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
        Task(sub_claim_id=sc_injury.id, description="Review Third-Party Injury Report", details="Document findings, expert opinions, and updates.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
        Task(sub_claim_id=sc_injury.id, description="Coordinate with Medical Experts", details="Consult to understand extent and recovery time.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
        Task(sub_claim_id=sc_injury.id, description="Assess Impact on Claim", details="Evaluate financial impact of left arm injury on this claim.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
        Task(sub_claim_id=sc_injury.id, description="Verify Medical Documentation", details="Ensure all medical records and treatment plans are complete.", assigned_to="Andrew Khalatov", due_date="9/13/2024", status="New"),
        Task(sub_claim_id=sc_injury.id, description="Review Third-Party Injury Report", details="Document findings and expert opinions.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
    ]
    db.add_all(tasks_167)

    # Tasks for SC-168 (Vehicle)
    tasks_168 = [
        Task(sub_claim_id=sc_vehicle.id, description="Inspect Vehicle Damage", details="Assess structural damage to Toyota Camry.", assigned_to="Andrew Khalatov", due_date="9/12/2024", status="New"),
        Task(sub_claim_id=sc_vehicle.id, description="Arrange Repair Estimate", details="Get quotes from approved repairers.", assigned_to="Andrew Khalatov", due_date="9/14/2024", status="New"),
    ]
    db.add_all(tasks_168)

    # Documents for CL-242
    doc1 = ClaimDocument(
        claim_id=claim242.id,
        vin="1AB7234588912345",
        file_name="Legal evidence",
        file_category="FIR",
    )
    db.add(doc1)

    # Documents for SC-167
    doc_sc167 = SubClaimDocument(
        sub_claim_id=sc_injury.id,
        vin="1AB7234588912345",
        file_name="Legal evidence",
        file_category="FIR",
        is_mandatory=True,
    )
    db.add(doc_sc167)

    # Reserves for SC-167
    reserve1 = Reserve(
        sub_claim_id=sc_injury.id,
        standing_reserve="J00",
        reserve_amount=120000,
        deductible=5080,
        added_by="Rithvika Parvathi",
        comments="Initial reserve for bodily injury",
        status="Approved",
    )
    reserve2 = Reserve(
        sub_claim_id=sc_injury.id,
        standing_reserve="J00",
        reserve_amount=30000,
        deductible=0,
        added_by="Rithvika Parvathi",
        comments="Medical expenses reserve",
        status="Approved",
    )
    db.add_all([reserve1, reserve2])
    db.commit()

    # Reinsurance splits for reserves
    for r, amt in [(reserve1, 120000), (reserve2, 30000)]:
        db.add_all([
            ReinsuranceSplit(reserve_id=r.id, reinsurer_name="Our Share", agreement_type="Quote Share", share_percentage=50, coded_amount=amt*0.5, payment_amount=amt*0.5),
            ReinsuranceSplit(reserve_id=r.id, reinsurer_name="Munich Re", agreement_type="Quote Share", share_percentage=30, coded_amount=amt*0.3, payment_amount=amt*0.3),
            ReinsuranceSplit(reserve_id=r.id, reinsurer_name="Berkshire Hathaway", agreement_type="Quote Share", share_percentage=20, coded_amount=amt*0.2, payment_amount=amt*0.2),
        ])

    # Deductibles for SC-167
    ded1 = Deductible(sub_claim_id=sc_injury.id, deductible_type="Fixed", deductible_amount=5080, applied_on="2024-09-12", status="Pending")
    db.add(ded1)

    # Litigation
    lit = Litigation(sub_claim_id=sc_injury.id, is_locked=True)
    db.add(lit)

    # SIU
    siu = SIU(sub_claim_id=sc_injury.id, siu_status="Normal")
    db.add(siu)

    # Stakeholders (Subrogation parties)
    stk1 = Stakeholder(sub_claim_id=sc_injury.id, section="Subrogation", party_name="MasSicure Insurance AG", party_role="Third Party Insurer", party_type="Insurance Company", assigned_to="lubrin@massicureinsurance.de", third_party_code="DE-SUB-001")
    stk2 = Stakeholder(sub_claim_id=sc_injury.id, section="Subrogation", party_name="Müller Transport GmbH", party_role="Legal Entity", party_type="Government Body", assigned_to="contact@mullertransport.de", third_party_code="DE-SUB-002")
    stk3 = Stakeholder(sub_claim_id=sc_injury.id, section="Subrogation", party_name="Autohaus Müller GmbH", party_role="Legal Representative", party_type="Legal Firm", assigned_to="legal@autohausmueller.de", third_party_code="DE-SUB-003")

    # Ext Vehicle Management stakeholders
    ext1 = Stakeholder(sub_claim_id=sc_vehicle.id, section="Ext Vehicle Manage", party_name="ABC Rent-A-Car", party_role="Hire Company", party_type="Car Hire", assigned_to="contact@abcrentalco.com", third_party_code="DE-HIRE-031")
    ext2 = Stakeholder(sub_claim_id=sc_vehicle.id, section="Ext Vehicle Manage", party_name="ABC Car Rentals AG", party_role="Hire Company", party_type="Car Hire", assigned_to="info@abccarrentalsag.com", third_party_code="DE-HIRE-032")

    # Salvage
    salv = Stakeholder(sub_claim_id=sc_vehicle.id, section="Salvage", party_name="ARC Auto Salvage", party_role="Salvage Handler", party_type="Salvage Company", assigned_to="services@abcautosalvage.com")

    db.add_all([stk1, stk2, stk3, ext1, ext2, salv])
    db.commit()

    print("Seed data loaded successfully.")
    print("Login credentials:")
    print("  FNOL: fnol@arch.com / demo123")
    print("  Handler: handler@arch.com / demo123")
    print("  Manager: manager@arch.com / demo123")
    db.close()


if __name__ == "__main__":
    seed()

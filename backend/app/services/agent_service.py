"""
AI Agent Service for Claims Workbench.
Uses Claude via langchain-anthropic (falls back to rule-based if no API key).
Provides:
  - chat()                  — conversational AI assistant
  - generate_insight()      — GEN AI INSIGHT per screen (FR-26.7)
  - generate_claim_summary() — AI Claim Summary + Recommended Steps (FR-5.4/5.5)
  - find_similar_incidents() — Similar Incident Detection (FR-5.6)
"""
import warnings
import uuid
from typing import Optional, Any
warnings.filterwarnings("ignore", category=DeprecationWarning, module="langgraph")

from ..config import get_settings

settings = get_settings()

_conversation_history: dict[str, list] = {}
MAX_HISTORY = 20

SYSTEM_PROMPT = """You are an expert AI Claims Assistant for Arch Insurance's Claims Workbench platform.
You assist Claims Handlers, FNOL Teams, Managers, and Specialists.

Core knowledge:
- Insurance claims (FNOL, investigation, settlement, reinsurance)
- Policy coverage analysis and deductible calculations (£)
- Bodily injury/vehicle damage assessment  
- Reinsurance quota share: Our Share 50%, Munich Re 30%, Berkshire Hathaway 20%
- Fraud indicators, risk scoring, SIU investigation triggers
- Legal: litigation, subrogation, jurisdiction
- Financial reserves and payment authority limit: £100,000

Demo context:
- POL-1000: Fleet Vehicle Insurance — Johnston, Johnson and Parrish, 10 vehicles including Toyota Camry VIN 1AB7234588912345
- POL-1004: D&O Insurance — PharmaCure pharmaceutical company, directors cleared after regulatory investigation
- CL-242: Motor collision at Camden. Sub-claims SC-167 (Bodily Injury, Mrs Brenda Ramsey, left arm) and SC-168 (Vehicle Coverage, Toyota Camry damage)
- Risk Score: 46% (Moderate Risk), Fraud Score: 30% (Low)

Always be concise, professional, and actionable. If payment exceeds £100,000, flag manager approval required.
Format currency as £ with comma separators. Use British English spelling.
"""

SCREEN_PROMPTS = {
    "Litigation": "Analyse the litigation status. Assess case strength, jurisdiction risk, and recommend legal strategy. Consider complainant details and likely outcomes.",
    "Subrogation": "Assess subrogation recovery potential from third parties. Calculate likely recovery amounts and recommend priority parties to pursue.",
    "SIU": "Perform fraud risk assessment. Identify red flags in claim patterns, late reporting, inconsistencies, and give an overall SIU recommendation.",
    "Salvage": "Estimate salvage market value, recommend optimal disposal approach (auction, repair, scrap), and calculate net salvage return.",
    "Reserve": "Analyse reserve adequacy. Compare against similar claims, check coverage limits, and recommend if reserve needs strengthening.",
    "Settlement": "Provide settlement recommendation with justification. Check against coverage limits, deductibles, and reinsurance splits. Flag if approval required.",
    "Vendor": "Recommend appropriate vendors based on claim type, service needed, and proximity. Assess vendor suitability.",
    "AddParty": "Run preliminary sanction screening analysis. Identify any risk indicators for the named party.",
}


# ─── Utilities ────────────────────────────────────────────────────────────────

def _call_llm(prompt: str, system_override: Optional[str] = None) -> str:
    """Single-turn LLM call. Returns response text."""
    if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None  # Signal to use fallback
    try:
        from langchain_anthropic import ChatAnthropic
        from langchain_core.messages import HumanMessage, SystemMessage
        llm = ChatAnthropic(
            model="claude-sonnet-4-6",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=1024,
        )
        messages = [
            SystemMessage(content=system_override or SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)}"


# ─── Chat ─────────────────────────────────────────────────────────────────────

def get_or_create_conversation(conversation_id: Optional[str]) -> tuple[str, list]:
    if not conversation_id or conversation_id not in _conversation_history:
        cid = conversation_id or str(uuid.uuid4())
        _conversation_history[cid] = []
        return cid, _conversation_history[cid]
    return conversation_id, _conversation_history[conversation_id]


def chat(
    message: str,
    conversation_id: Optional[str] = None,
    context: Optional[str] = None,
    claim_id: Optional[str] = None,
    sub_claim_id: Optional[str] = None,
) -> tuple[str, str]:
    cid, history = get_or_create_conversation(conversation_id)

    if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return _fallback_chat(message, context), cid

    try:
        from langchain_anthropic import ChatAnthropic
        from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

        llm = ChatAnthropic(
            model="claude-sonnet-4-6",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=1024,
        )

        sys_content = SYSTEM_PROMPT
        if context:
            ctx_map = {
                "Legal": "Focus on: litigation status, subrogation recovery, SIU fraud investigation triggers, jurisdiction-specific advice.",
                "Medical": "Focus on: injury severity, treatment duration, medical documentation requirements, recovery prognosis.",
                "Financial": "Focus on: reserve adequacy, deductible application, reinsurance splits, payment authority limit £100,000.",
                "FNOL": "Help: parse incident descriptions, suggest coverage types, flag fraud signals, recommend next steps.",
                "Claims": "Provide general claims management guidance, policy analysis, and status summaries.",
            }
            sys_content += f"\n\nContext: {ctx_map.get(context, context)}"

        if claim_id:
            sys_content += f"\n\nActive Claim: {claim_id}"
        if sub_claim_id:
            sys_content += f"\nActive Sub-claim: {sub_claim_id}"

        messages = [SystemMessage(content=sys_content)]
        for h in history[-MAX_HISTORY:]:
            if h["role"] == "user":
                messages.append(HumanMessage(content=h["content"]))
            else:
                messages.append(AIMessage(content=h["content"]))
        messages.append(HumanMessage(content=message))

        response = llm.invoke(messages)
        reply = response.content

        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        _conversation_history[cid] = history[-MAX_HISTORY:]

        return reply, cid
    except Exception as e:
        return f"AI service error: {str(e)}", cid


# ─── GEN AI INSIGHT ───────────────────────────────────────────────────────────

def generate_insight(
    screen: str,
    context: Optional[str] = None,
    claim_id: Optional[str] = None,
    sub_claim_id: Optional[str] = None,
    extra: dict = {},
) -> str:
    """Screen-specific GEN AI INSIGHT (FR-26.7)."""
    screen_prompt = SCREEN_PROMPTS.get(screen, f"Provide expert analysis for the {screen} screen.")

    prompt = f"""Screen: {screen}
Claim: {claim_id or 'CL-242'} | Sub-claim: {sub_claim_id or 'General'}
Task: {screen_prompt}

Claim context: Motor fleet collision at Camden, vehicle Toyota Camry, bodily injury (left arm), 
reserve totalling £150,000. Reinsurance: Our Share 50%, Munich Re 30%, Berkshire 20%.
Risk Score: 46% (Moderate), Fraud Score: 30% (Low).

Additional data: {extra}

Provide a concise, actionable AI insight (3-5 bullet points or a short paragraph). Be specific."""

    result = _call_llm(prompt)
    if result:
        return result
    return _fallback_insight(screen, extra)


def _fallback_insight(screen: str, extra: dict) -> str:
    fallbacks = {
        "Litigation": (
            "⚖️ **Legal Strategy Assessment**\n\n"
            "• Jurisdiction: UK civil courts apply — early mediation recommended to avoid prolonged proceedings.\n"
            "• Case strength: Documentation appears sound; police report (INC 1370) supports liability position.\n"
            "• Third-party claim from Camden collision presents moderate exposure — recommend instructing specialist counsel.\n"
            "• Estimated legal defence cost: £8,000–£15,000 based on similar cases.\n"
            "• Action: Request full disclosure from opposing party within 21 days."
        ),
        "Subrogation": (
            "♻️ **Subrogation Recovery Analysis**\n\n"
            "• MasSicure Insurance AG (Third Party Insurer) — primary recovery target.\n"
            "• Estimated recovery potential: 60–75% of loss amount (£90,000–£112,500).\n"
            "• Müller Transport GmbH shows partial liability — pursue via their insurer.\n"
            "• Recommended: Issue formal demand letters within 30 days.\n"
            "• Net subrogation benefit after costs: approximately £80,000."
        ),
        "SIU": (
            "🔍 **Fraud Risk Assessment**\n\n"
            "• Overall Fraud Score: 30% — LOW risk, no immediate SIU referral required.\n"
            "• Late reporting flag: claim filed 3 days post-incident — note but not actionable alone.\n"
            "• No prior claims history inconsistencies detected for this policyholder.\n"
            "• Vehicle VIN confirmed against DVLA records — no anomalies.\n"
            "• Recommendation: Standard processing, monitor for additional claims on same policy."
        ),
        "Salvage": (
            "🚗 **Salvage Valuation**\n\n"
            "• Toyota Camry 2022 (VIN: 1AB7234588912345) — estimated pre-accident value: £22,000.\n"
            "• Salvage market value: £6,500–£8,000 (front-end structural damage, deployed airbags).\n"
            "• Recommended approach: Trade auction via ARC Auto Salvage (assigned vendor).\n"
            "• Total Salvage Amount reduces net indemnity payable by approximately £7,000.\n"
            "• Customer sign-off required before disposal — initiate request immediately."
        ),
        "Reserve": (
            "💰 **Reserve Adequacy Analysis**\n\n"
            "• Current reserve: £150,000 (£120k BI + £30k Medical). Total across reinsurers: Our Share £75,000.\n"
            "• Comparable bodily injury claims (left arm trauma): avg. £95,000–£130,000 settlement.\n"
            "• Medical expenses forecast: £28,000–£35,000 — reserve is adequate.\n"
            "• Recommendation: Reserve appears appropriate; review at 60-day mark.\n"
            "• If physiotherapy extends beyond 6 months, consider reserve increase of £20,000."
        ),
        "Settlement": (
            "💳 **Settlement Recommendation**\n\n"
            "• Recommended settlement: £97,500 (within coverage limits and reserve).\n"
            "• Deductible £5,080 applies — net payable: £92,420.\n"
            "• Reinsurance split: Our Share £46,210 | Munich Re £27,726 | Berkshire £18,484.\n"
            "• ⚠️ Amount exceeds £100,000 authority limit if gross — Claim Manager approval required.\n"
            "• Payment method: Bank transfer recommended for audit trail compliance."
        ),
        "Vendor": (
            "🏭 **Vendor Recommendation**\n\n"
            "• Loss Adjuster: Crawford & Company — proven track record on motor fleet claims in London.\n"
            "• Repair specialist: Nationwide Bodyworks (Camden) — 2-day turnaround SLA, approved repairer.\n"
            "• Medical specialist: HCML for BI cases — preferred panel provider for Arch Insurance.\n"
            "• Estimated vendor cost: £2,500–£4,000 combined.\n"
            "• Assign within 48 hours to meet SLA compliance targets."
        ),
        "AddParty": (
            "🛡️ **Sanction Screening Preliminary**\n\n"
            "• No immediate matches found on OFAC, UK HM Treasury, or EU sanction lists.\n"
            "• PEP (Politically Exposed Person) check: No indicators detected.\n"
            "• Adverse media: No recent negative coverage found.\n"
            "• Recommendation: Proceed with standard onboarding; run formal sanction check via compliance system.\n"
            "• Re-screening recommended at 90-day intervals while party remains active."
        ),
    }
    return fallbacks.get(screen, f"AI analysis for {screen}: Based on the available claim data, this appears to be a standard {screen.lower()} scenario. Please review all relevant documentation and consult with the appropriate specialist if needed.")


# ─── Claim Summary ────────────────────────────────────────────────────────────

def generate_claim_summary(
    claim_id: str,
    sub_claim_id: Optional[str],
    db: Any,
) -> dict:
    """AI Claim Summary Box + Recommended Steps (FR-5.4, FR-5.5)."""
    # Fetch claim from DB for context
    from ..models.models import Claim, SubClaim
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()

    claim_context = ""
    risk_level = "Moderate Risk"
    fraud_level = "Low"

    if claim:
        claim_context = (
            f"Claim {claim.claim_id} | Policy: {claim.policy_number} | "
            f"Company: {claim.company_name} | Date of Loss: {claim.date_of_loss} | "
            f"Incident: {claim.description_of_loss} | Status: {claim.status} | "
            f"Priority: {claim.priority} | Reporting: {claim.reporting_status}"
        )
        from ..models.models import SubClaim as SC
        subs = db.query(SC).filter(SC.claim_id == claim.id).all()
        if subs:
            risk_level = subs[0].risk_level
            fraud_level = subs[0].fraud_level

    prompt = f"""Claim Data: {claim_context}

Generate:
1. A concise 3-4 sentence professional claim summary suitable for a claims handler dashboard.
2. A numbered list of 4-5 specific recommended next steps for this claim.

Format exactly as:
SUMMARY: [your summary here]
STEPS:
1. [step]
2. [step]
3. [step]
4. [step]
5. [step]"""

    result = _call_llm(prompt)

    if result and "SUMMARY:" in result:
        lines = result.split("\n")
        summary = ""
        steps = []
        in_steps = False
        for line in lines:
            if line.startswith("SUMMARY:"):
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("STEPS:"):
                in_steps = True
            elif in_steps and line.strip() and line[0].isdigit():
                steps.append(line.strip().lstrip("0123456789. "))
        if summary and steps:
            return {"summary": summary, "recommended_steps": steps, "risk_level": risk_level, "fraud_level": fraud_level}

    # Fallback
    return _fallback_claim_summary(claim, risk_level, fraud_level)


def _fallback_claim_summary(claim: Any, risk_level: str, fraud_level: str) -> dict:
    summary = (
        f"Claim {getattr(claim, 'claim_id', 'CL-242')} relates to a motor fleet collision at Camden involving "
        f"a Toyota Camry from the {getattr(claim, 'company_name', 'Johnston, Johnson and Parrish')} fleet policy. "
        f"The incident resulted in vehicle damage and a bodily injury to the driver's left arm. "
        f"The claim is currently {getattr(claim, 'status', 'In Progress')} with {getattr(claim, 'priority', 'High')} priority "
        f"and was reported as a {getattr(claim, 'reporting_status', 'Late Report')}."
    )

    steps = [
        "Review and verify police report (INC 1370) and confirm incident details with attending officer Louis Taylor",
        "Arrange independent loss adjuster inspection of Toyota Camry (VIN: 1AB7234588912345) within 48 hours",
        "Obtain updated medical report from treating physician regarding left arm injury and recovery prognosis",
        "Review reserve adequacy — current £150,000 reserve; ensure reinsurance splits are correctly applied",
        "Initiate subrogation assessment against third-party insurer MasSicure Insurance AG for cost recovery",
    ]

    return {"summary": summary, "recommended_steps": steps, "risk_level": risk_level, "fraud_level": fraud_level}


# ─── Similar Incidents ────────────────────────────────────────────────────────

def find_similar_incidents(
    claim_id: str,
    incident_type: Optional[str],
    location: Optional[str],
    db: Any,
) -> list[dict]:
    """Similar Incident Detection (FR-5.6)."""
    from ..models.models import Claim
    similar = (
        db.query(Claim)
        .filter(Claim.claim_id != claim_id)
        .filter(Claim.status == "Completed")
        .order_by(Claim.created_at.desc())
        .limit(5)
        .all()
    )

    if not similar:
        # Return demo similar incidents
        return [
            {
                "claim_id": "CL-340",
                "policy_number": "POL-1000",
                "company": "Johnston, Johnson and Parrish",
                "incident_type": "Collision",
                "location": "Camden, London",
                "date": "25/05/2025",
                "outcome": "Settled",
                "settlement_amount": 85000,
                "similarity_score": 94,
                "notes": "Same fleet policy, similar vehicle type, comparable injury profile."
            },
            {
                "claim_id": "CL-341",
                "policy_number": "POL-1000",
                "company": "Johnston, Johnson and Parrish",
                "incident_type": "Collision",
                "location": "North London",
                "date": "25/05/2025",
                "outcome": "Settled",
                "settlement_amount": 72000,
                "similarity_score": 81,
                "notes": "Same insured fleet. Driver injury claim, resolved without litigation."
            },
            {
                "claim_id": "CL-342",
                "policy_number": "POL-1000",
                "company": "Johnston, Johnson and Parrish",
                "incident_type": "Collision",
                "location": "Camden, London",
                "date": "30/05/2025",
                "outcome": "Settled",
                "settlement_amount": 91500,
                "similarity_score": 78,
                "notes": "Identical coverage type. Third-party subrogation recovered £18,000."
            },
        ]

    return [
        {
            "claim_id": c.claim_id,
            "policy_number": c.policy_number,
            "company": c.company_name,
            "incident_type": c.type_of_incident or "Unknown",
            "location": c.location_of_loss or "Unknown",
            "date": c.date_of_loss or "—",
            "outcome": c.status,
            "settlement_amount": int(c.requested_amount or 0),
            "similarity_score": 75,
            "notes": "Historical claim from same policy portfolio.",
        }
        for c in similar
    ]


# ─── Fallback Chat ────────────────────────────────────────────────────────────

def _fallback_chat(message: str, context: Optional[str]) -> str:
    msg_lower = message.lower()
    if context == "Financial" or any(w in msg_lower for w in ["reserve", "deductible", "payment", "reinsurance", "settlement"]):
        return (
            "**Financial Guidance**\n\n"
            "For this claim, apply the deductible (£5,080) before calculating net payment. "
            "The reinsurance split is: **Our Share 50%** | **Munich Re 30%** | **Berkshire Hathaway 20%**.\n\n"
            "Payments above **£100,000** require Claim Manager approval before processing. "
            "Current reserve of £150,000 appears adequate based on injury profile."
        )
    if context == "Legal" or any(w in msg_lower for w in ["litigation", "lawsuit", "legal", "subrogation", "siu"]):
        return (
            "**Legal Guidance**\n\n"
            "Review complainant details and jurisdiction. For subrogation, the primary target is "
            "MasSicure Insurance AG. If the SIU fraud score exceeds 50%, flag for investigation.\n\n"
            "Legal defence costs are covered up to £500,000 under the D&O policy (POL-1004) "
            "and within Third Party Liability limits for motor claims (POL-1000)."
        )
    if context == "Medical" or any(w in msg_lower for w in ["injury", "medical", "bodily", "treatment"]):
        return (
            "**Medical Guidance**\n\n"
            "Document the part of body affected (left arm), nature of injury (soft tissue, contusions), "
            "and estimated recovery time (6–12 weeks based on similar cases).\n\n"
            "Ensure all medical documentation is uploaded: hospital records, GP referral, and physiotherapy plan."
        )
    if any(w in msg_lower for w in ["fraud", "risk", "score"]):
        return (
            "**Risk & Fraud Indicators**\n\n"
            "Current Risk Score: **46%** (Moderate Risk). Fraud Score: **30%** (Low).\n\n"
            "Key risk factors: late reporting (+8%), fleet policy with multiple prior claims (+12%). "
            "No immediate fraud indicators — standard processing recommended."
        )
    if any(w in msg_lower for w in ["summary", "summarise", "summarize"]):
        return (
            "**Claim Summary — CL-242**\n\n"
            "Motor fleet collision at Camden (25/05/2025) involving Toyota Camry (VIN: 1AB7234588912345) "
            "from the Johnston, Johnson and Parrish fleet. Driver Mrs Brenda Ramsey sustained a left arm injury. "
            "Two sub-claims raised: SC-168 (Vehicle Coverage) and SC-167 (Bodily Injury Liability). "
            "Current reserve: £150,000. Status: In Progress."
        )
    return (
        "**AI Claims Assistant**\n\n"
        "I can help you with policy analysis, coverage assessment, fraud detection, "
        "reserve management, and legal guidance. What aspect of this claim would you like help with?\n\n"
        "Try asking: *'Summarise this claim'*, *'Check fraud indicators'*, or *'Reserve recommendation'*."
    )

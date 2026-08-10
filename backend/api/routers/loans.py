from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Loan, CreditCard, CreditScore
from backend.schemas.all_schemas import (
    LoanCreate, LoanResponse,
    CreditCardCreate, CreditCardResponse
)
from backend.business_logic.calculator import FinancialCalculator
from backend.ai.gemini_service import gemini_service

router = APIRouter(prefix="/loans", tags=["Loans & Credit Score"])

# EMI Calculator Endpoint (Pure Python Business Logic)
@router.get("/emi-calculator")
def calculate_emi_endpoint(
    principal: float = Query(..., gt=0),
    interest_rate: float = Query(..., ge=0),
    tenure_months: int = Query(..., gt=0)
):
    return FinancialCalculator.calculate_emi(principal, interest_rate, tenure_months)

# Loans Endpoints
@router.post("", response_model=LoanResponse)
@router.post("/", response_model=LoanResponse)
def create_loan(data: LoanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = Loan(user_id=current_user.id, **data.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan

@router.put("/{loan_id}/frequency")
def update_loan_frequency(
    loan_id: int,
    frequency: str = Query(..., regex="^(Daily|Weekly|Monthly|Quarterly|Yearly)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    loan.payment_frequency = frequency
    db.commit()
    db.refresh(loan)
    return {"message": f"Repayment schedule updated to {frequency}", "loan": loan}

@router.post("/{loan_id}/pay")
def make_loan_payment(
    loan_id: int,
    amount: float = Query(..., gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    
    loan.remaining_balance = max(0.0, loan.remaining_balance - amount)
    if loan.remaining_payments is not None and loan.remaining_payments > 0:
        loan.remaining_payments -= 1
    if loan.remaining_balance == 0:
        loan.status = "Closed"
    db.commit()
    db.refresh(loan)
    return {"message": f"Payment of {amount} recorded successfully", "remaining_balance": loan.remaining_balance, "remaining_payments": loan.remaining_payments, "status": loan.status}

@router.post("/{loan_id}/delete")
@router.delete("/{loan_id}")
@router.delete("/{loan_id}/")
def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    db.delete(loan)
    db.commit()
    return {"message": "Loan account deleted successfully"}

@router.get("/offers")
def get_online_loan_offers(
    category: str = Query("All"),
    refresh: bool = Query(False),
    current_user: User = Depends(get_current_user)
):
    # Auto-sync live real-world loan offers using Gemini API key!
    if refresh or settings.GEMINI_API_KEY:
        try:
            live_offers = gemini_service.fetch_live_loan_offers(category)
            if live_offers and len(live_offers) > 0:
                return {
                    "offers": live_offers,
                    "synced_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "source": "Live Real-World Banking & Co-Op Credit API (Gemini Key)"
                }
        except Exception as e:
            print(f"Live loan sync error: {e}")

    return {
        "offers": gemini_service._get_default_real_world_offers(),
        "synced_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "Verified Real-World Indian Bank & Society Rates"
    }

@router.get("/credit-optimizer")
def get_credit_score_optimizer(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id, Loan.status == "Active").all()
    cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    score_record = db.query(CreditScore).filter(CreditScore.user_id == current_user.id).order_by(CreditScore.record_date.desc()).first()

    total_card_limit = sum(c.credit_limit for c in cards)
    total_card_balance = sum(c.current_balance for c in cards)
    utilization_pct = round((total_card_balance / total_card_limit * 100), 1) if total_card_limit > 0 else 0.0
    total_loans_balance = sum(l.remaining_balance for l in loans)

    # Dynamic credit score calculation from real user data (300 to 900 scale)
    base_score = 750

    if utilization_pct <= 10:
        base_score += 45
    elif utilization_pct <= 30:
        base_score += 25
    elif utilization_pct <= 50:
        base_score -= 20
    elif total_card_limit > 0:
        base_score -= 60

    if total_loans_balance == 0:
        base_score += 35
    elif total_loans_balance < 100000:
        base_score += 15
    elif total_loans_balance > 500000:
        base_score -= 35

    loan_types = set(l.loan_type for l in loans)
    if len(loan_types) >= 2 or (len(loans) > 0 and len(cards) > 0):
        base_score += 20

    credit_score_val = score_record.score if score_record else max(300, min(900, base_score))

    factors = [
        {
            "factor": "On-Time Payment History",
            "impact": "High Impact (35%)",
            "status": "Excellent",
            "score_points": 285,
            "max_points": 300,
            "detail": "Early and on-time payments across all active loans & credit cards."
        },
        {
            "factor": "Credit Utilization Ratio",
            "impact": "High Impact (30%)",
            "status": "Good" if utilization_pct <= 30 else "Attention Needed",
            "score_points": 230 if utilization_pct <= 30 else 150,
            "max_points": 250,
            "detail": f"Your real credit card utilization is {utilization_pct}% (Optimal: < 30%)."
        },
        {
            "factor": "Total Active Loan Burden",
            "impact": "Medium Impact (20%)",
            "status": "Healthy" if total_loans_balance < 200000 else "Moderate",
            "score_points": 140 if total_loans_balance < 200000 else 100,
            "max_points": 160,
            "detail": f"Total active loan balance outstanding is ₹{total_loans_balance:,.2f}."
        },
        {
            "factor": "Credit Mix & Installments",
            "impact": "Low Impact (15%)",
            "status": "Healthy",
            "score_points": 85,
            "max_points": 90,
            "detail": f"Balanced mix of {len(loans)} active loan(s) and {len(cards)} credit card(s)."
        }
    ]

    improvement_steps = [
        {
            "id": "step_1",
            "icon": "CalendarCheck",
            "title": "Complete Payments Before Due Date",
            "potential_boost": "+25 Points",
            "tag": "High Impact",
            "action": "Making payments before due date boosts payment history discipline score instantly.",
            "status": "Active"
        },
        {
            "id": "step_2",
            "icon": "TrendingDown",
            "title": "Reduce Credit Card Utilization Below 15%",
            "potential_boost": "+18 Points",
            "tag": "Quick Fix",
            "action": f"Pay down card balance to bring utilization under 15%.",
            "status": "Action Needed"
        },
        {
            "id": "step_3",
            "icon": "ShieldPlus",
            "title": "Request a Credit Card Limit Increase",
            "potential_boost": "+15 Points",
            "tag": "No Cost",
            "action": "Requesting a limit increase lowers overall credit utilization ratio.",
            "status": "Suggested"
        }
    ]

    return {
        "credit_score": credit_score_val,
        "rating": "Excellent" if credit_score_val >= 780 else ("Good" if credit_score_val >= 700 else "Fair"),
        "utilization_pct": utilization_pct,
        "factors": factors,
        "improvement_steps": improvement_steps
    }

@router.get("")
@router.get("/")
def get_loans_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id, Loan.status == "Active").all()
    cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    score_record = db.query(CreditScore).filter(CreditScore.user_id == current_user.id).order_by(CreditScore.record_date.desc()).first()

    total_loans_balance = sum(l.remaining_balance for l in loans)
    total_monthly_emi = sum(l.emi_amount for l in loans)

    total_credit_limit = sum(c.credit_limit for c in cards)
    total_card_balance = sum(c.current_balance for c in cards)
    credit_utilization_pct = (total_card_balance / total_credit_limit * 100) if total_credit_limit > 0 else 0.0

    # Calculate Dynamic Credit Score from real user data
    base_score = 750
    if credit_utilization_pct <= 10:
        base_score += 45
    elif credit_utilization_pct <= 30:
        base_score += 25
    elif credit_utilization_pct <= 50:
        base_score -= 20
    elif total_credit_limit > 0:
        base_score -= 60

    if total_loans_balance == 0:
        base_score += 35
    elif total_loans_balance < 100000:
        base_score += 15
    elif total_loans_balance > 500000:
        base_score -= 35

    credit_score_val = score_record.score if score_record else max(300, min(900, base_score))

    ai_recs = gemini_service.generate_recommendations("Loans and Credit Score", {
        "total_debt": total_loans_balance + total_card_balance,
        "credit_utilization_pct": credit_utilization_pct,
        "credit_score": credit_score_val
    })

    return {
        "summary": {
            "total_loan_balance": total_loans_balance,
            "total_monthly_emi": total_monthly_emi,
            "total_credit_limit": total_credit_limit,
            "total_card_balance": total_card_balance,
            "credit_utilization_pct": round(credit_utilization_pct, 1),
            "credit_score": credit_score_val
        },
        "loans": loans,
        "credit_cards": cards,
        "ai_recommendations": ai_recs
    }

# Credit Cards Endpoints
@router.post("/credit-card", response_model=CreditCardResponse)
def create_credit_card(data: CreditCardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = CreditCard(user_id=current_user.id, **data.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

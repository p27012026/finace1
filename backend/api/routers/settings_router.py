from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, UserSettings, Loan, CreditCard, CreditScore
from backend.business_logic.calculator import FinancialCalculator

router = APIRouter(prefix="/settings", tags=["User Settings"])

class CurrencyUpdate(BaseModel):
    currency: str

@router.get("/")
def get_user_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id, currency="INR (₹)")
        db.add(settings)
        db.commit()
        db.refresh(settings)

    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    score_record = db.query(CreditScore).filter(CreditScore.user_id == current_user.id).order_by(CreditScore.record_date.desc()).first()
    dyn_credit = FinancialCalculator.calculate_dynamic_credit_score(loans, cards)
    credit_score_val = score_record.score if score_record else dyn_credit["score"]

    return {
        "currency": settings.currency,
        "theme": settings.theme,
        "email_notifications": settings.email_notifications,
        "push_notifications": settings.push_notifications,
        "credit_score": credit_score_val,
        "credit_rating": dyn_credit["rating"],
        "credit_status": dyn_credit["status"]
    }

@router.put("/currency")
def update_currency(
    data: CurrencyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id, currency=data.currency)
        db.add(settings)
    else:
        settings.currency = data.currency
    db.commit()
    return {"message": "Currency updated successfully", "currency": data.currency}

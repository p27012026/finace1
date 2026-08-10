from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, UserSettings

router = APIRouter(prefix="/settings", tags=["User Settings"])

class CurrencyUpdate(BaseModel):
    currency: str

@router.get("/")
def get_user_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id, currency="USD ($)")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "currency": settings.currency,
        "theme": settings.theme,
        "email_notifications": settings.email_notifications,
        "push_notifications": settings.push_notifications
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

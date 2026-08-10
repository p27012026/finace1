from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Notification
from backend.schemas.all_schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.post("/{id}/read")
def mark_notification_read(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}

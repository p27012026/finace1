from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, HealthSecurity
from backend.schemas.all_schemas import HealthSecurityCreate, HealthSecurityResponse
from backend.ai.gemini_service import gemini_service

router = APIRouter(prefix="/health-security", tags=["Health Security (Insurance)"])

@router.post("/", response_model=HealthSecurityResponse)
def create_health_security(data: HealthSecurityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    hs = HealthSecurity(user_id=current_user.id, **data.model_dump())
    db.add(hs)
    db.commit()
    db.refresh(hs)
    return hs

@router.get("/")
def get_health_securities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    policies = db.query(HealthSecurity).filter(HealthSecurity.user_id == current_user.id).all()
    
    total_coverage = sum(p.coverage_amount for p in policies)
    total_premiums = sum(p.premium_amount for p in policies)

    ai_recs = gemini_service.generate_recommendations("Health Security Insurance", {
        "total_coverage": total_coverage,
        "total_premiums": total_premiums,
        "policies_count": len(policies)
    })

    return {
        "summary": {
            "total_coverage": total_coverage,
            "total_annual_premiums": total_premiums,
            "active_policies": len(policies)
        },
        "policies": policies,
        "ai_recommendations": ai_recs
    }

@router.delete("/{id}")
def delete_health_security(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(HealthSecurity).filter(HealthSecurity.id == id, HealthSecurity.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Insurance policy not found")
    db.delete(item)
    db.commit()
    return {"message": "Insurance policy deleted"}

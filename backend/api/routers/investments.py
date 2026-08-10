from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Investment
from backend.schemas.all_schemas import InvestmentCreate, InvestmentResponse
from backend.business_logic.calculator import FinancialCalculator
from backend.ai.gemini_service import gemini_service

router = APIRouter(prefix="/investments", tags=["Investments"])

@router.post("/", response_model=InvestmentResponse)
def create_investment(data: InvestmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = Investment(user_id=current_user.id, **data.model_dump())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.get("/")
def get_investments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    total_invested = sum(i.amount_invested for i in items)
    total_current = sum(i.current_value for i in items)
    pnl_data = FinancialCalculator.calculate_investment_pnl(total_invested, total_current)

    allocation = {}
    for i in items:
        allocation[i.asset_type] = allocation.get(i.asset_type, 0.0) + i.current_value

    ai_recs = gemini_service.generate_recommendations("Investment", {
        "pnl_pct": pnl_data["pnl_pct"],
        "allocation": allocation
    })

    return {
        "portfolio_summary": pnl_data,
        "asset_allocation": allocation,
        "investments": items,
        "ai_recommendations": ai_recs
    }

@router.delete("/{id}")
def delete_investment(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == id, Investment.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment item not found")
    db.delete(inv)
    db.commit()
    return {"message": "Investment deleted successfully"}

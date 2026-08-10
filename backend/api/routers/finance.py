from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Income, Expense, Budget, Goal
from backend.schemas.all_schemas import (
    IncomeCreate, IncomeResponse,
    ExpenseCreate, ExpenseResponse,
    BudgetCreate, BudgetResponse,
    GoalCreate, GoalResponse
)
from backend.business_logic.calculator import FinancialCalculator

router = APIRouter(prefix="/finance", tags=["Finance Management"])

# --- INCOME ENDPOINTS ---
@router.post("/income", response_model=IncomeResponse)
def create_income(data: IncomeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    income = Income(user_id=current_user.id, **data.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.get("/income", response_model=List[IncomeResponse])
def get_incomes(
    source: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Income).filter(Income.user_id == current_user.id)
    if source:
        query = query.filter(Income.source == source)
    if search:
        query = query.filter(Income.title.ilike(f"%{search}%"))
    return query.order_by(Income.date.desc()).offset(skip).limit(limit).all()

@router.delete("/income/{id}")
def delete_income(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Income).filter(Income.id == id, Income.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Income item not found")
    db.delete(item)
    db.commit()
    return {"message": "Income item deleted successfully"}


# --- EXPENSE ENDPOINTS (A-Z Categories) ---
@router.post("/expense", response_model=ExpenseResponse)
def create_expense(data: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = Expense(user_id=current_user.id, **data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/expense", response_model=List[ExpenseResponse])
def get_expenses(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("date", regex="^(date|amount)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if category:
        query = query.filter(Expense.category == category)
    if search:
        query = query.filter(Expense.title.ilike(f"%{search}%"))

    order_col = getattr(Expense, sort_by)
    if sort_order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    return query.offset(skip).limit(limit).all()

@router.delete("/expense/{id}")
def delete_expense(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Expense).filter(Expense.id == id, Expense.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Expense item not found")
    db.delete(item)
    db.commit()
    return {"message": "Expense item deleted successfully"}


# --- BUDGET PLANNING ---
@router.post("/budget", response_model=BudgetResponse)
def create_budget(data: BudgetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.category == data.category).first()
    if existing:
        existing.limit_amount = data.limit_amount
        existing.period = data.period
        db.commit()
        db.refresh(existing)
        return existing
    
    budget = Budget(user_id=current_user.id, **data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.get("/budget")
def get_budgets_with_actuals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()

    actual_by_cat = {}
    for e in expenses:
        actual_by_cat[e.category] = actual_by_cat.get(e.category, 0.0) + e.amount

    result = []
    for b in budgets:
        actual = actual_by_cat.get(b.category, 0.0)
        variance = b.limit_amount - actual
        status = "Normal" if actual <= b.limit_amount else "Overspent Warning"
        result.append({
            "id": b.id,
            "category": b.category,
            "period": b.period,
            "limit_amount": b.limit_amount,
            "actual_spent": actual,
            "variance": variance,
            "overspent": actual > b.limit_amount,
            "status": status
        })
    return result


# --- SAVINGS GOALS ---
@router.post("/goal", response_model=GoalResponse)
def create_goal(data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = Goal(user_id=current_user.id, **data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/goal")
def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    res = []
    for g in goals:
        calc = FinancialCalculator.calculate_goal_progress(
            target_amount=g.target_amount,
            current_amount=g.current_amount,
            target_date_months_remaining=12
        )
        res.append({
            "id": g.id,
            "title": g.title,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "priority": g.priority,
            "progress_pct": calc["progress_pct"],
            "remaining_amount": calc["remaining_amount"],
            "required_monthly_savings": calc["required_monthly_savings"]
        })
    return res

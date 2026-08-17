from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import (
    User, Income, Expense, Budget, Goal, Investment,
    HealthSecurity, Loan, CreditCard, CreditScore, Notification
)
from backend.business_logic.calculator import FinancialCalculator
from backend.ai.gemini_service import gemini_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/widgets")
def get_dashboard_widgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Total Income
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    total_income = sum(i.amount for i in incomes) or 0.0

    # 2. Total Expenses
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_expenses = sum(e.amount for e in expenses) or 0.0

    # 3. Investments & Cash Savings
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    total_investments = sum(inv.current_value for inv in investments) or 0.0
    cash_savings = max(0.0, total_income - total_expenses)

    # 4. Loans & Credit Cards
    loans = db.query(Loan).filter(Loan.user_id == current_user.id, Loan.status == "Active").all()
    total_loans = sum(l.remaining_balance for l in loans) or 0.0
    total_emi = sum(l.emi_amount for l in loans) or 0.0

    credit_cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    total_credit_limit = sum(c.credit_limit for c in credit_cards) or 0.0
    current_credit_balance = sum(c.current_balance for c in credit_cards) or 0.0

    # 5. Budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    total_budget_limit = sum(b.limit_amount for b in budgets) or 0.0

    # 6. Goals
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    # 7. Insurance Policies
    health_securities = db.query(HealthSecurity).filter(HealthSecurity.user_id == current_user.id).all()
    health_policies_count = len(health_securities)
    total_health_coverage = sum(h.coverage_amount for h in health_securities) or 0.0

    # 8. Dynamic Credit Score (Pure Python calculation)
    dynamic_credit_eval = FinancialCalculator.calculate_dynamic_credit_score(loans, credit_cards)
    score_val = dynamic_credit_eval["score"]

    # Execute Pure Python Business Logic Calculations
    health_eval = FinancialCalculator.calculate_health_score(
        monthly_income=total_income,
        monthly_expenses=total_expenses,
        total_debt_payments=total_emi,
        total_credit_limit=total_credit_limit,
        current_credit_balance=current_credit_balance,
        emergency_fund_balance=cash_savings,
        monthly_investment=total_investments * 0.05,
        budget_limit=total_budget_limit,
        health_security_policies_count=health_policies_count,
        total_health_coverage=total_health_coverage
    )

    net_worth_eval = FinancialCalculator.calculate_net_worth(
        investments_value=total_investments,
        cash_savings=cash_savings,
        total_loan_balances=total_loans,
        credit_card_balances=current_credit_balance
    )

    cash_flow_eval = FinancialCalculator.calculate_cash_flow(total_income, total_expenses)

    dti_pct = round((total_emi / total_income * 100) if total_income > 0 else 0.0, 1)

    # Recharts Aggregation
    expense_by_category = {}
    for e in expenses:
        expense_by_category[e.category] = expense_by_category.get(e.category, 0.0) + e.amount
    
    expense_chart_data = [{"category": k, "amount": v} for k, v in expense_by_category.items()]

    investment_allocation = {}
    for inv in investments:
        investment_allocation[inv.asset_type] = investment_allocation.get(inv.asset_type, 0.0) + inv.current_value
    
    investment_chart_data = [{"type": k, "value": v} for k, v in investment_allocation.items()]

    # Quick AI Suggestions
    ai_insights = gemini_service.generate_recommendations("Dashboard", {
        "health_score": health_eval["score"],
        "net_worth": net_worth_eval["net_worth"],
        "dti_pct": dti_pct,
        "cash_flow": cash_flow_eval["net_cash_flow"]
    })

    return {
        "financial_health_score": health_eval,
        "net_worth": net_worth_eval,
        "cash_flow": cash_flow_eval,
        "dti_ratio_pct": dti_pct,
        "monthly_growth_pct": 4.5, # Deterministic month-over-month growth baseline
        "emergency_fund_status": {
            "current_balance": round(cash_savings, 2),
            "target_balance": round(total_expenses * 3, 2),
            "coverage_months": round(cash_savings / total_expenses, 1) if total_expenses > 0 else 6.0
        },
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_savings": cash_flow_eval["net_cash_flow"],
        "total_investments": total_investments,
        "total_loans": total_loans,
        "upcoming_emi": total_emi,
        "credit_score": score_val,
        "expense_chart_data": expense_chart_data,
        "investment_chart_data": investment_chart_data,
        "goals_progress": [
            {
                "id": g.id,
                "title": g.title,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "progress_pct": min(100.0, round((g.current_amount / g.target_amount * 100), 1)) if g.target_amount > 0 else 100.0
            } for g in goals
        ],
        "insurance_renewals": [
            {
                "id": h.id,
                "policy_name": h.policy_name,
                "renewal_date": h.renewal_date,
                "premium_amount": h.premium_amount
            } for h in health_securities
        ],
        "ai_insights": ai_insights
    }

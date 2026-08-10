from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import (
    User, Income, Expense, Budget, Goal, Investment,
    HealthSecurity, Loan, CreditCard, CreditScore, Notification
)

router = APIRouter(prefix="/demo", tags=["Demo Data Seeder"])

@router.post("/seed")
def seed_demo_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Clear existing demo records for clean reset
    db.query(Income).filter(Income.user_id == current_user.id).delete()
    db.query(Expense).filter(Expense.user_id == current_user.id).delete()
    db.query(Budget).filter(Budget.user_id == current_user.id).delete()
    db.query(Goal).filter(Goal.user_id == current_user.id).delete()
    db.query(Investment).filter(Investment.user_id == current_user.id).delete()
    db.query(HealthSecurity).filter(HealthSecurity.user_id == current_user.id).delete()
    db.query(Loan).filter(Loan.user_id == current_user.id).delete()
    db.query(CreditCard).filter(CreditCard.user_id == current_user.id).delete()
    db.query(CreditScore).filter(CreditScore.user_id == current_user.id).delete()
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()

    # 1. Income
    incomes = [
        Income(user_id=current_user.id, title="Primary Salary", source="Salary", amount=7500.0, frequency="Monthly"),
        Income(user_id=current_user.id, title="Freelance Consulting", source="Freelancing", amount=1200.0, frequency="Monthly"),
        Income(user_id=current_user.id, title="Rental Apartment", source="Rental Income", amount=850.0, frequency="Monthly")
    ]
    db.add_all(incomes)

    # 2. Expenses (A-Z categories)
    expenses = [
        Expense(user_id=current_user.id, title="Whole Foods Groceries", category="Groceries", amount=450.0),
        Expense(user_id=current_user.id, title="Gourmet Dining Out", category="Restaurants", amount=320.0),
        Expense(user_id=current_user.id, title="Luxury Apartment Rent", category="Rent", amount=1800.0),
        Expense(user_id=current_user.id, title="Electricity & Utilities", category="Electricity", amount=140.0),
        Expense(user_id=current_user.id, title="High-Speed Fiber Internet", category="Internet", amount=80.0),
        Expense(user_id=current_user.id, title="Fuel & Commute", category="Fuel", amount=160.0),
        Expense(user_id=current_user.id, title="Health & Dental Insurance", category="Insurance", amount=250.0),
        Expense(user_id=current_user.id, title="Weekend Travel & Trip", category="Travel", amount=550.0),
        Expense(user_id=current_user.id, title="Streaming Subscriptions", category="Subscriptions", amount=45.0)
    ]
    db.add_all(expenses)

    # 3. Budgets
    budgets = [
        Budget(user_id=current_user.id, category="Groceries", limit_amount=500.0, period="Monthly"),
        Budget(user_id=current_user.id, category="Restaurants", limit_amount=250.0, period="Monthly"),
        Budget(user_id=current_user.id, category="Rent", limit_amount=1800.0, period="Monthly"),
        Budget(user_id=current_user.id, category="Travel", limit_amount=600.0, period="Monthly"),
        Budget(user_id=current_user.id, category="Subscriptions", limit_amount=60.0, period="Monthly")
    ]
    db.add_all(budgets)

    # 4. Savings Goals
    goals = [
        Goal(user_id=current_user.id, title="Buy Dream House", target_amount=100000.0, current_amount=32000.0, priority="High"),
        Goal(user_id=current_user.id, title="Emergency Reserve Fund", target_amount=20000.0, current_amount=15000.0, priority="High"),
        Goal(user_id=current_user.id, title="European Vacation", target_amount=6000.0, current_amount=4200.0, priority="Medium"),
        Goal(user_id=current_user.id, title="Retirement Corpus", target_amount=500000.0, current_amount=65000.0, priority="High")
    ]
    db.add_all(goals)

    # 5. Investments
    investments = [
        Investment(user_id=current_user.id, asset_name="S&P 500 Index Fund (VOO)", asset_type="ETFs", amount_invested=20000.0, current_value=24500.0, risk_level="Moderate"),
        Investment(user_id=current_user.id, asset_name="Tech Growth Stock Portfolio", asset_type="Stocks", amount_invested=12000.0, current_value=15800.0, risk_level="High"),
        Investment(user_id=current_user.id, asset_name="Global Bond Balanced Portfolio", asset_type="Bonds", amount_invested=8000.0, current_value=8400.0, risk_level="Low")
    ]
    db.add_all(investments)

    # 6. Health Security (Insurance)
    health_policies = [
        HealthSecurity(user_id=current_user.id, policy_name="Comprehensive Health Guard", policy_type="Health Insurance", coverage_amount=500000.0, premium_amount=1200.0, renewal_date=datetime.now() + timedelta(days=90), nominee="Jane Doe", policy_number="POL-883921"),
        HealthSecurity(user_id=current_user.id, policy_name="Term Life Shield 1M", policy_type="Term Insurance", coverage_amount=1000000.0, premium_amount=850.0, renewal_date=datetime.now() + timedelta(days=180), nominee="Jane Doe", policy_number="POL-119203")
    ]
    db.add_all(health_policies)

    # 7. Loans & Credit Cards
    loans = [
        Loan(user_id=current_user.id, loan_name="Home Mortgage", loan_type="Home Loan", total_amount=250000.0, remaining_balance=185000.0, interest_rate=6.5, emi_amount=1450.0, due_date=datetime.now() + timedelta(days=12)),
        Loan(user_id=current_user.id, loan_name="Tesla Car Loan", loan_type="Car Loan", total_amount=35000.0, remaining_balance=14000.0, interest_rate=5.2, emi_amount=420.0, due_date=datetime.now() + timedelta(days=18))
    ]
    cards = [
        CreditCard(user_id=current_user.id, card_name="Sapphire Reserve Card", credit_limit=25000.0, current_balance=2450.0, statement_balance=2450.0, due_date=datetime.now() + timedelta(days=8))
    ]
    score = CreditScore(user_id=current_user.id, score=785, provider="CIBIL / Experian")
    db.add_all(loans + cards + [score])

    # 8. Notifications
    notifs = [
        Notification(user_id=current_user.id, type="EMI Reminder", title="Upcoming Home Mortgage EMI", message="Your monthly Home Mortgage EMI of $1,450.00 is due in 12 days."),
        Notification(user_id=current_user.id, type="Budget Limit Warning", title="Restaurants Category Warning", message="You have spent $320.00 against your $250.00 monthly budget limit!"),
        Notification(user_id=current_user.id, type="Insurance Renewal", title="Health Insurance Renewal", message="Comprehensive Health Guard renewal is scheduled in 90 days."),
        Notification(user_id=current_user.id, type="Goal Milestone", title="European Vacation Milestone", message="Congratulations! You have reached 70% of your European Vacation savings goal.")
    ]
    db.add_all(notifs)

    db.commit()

    return {"message": "Realistic demo data seeded successfully in 1 click!"}

import pytest
from backend.business_logic.calculator import FinancialCalculator

def test_calculate_health_score():
    result = FinancialCalculator.calculate_health_score(
        monthly_income=10000,
        monthly_expenses=4000,
        total_debt_payments=1000,
        total_credit_limit=20000,
        current_credit_balance=2000,
        emergency_fund_balance=15000,
        monthly_investment=1500,
        budget_limit=5000,
        health_security_policies_count=1,
        total_health_coverage=500000
    )
    assert "score" in result
    assert result["score"] >= 70
    assert result["rating"] in ["Excellent", "Good", "Fair", "Needs Attention"]
    assert "breakdown" in result

def test_calculate_emi():
    emi_res = FinancialCalculator.calculate_emi(
        principal=100000,
        annual_interest_rate=8.5,
        tenure_months=120
    )
    assert emi_res["emi"] > 0
    assert emi_res["total_payment"] > 100000
    assert emi_res["total_interest"] > 0

def test_calculate_net_worth():
    nw = FinancialCalculator.calculate_net_worth(
        investments_value=50000,
        cash_savings=20000,
        total_loan_balances=15000,
        credit_card_balances=2000
    )
    assert nw["total_assets"] == 70000
    assert nw["total_liabilities"] == 17000
    assert nw["net_worth"] == 53000

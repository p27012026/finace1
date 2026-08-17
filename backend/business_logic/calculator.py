import math
from typing import List, Dict, Any

class FinancialCalculator:
    """
    Pure Python Business Logic Layer.
    All calculations in this module are 100% deterministic mathematical algorithms.
    Gemini AI is NEVER used for numeric calculations in this layer.
    """

    @staticmethod
    def calculate_health_score(
        monthly_income: float,
        monthly_expenses: float,
        total_debt_payments: float,
        total_credit_limit: float,
        current_credit_balance: float,
        emergency_fund_balance: float,
        monthly_investment: float,
        budget_limit: float,
        health_security_policies_count: int = 0,
        total_health_coverage: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates a deterministic Financial Health Score (0 to 100) using 6 weighted components:
        1. Savings Ratio (20%)
        2. Debt-to-Income Ratio (20%)
        3. Credit Utilization (15%)
        4. Emergency Fund Coverage (15%)
        5. Investment & Wealth Growth (15%)
        6. Health Security & Medical Protection (15%)
        """
        if monthly_income <= 0 and monthly_expenses <= 0 and total_debt_payments <= 0 and total_credit_limit <= 0 and emergency_fund_balance <= 0 and monthly_investment <= 0 and health_security_policies_count <= 0:
            return {
                "score": 0.0,
                "rating": "No Data Recorded",
                "breakdown": {
                    "savings_score": 0.0,
                    "debt_score": 0.0,
                    "credit_score": 0.0,
                    "emergency_score": 0.0,
                    "investment_score": 0.0,
                    "health_security_score": 0.0,
                    "budget_score": 0.0
                },
                "ratios": {
                    "savings_ratio_pct": 0.0,
                    "dti_ratio_pct": 0.0,
                    "credit_utilization_pct": 0.0,
                    "health_security_policies": 0,
                    "total_health_coverage": 0.0
                }
            }

        if monthly_income <= 0:
            health_sec_score = 100.0 if (health_security_policies_count > 0 and total_health_coverage >= 300000) else 0.0
            return {
                "score": round((health_sec_score * 0.15), 1),
                "rating": "Needs Attention",
                "breakdown": {
                    "savings_score": 0.0,
                    "debt_score": 50.0,
                    "credit_score": 50.0,
                    "emergency_score": 0.0,
                    "investment_score": 0.0,
                    "health_security_score": health_sec_score,
                    "budget_score": 40.0
                }
            }

        # 1. Savings Ratio = (Income - Expenses) / Income
        savings_ratio = max(0.0, (monthly_income - monthly_expenses) / monthly_income)
        # Target 20% or higher savings ratio
        savings_score = min(100.0, (savings_ratio / 0.20) * 100.0)

        # 2. Debt-to-Income Ratio = Total Debt Payments / Income
        dti_ratio = total_debt_payments / monthly_income
        # Target DTI under 30% gets 100, over 50% drops score
        if dti_ratio <= 0.30:
            debt_score = 100.0
        elif dti_ratio >= 0.60:
            debt_score = 20.0
        else:
            debt_score = max(0.0, 100.0 - ((dti_ratio - 0.30) / 0.30) * 80.0)

        # 3. Credit Utilization = Current Balance / Credit Limit
        if total_credit_limit > 0:
            util_ratio = current_credit_balance / total_credit_limit
            if util_ratio <= 0.30:
                credit_score = 100.0
            elif util_ratio >= 0.80:
                credit_score = 20.0
            else:
                credit_score = max(0.0, 100.0 - ((util_ratio - 0.30) / 0.50) * 80.0)
        else:
            credit_score = 50.0

        # 4. Emergency Fund Coverage = Balance / (3 * Monthly Expenses)
        target_emergency = 3.0 * (monthly_expenses if monthly_expenses > 0 else 1000.0)
        emergency_score = min(100.0, (emergency_fund_balance / target_emergency) * 100.0)

        # 5. Investment Ratio = Monthly Investment / Income
        inv_ratio = monthly_investment / monthly_income
        investment_score = min(100.0, (inv_ratio / 0.15) * 100.0)

        # 6. Health Security & Medical Coverage Ratio
        # If user has 0 health insurance policies or 0 coverage, score is 0.0!
        if health_security_policies_count > 0 and total_health_coverage > 0:
            health_security_score = min(100.0, (total_health_coverage / 300000.0) * 100.0)
        else:
            health_security_score = 0.0

        # 7. Budget Discipline = (Budget Limit - Actual Expenses) / Budget Limit
        if budget_limit > 0:
            if monthly_expenses <= budget_limit:
                budget_score = 100.0
            else:
                overspend_pct = (monthly_expenses - budget_limit) / budget_limit
                budget_score = max(0.0, 100.0 - (overspend_pct * 100.0))
        else:
            budget_score = 40.0

        # Overall Weighted Score (20% Savings + 20% Debt + 15% Credit + 15% Emergency + 15% Investment + 15% Health Security)
        total_score = round(
            (savings_score * 0.20) +
            (debt_score * 0.20) +
            (credit_score * 0.15) +
            (emergency_score * 0.15) +
            (investment_score * 0.15) +
            (health_security_score * 0.15),
            1
        )

        rating = "Excellent" if total_score >= 80 else "Good" if total_score >= 65 else "Fair" if total_score >= 50 else "Needs Attention"

        return {
            "score": total_score,
            "rating": rating,
            "breakdown": {
                "savings_score": round(savings_score, 1),
                "debt_score": round(debt_score, 1),
                "credit_score": round(credit_score, 1),
                "emergency_score": round(emergency_score, 1),
                "investment_score": round(investment_score, 1),
                "health_security_score": round(health_security_score, 1),
                "budget_score": round(budget_score, 1)
            },
            "ratios": {
                "savings_ratio_pct": round(savings_ratio * 100, 1),
                "dti_ratio_pct": round(dti_ratio * 100, 1),
                "credit_utilization_pct": round((current_credit_balance / total_credit_limit * 100) if total_credit_limit > 0 else 0, 1),
                "health_security_policies": health_security_policies_count,
                "total_health_coverage": total_health_coverage
            }
        }

    @staticmethod
    def calculate_emi(principal: float, annual_interest_rate: float, tenure_months: int) -> Dict[str, float]:
        """
        Calculates monthly EMI using standard formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
        """
        if principal <= 0 or tenure_months <= 0:
            return {"emi": 0.0, "total_payment": 0.0, "total_interest": 0.0}

        if annual_interest_rate <= 0:
            emi = principal / tenure_months
            return {
                "emi": round(emi, 2),
                "total_payment": round(principal, 2),
                "total_interest": 0.0
            }

        r = (annual_interest_rate / 100) / 12
        n = tenure_months

        emi = principal * r * (math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
        total_payment = emi * n
        total_interest = total_payment - principal

        return {
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2)
        }

    @staticmethod
    def calculate_net_worth(
        investments_value: float,
        cash_savings: float,
        total_loan_balances: float,
        credit_card_balances: float
    ) -> Dict[str, float]:
        total_assets = investments_value + cash_savings
        total_liabilities = total_loan_balances + credit_card_balances
        net_worth = total_assets - total_liabilities

        return {
            "total_assets": round(total_assets, 2),
            "total_liabilities": round(total_liabilities, 2),
            "net_worth": round(net_worth, 2)
        }

    @staticmethod
    def calculate_cash_flow(monthly_income: float, monthly_expenses: float) -> Dict[str, float]:
        net_cash_flow = monthly_income - monthly_expenses
        savings_rate = (net_cash_flow / monthly_income * 100) if monthly_income > 0 else 0.0
        
        return {
            "monthly_income": round(monthly_income, 2),
            "monthly_expenses": round(monthly_expenses, 2),
            "net_cash_flow": round(net_cash_flow, 2),
            "savings_rate_pct": round(savings_rate, 1)
        }

    @staticmethod
    def calculate_goal_progress(
        target_amount: float,
        current_amount: float,
        target_date_months_remaining: int
    ) -> Dict[str, Any]:
        if target_amount <= 0:
            return {"progress_pct": 100.0, "remaining_amount": 0.0, "required_monthly_savings": 0.0}

        progress_pct = min(100.0, (current_amount / target_amount) * 100.0)
        remaining = max(0.0, target_amount - current_amount)

        months = max(1, target_date_months_remaining)
        req_monthly = remaining / months

        return {
            "progress_pct": round(progress_pct, 1),
            "remaining_amount": round(remaining, 2),
            "required_monthly_savings": round(req_monthly, 2)
        }

    @staticmethod
    def calculate_investment_pnl(amount_invested: float, current_value: float) -> Dict[str, float]:
        pnl = current_value - amount_invested
        pnl_pct = (pnl / amount_invested * 100) if amount_invested > 0 else 0.0
        
        return {
            "amount_invested": round(amount_invested, 2),
            "current_value": round(current_value, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2)
        }

    @staticmethod
    def calculate_dynamic_credit_score(
        loans: List[Any],
        credit_cards: List[Any],
        monthly_income: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates a real-world dynamic CIBIL/FICO Credit Score (300 to 900 scale)
        based on active loans, credit cards, payment history, utilization, and credit mix.
        
        If 0 loans and 0 credit cards exist:
        returns Score = 300 (No Credit History / New Profile).
        """
        total_loans = len(loans or [])
        total_cards = len(credit_cards or [])
        
        # If user has NO loans and NO credit cards, credit score is baseline 300 (No History)
        if total_loans == 0 and total_cards == 0:
            return {
                "score": 300,
                "rating": "No Credit History",
                "status": "NH (No History)",
                "credit_utilization_pct": 0.0,
                "total_debt": 0.0,
                "active_loans_count": 0,
                "credit_cards_count": 0,
                "on_time_payment_pct": 0.0,
                "summary": "No active loans or credit cards found. Add a loan or credit card to build your credit score."
            }
        
        # Base credit score starts from 550 for active credit profiles
        score = 550.0
        
        # 1. Payment History Factor (Max +150 points)
        default_count = 0
        total_accounts = total_loans + total_cards
        
        for l in (loans or []):
            status = getattr(l, 'status', 'Active') if hasattr(l, 'status') else (l.get('status') if isinstance(l, dict) else 'Active')
            if status and 'default' in str(status).lower():
                default_count += 1
                
        for c in (credit_cards or []):
            c_status = getattr(c, 'status', 'Active') if hasattr(c, 'status') else (c.get('status') if isinstance(c, dict) else 'Active')
            if c_status and 'overdue' in str(c_status).lower():
                default_count += 1

        on_time_pct = max(0.0, 100.0 - (default_count / max(1, total_accounts) * 100.0))
        payment_points = (on_time_pct / 100.0) * 150.0
        score += payment_points

        # 2. Credit Utilization Ratio (Max +120 points)
        total_limit = 0.0
        total_balance = 0.0
        for c in (credit_cards or []):
            limit = getattr(c, 'credit_limit', 0.0) if hasattr(c, 'credit_limit') else (c.get('credit_limit', 0.0) if isinstance(c, dict) else 0.0)
            balance = getattr(c, 'current_balance', 0.0) if hasattr(c, 'current_balance') else (c.get('current_balance', 0.0) if isinstance(c, dict) else 0.0)
            total_limit += float(limit or 0.0)
            total_balance += float(balance or 0.0)

        util_pct = (total_balance / total_limit * 100.0) if total_limit > 0 else 0.0
        
        if total_cards > 0 and total_limit > 0:
            if util_pct <= 30.0:
                util_points = 120.0
            elif util_pct <= 50.0:
                util_points = 70.0
            elif util_pct <= 80.0:
                util_points = 30.0
            else:
                util_points = 0.0
        else:
            util_points = 60.0
        
        score += util_points

        # 3. Credit Mix & Diversity (Max +50 points)
        if total_loans > 0 and total_cards > 0:
            mix_points = 50.0
        elif total_loans > 0:
            mix_points = 30.0
        else:
            mix_points = 20.0
            
        score += mix_points

        # 4. Debt Burden Control (Max +30 points)
        total_loan_balance = sum(float(getattr(l, 'remaining_balance', 0.0) if hasattr(l, 'remaining_balance') else (l.get('balance', 0.0) if isinstance(l, dict) else 0.0)) for l in (loans or []))
        
        if total_loan_balance > 0 and total_loan_balance < 100000:
            score += 30.0
        elif total_loan_balance > 500000:
            score -= 30.0

        final_score = int(min(900, max(300, round(score))))
        rating = "Excellent" if final_score >= 780 else "Good" if final_score >= 700 else "Fair" if final_score >= 600 else "Needs Attention"

        return {
            "score": final_score,
            "rating": rating,
            "status": "Active Credit Profile",
            "credit_utilization_pct": round(util_pct, 1),
            "total_debt": round(total_loan_balance + total_balance, 2),
            "active_loans_count": total_loans,
            "credit_cards_count": total_cards,
            "on_time_payment_pct": round(on_time_pct, 1),
            "summary": f"Your calculated CIBIL score is {final_score} based on {total_loans} loan(s) and {total_cards} card(s)."
        }

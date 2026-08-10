from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: Optional[str] = None

# Finance Schemas
class IncomeCreate(BaseModel):
    title: str
    source: str # Salary, Business Income, Freelancing, Rental Income, Interest Income, Other Income
    amount: float = Field(gt=0)
    frequency: str = "Monthly"
    notes: Optional[str] = None

class IncomeResponse(IncomeCreate):
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    title: str
    category: str # A-Z categories or Custom
    amount: float = Field(gt=0)
    is_recurring: bool = False
    notes: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    category: str
    period: str = "Monthly" # Weekly, Monthly, Yearly
    limit_amount: float = Field(gt=0)

class BudgetResponse(BudgetCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    title: str # Buy House, Buy Car, Vacation, Emergency Fund, Retirement, Education, Business Startup
    target_amount: float = Field(gt=0)
    current_amount: float = 0.0
    target_date: Optional[datetime] = None
    priority: str = "Medium"
    notes: Optional[str] = None

class GoalResponse(GoalCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Investment Schemas
class InvestmentCreate(BaseModel):
    asset_name: str
    asset_type: str # Stocks, Mutual Funds, ETFs, Bonds
    amount_invested: float = Field(gt=0)
    current_value: float = Field(gt=0)
    risk_level: str = "Moderate"
    notes: Optional[str] = None

class InvestmentResponse(InvestmentCreate):
    id: int
    user_id: int
    purchase_date: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# Health Security (Insurance) Schemas
class HealthSecurityCreate(BaseModel):
    policy_name: str
    policy_type: str # Health Insurance, Term Insurance, Life Insurance
    coverage_amount: float = Field(gt=0)
    premium_amount: float = Field(gt=0)
    renewal_date: datetime
    nominee: Optional[str] = None
    policy_number: Optional[str] = None

class HealthSecurityResponse(HealthSecurityCreate):
    id: int
    user_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Loan & Credit Schemas
class LoanCreate(BaseModel):
    loan_name: str
    loan_type: str # Home Loan, Car Loan, Personal Loan, Education Loan, Business Loan, Society Loan
    total_amount: float = Field(gt=0)
    initial_payment: Optional[float] = 0.0
    remaining_balance: float = Field(ge=0)
    interest_rate: float = Field(ge=0)
    emi_amount: float = Field(ge=0)
    payment_frequency: Optional[str] = "Monthly" # Daily, Weekly, Monthly, Quarterly, Yearly
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    tenure_months: Optional[int] = 36
    remaining_payments: Optional[int] = None

class LoanResponse(LoanCreate):
    id: int
    user_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class CreditCardCreate(BaseModel):
    card_name: str
    credit_limit: float = Field(gt=0)
    current_balance: float = Field(ge=0)
    due_date: Optional[datetime] = None
    statement_balance: float = 0.0

class CreditCardResponse(CreditCardCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Chat Schemas
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    sender: str = "ai"
    message: str
    action_executed: bool = False
    timestamp: datetime

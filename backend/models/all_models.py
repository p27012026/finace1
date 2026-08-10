from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # user, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    health_securities = relationship("HealthSecurity", back_populates="user", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    credit_cards = relationship("CreditCard", back_populates="user", cascade="all, delete-orphan")
    credit_scores = relationship("CreditScore", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False) # Salary, Business Income, Freelancing, Rental Income, Interest Income, Other Income
    amount = Column(Float, nullable=False)
    frequency = Column(String, default="Monthly") # Monthly, One-Time, Yearly
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="incomes")


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # Food, Groceries, Restaurants, Shopping, Rent, Electricity, Water, Internet, Mobile Recharge, Fuel, Public Transport, Vehicle Maintenance, Medical, Insurance, Education, Entertainment, Travel, Taxes, Charity, Pets, Children, Business Expenses, Subscriptions, Investments, Miscellaneous, Custom
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    is_recurring = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    period = Column(String, default="Monthly") # Weekly, Monthly, Yearly
    limit_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="budgets")


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False) # Buy House, Buy Car, Vacation, Emergency Fund, Retirement, Education, Business Startup
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=True)
    priority = Column(String, default="Medium") # High, Medium, Low
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="goals")


class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False) # Stocks, Mutual Funds, ETFs, Bonds
    amount_invested = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    risk_level = Column(String, default="Moderate") # Low, Moderate, High
    purchase_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="investments")


class HealthSecurity(Base):
    __tablename__ = "health_securities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_name = Column(String, nullable=False)
    policy_type = Column(String, nullable=False) # Health Insurance, Term Insurance, Life Insurance
    coverage_amount = Column(Float, nullable=False)
    premium_amount = Column(Float, nullable=False)
    renewal_date = Column(DateTime, nullable=False)
    nominee = Column(String, nullable=True)
    policy_number = Column(String, nullable=True)
    status = Column(String, default="Active") # Active, Expired, Pending
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="health_securities")


class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_name = Column(String, nullable=False)
    loan_type = Column(String, nullable=False) # Home Loan, Car Loan, Personal Loan, Education Loan, Business Loan
    total_amount = Column(Float, nullable=False)
    initial_payment = Column(Float, default=0.0)
    remaining_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False) # Percentage e.g. 8.5
    emi_amount = Column(Float, nullable=False)
    payment_frequency = Column(String, default="Monthly") # Daily, Weekly, Monthly, Quarterly, Yearly
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    tenure_months = Column(Integer, default=36)
    remaining_payments = Column(Integer, nullable=True)
    status = Column(String, default="Active") # Active, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="loans")


class CreditCard(Base):
    __tablename__ = "credit_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_name = Column(String, nullable=False)
    credit_limit = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=True)
    statement_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="credit_cards")


class CreditScore(Base):
    __tablename__ = "credit_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False) # e.g. 750
    provider = Column(String, default="CIBIL / Experian")
    record_date = Column(DateTime, default=datetime.utcnow)
    factors_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="credit_scores")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # PDF, CSV, Excel, Image
    file_path = Column(String, nullable=False)
    doc_category = Column(String, default="General") # Bank Statement, Salary Slip, Credit Card Statement, Loan Document, Insurance Policy, Tax Document, Investment Statement
    ocr_text = Column(Text, nullable=True)
    extracted_data_json = Column(JSON, nullable=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="documents")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    period = Column(String, nullable=False) # e.g. "August 2026"
    health_score = Column(Float, nullable=False)
    report_data_json = Column(JSON, nullable=False)
    pdf_path = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False) # Budget Limit Warning, EMI Reminder, Insurance Renewal, Goal Milestone, Investment Alert, Monthly Report Ready, AI Recommendation, System Notification
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")


class ChatHistory(Base):
    __tablename__ = "chat_histories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, default="default")
    sender = Column(String, nullable=False) # "user" or "ai"
    message = Column(Text, nullable=False)
    context_used_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chats")


class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    currency = Column(String, default="USD ($)")
    theme = Column(String, default="dark") # dark, light
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="settings")

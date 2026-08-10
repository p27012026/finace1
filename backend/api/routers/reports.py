from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Report, Income, Expense, Investment, Loan, HealthSecurity, Budget
from backend.business_logic.calculator import FinancialCalculator
from backend.ai.gemini_service import gemini_service
from backend.services.external.pdf_service import pdf_report_generator
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["AI Monthly Financial Reports"])

@router.post("/generate")
def generate_monthly_report(
    period: str = "August 2026",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user data
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id, Loan.status == "Active").all()
    health_policies = db.query(HealthSecurity).filter(HealthSecurity.user_id == current_user.id).all()
    health_policies_count = len(health_policies)
    total_health_coverage = sum(h.coverage_amount for h in health_policies) or 0.0

    total_income = sum(i.amount for i in incomes) or 0.0
    total_expenses = sum(e.amount for e in expenses) or 0.0
    total_investments = sum(inv.current_value for inv in investments) or 0.0
    total_loans = sum(l.remaining_balance for l in loans) or 0.0

    # Calculate Health Score
    health_eval = FinancialCalculator.calculate_health_score(
        monthly_income=total_income,
        monthly_expenses=total_expenses,
        total_debt_payments=sum(l.emi_amount for l in loans),
        total_credit_limit=10000.0,
        current_credit_balance=1000.0,
        emergency_fund_balance=max(0.0, total_income - total_expenses),
        monthly_investment=total_investments * 0.05,
        budget_limit=total_expenses,
        health_security_policies_count=health_policies_count,
        total_health_coverage=total_health_coverage
    )

    # Gemini Narrative Generation
    ai_narrative = gemini_service.generate_monthly_report_narrative({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "health_score": health_eval["score"],
        "investments": total_investments
    })

    report_payload = {
        "period": period,
        "health_score": health_eval["score"],
        "health_rating": health_eval["rating"],
        "health_breakdown": health_eval["breakdown"],
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_savings": total_income - total_expenses,
        "total_investments": total_investments,
        "total_loans": total_loans,
        "executive_summary": ai_narrative.get("executive_summary"),
        "financial_predictions": ai_narrative.get("financial_predictions", []),
        "ai_recommendations": ai_narrative.get("next_month_recommendations", [])
    }

    # Generate PDF
    pdf_path = pdf_report_generator.generate_report_pdf(
        user_name=current_user.full_name or current_user.email,
        report_period=period,
        report_data=report_payload
    )

    # Store Report in DB
    report_record = Report(
        user_id=current_user.id,
        title=f"AI Monthly Financial Report - {period}",
        period=period,
        health_score=health_eval["score"],
        report_data_json=report_payload,
        pdf_path=pdf_path
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return {
        "message": "Monthly Report generated successfully",
        "report_id": report_record.id,
        "period": period,
        "health_score": health_eval["score"],
        "pdf_download_url": f"/api/reports/download/{report_record.id}"
    }

@router.get("/")
def list_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.generated_at.desc()).all()

@router.get("/download/{report_id}")
def download_report_pdf(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report or not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF Report file not found")
    return FileResponse(report.pdf_path, media_type="application/pdf", filename=os.path.basename(report.pdf_path))

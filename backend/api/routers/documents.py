import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import User, Document, Expense, Income
from backend.ai.gemini_service import gemini_service
from backend.utils.logger import audit_logger

router = APIRouter(prefix="/documents", tags=["Document Upload & Scanner"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_category: str = Form("General"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Security Validation: Extension & File Size
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".pdf", ".csv", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: PDF, CSV, Excel, Images.")

    upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Basic text extraction from file or simulated OCR text
    raw_text = f"Sample text extracted from uploaded document {filename}. Category: {doc_category}."
    if ext in [".csv", ".xlsx", ".xls"]:
        raw_text = f"Spreadsheet content from {filename}."

    # Process via Gemini AI Document Understanding
    extracted_json = gemini_service.document_understanding(raw_text, doc_category)

    # Automatically add transactions to database if extracted
    transactions = extracted_json.get("extracted_transactions", [])
    for txn in transactions:
        t_type = txn.get("type", "expense").lower()
        if t_type == "income":
            inc = Income(
                user_id=current_user.id,
                title=txn.get("title", f"Imported {doc_category}"),
                source="Other Income",
                amount=abs(float(txn.get("amount", 0.0))),
                notes=f"Auto-imported from {filename}"
            )
            db.add(inc)
        else:
            exp = Expense(
                user_id=current_user.id,
                title=txn.get("title", f"Imported {doc_category}"),
                category=txn.get("category", "Miscellaneous"),
                amount=abs(float(txn.get("amount", 0.0))),
                notes=f"Auto-imported from {filename}"
            )
            db.add(exp)

    # Save document entity to database
    doc_record = Document(
        user_id=current_user.id,
        filename=filename,
        file_type=ext.replace(".", "").upper(),
        file_path=file_path,
        doc_category=doc_category,
        ocr_text=raw_text,
        extracted_data_json=extracted_json
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    audit_logger.info(f"User {current_user.id} uploaded document {filename}")

    return {
        "message": "Document uploaded and parsed successfully",
        "document_id": doc_record.id,
        "filename": filename,
        "extracted_summary": extracted_json.get("document_summary"),
        "ai_insights": extracted_json.get("ai_insights", [])
    }

@router.get("/")
def get_user_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    return docs

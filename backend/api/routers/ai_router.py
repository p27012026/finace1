from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.middleware.auth import get_current_user
from backend.models import (
    User, Income, Expense, Investment, Loan, HealthSecurity,
    Goal, Budget, CreditScore, ChatHistory, Document
)
from backend.schemas.all_schemas import ChatRequest, ChatResponse
from backend.ai.gemini_service import gemini_service
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI Advisor Chatbot"])

import re
from backend.business_logic.calculator import FinancialCalculator

def process_ai_agent_command(user_message: str, current_user: User, db: Session, user_context: dict) -> tuple[str, bool]:
    msg = (user_message or "").strip().lower()
    
    # Extract Amount (e.g. ₹10000, 10000 rs, inr 10000, 10000)
    amt_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)', msg)
    amount = float(amt_match.group(1)) if amt_match else None

    # 1. ADD INCOME TOOL
    is_income_intent = (amount and amount > 0) and (
        ("income" in msg) or 
        ("salary" in msg) or 
        any(kw in msg for kw in ['add income', 'add salary', 'salary credit', 'received salary', 'got salary', 'earned', 'rental income'])
    ) and not any(kw in msg for kw in ['spent', 'bought', 'paid for', 'delete', 'remove'])

    if is_income_intent:
        category = "Rental Income" if any(w in msg for w in ['rent', 'rental', 'property', 'house']) else \
                   "Salary" if "salary" in msg else \
                   "Freelancing" if "freelance" in msg else \
                   "Business Income" if "business" in msg else \
                   "Interest Income" if any(w in msg for w in ['fd', 'interest', 'dividend']) else \
                   "Other Income"
        
        words = [w for w in msg.split() if w not in ['add', 'income', 'as', 'a', 'with', 'for', 'rs', 'inr', 'rupees', 'salary'] and not w.isdigit() and not w.startswith('₹')]
        title = " ".join(words).title() if words else f"{category}"

        new_inc = Income(
            user_id=current_user.id,
            title=title,
            source=category,
            amount=amount,
            frequency="Monthly",
            date=datetime.utcnow()
        )
        db.add(new_inc)
        db.commit()

        incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        tot_inc = sum(i.amount for i in incomes)
        tot_exp = sum(e.amount for e in expenses)

        reply = (
            f"**Intent Detected:** Add Income\n"
            f"**Action Executed:** `add_income()`\n"
            f"**Status:** Success ✅\n\n"
            f"**Details:**\n"
            f"• Amount Added: **₹{amount:,.2f}**\n"
            f"• Source / Category: **{category}**\n"
            f"• Title: **{title}**\n\n"
            f"**Updated Summary:**\n"
            f"• Total Monthly Income: **₹{tot_inc:,.2f}**\n"
            f"• Net Cash Flow: **₹{(tot_inc - tot_exp):,.2f}**\n\n"
            f"**Dashboard Synchronized ✅**\n\n"
            f"💡 **AI Financial Tip:** Your monthly income has increased! Consider allocating 20% (₹{amount * 0.20:,.2f}) into low-cost Mutual Fund SIPs or Emergency Reserve."
        )
        return reply, True

    # 2. ADD EXPENSE TOOL
    is_expense_intent = (amount and amount > 0) and (
        ("expense" in msg) or 
        any(kw in msg for kw in ['spent', 'paid', 'bought', 'cost', 'charge']) or
        any(w in msg for w in ['pizza', 'burger', 'petrol', 'fuel', 'groceries', 'recharge', 'wifi', 'food'])
    ) and not any(kw in msg for kw in ['income', 'salary', 'earned', 'delete', 'remove'])

    if is_expense_intent:
        cat = "Food" if any(w in msg for w in ['pizza', 'food', 'restaurant', 'dinner', 'lunch', 'burger']) else \
              "Transportation" if any(w in msg for w in ['cab', 'uber', 'ola', 'petrol', 'fuel', 'bus', 'train', 'flight']) else \
              "Shopping" if any(w in msg for w in ['cloth', 'shoes', 'amazon', 'flipkart', 'mall', 'bought']) else \
              "Bills" if any(w in msg for w in ['rent', 'electricity', 'wifi', 'recharge', 'water']) else \
              "Healthcare" if any(w in msg for w in ['hospital', 'medicine', 'doctor', 'pharma']) else \
              "Miscellaneous"
        
        words = [w for w in msg.split() if w not in ['add', 'expense', 'spent', 'paid', 'bought', 'for', 'on', 'rs', 'inr', 'rupees', 'as', 'a'] and not w.isdigit() and not w.startswith('₹')]
        title = " ".join(words[:3]).title() if words else f"{cat} Expense"

        new_exp = Expense(
            user_id=current_user.id,
            title=title,
            category=cat,
            amount=amount,
            date=datetime.utcnow()
        )
        db.add(new_exp)
        db.commit()

        incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        tot_inc = sum(i.amount for i in incomes)
        tot_exp = sum(e.amount for e in expenses)

        reply = (
            f"**Intent Detected:** Add Expense\n"
            f"**Action Executed:** `add_expense()`\n"
            f"**Status:** Success ✅\n\n"
            f"**Details:**\n"
            f"• Amount Recorded: **₹{amount:,.2f}**\n"
            f"• Category: **{cat}**\n"
            f"• Item / Description: **{title}**\n\n"
            f"**Updated Summary:**\n"
            f"• Total Monthly Expenses: **₹{tot_exp:,.2f}**\n"
            f"• Remaining Net Cash Flow: **₹{(tot_inc - tot_exp):,.2f}**\n\n"
            f"**Dashboard Synchronized ✅**\n\n"
            f"💡 **AI Financial Tip:** Expense logged! Staying disciplined with your daily spending helps preserve long-term savings."
        )
        return reply, True

    # 3. DELETE LAST EXPENSE / TRANSACTION TOOL
    elif any(kw in msg for kw in ['delete last expense', 'remove last expense', 'delete expense', 'undo last expense', 'delete last transaction']):
        latest_exp = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.id.desc()).first()
        if latest_exp:
            amt = latest_exp.amount
            title = latest_exp.title
            db.delete(latest_exp)
            db.commit()

            reply = (
                f"**Intent Detected:** Delete Last Expense\n"
                f"**Action Executed:** `delete_expense()`\n"
                f"**Status:** Success ✅\n\n"
                f"**Details:**\n"
                f"• Removed Expense: **₹{amt:,.2f}** ({title})\n\n"
                f"**Dashboard Synchronized ✅**\n\n"
                f"💡 **AI Notice:** Transaction removed from your database ledger."
            )
            return reply, True
        else:
            return "**No recent expense records found to delete.**", False

    # 3B. CLEAR ALL TRANSACTIONS / RESET ACCOUNT DATA TOOL
    elif any(kw in msg for kw in ['clear all data', 'reset all data', 'reset my data', 'delete all transactions', 'clear all expenses', 'reset account', 'clear data']):
        db.query(Expense).filter(Expense.user_id == current_user.id).delete()
        db.query(Income).filter(Income.user_id == current_user.id).delete()
        db.query(Budget).filter(Budget.user_id == current_user.id).delete()
        db.query(Goal).filter(Goal.user_id == current_user.id).delete()
        db.commit()

        reply = (
            f"**Intent Detected:** Reset Account Financial Data\n"
            f"**Action Executed:** `reset_account_data()`\n"
            f"**Status:** Success ✅\n\n"
            f"**Details:**\n"
            f"• All Income, Expense, Budget & Goal records cleared.\n"
            f"• Net Monthly Income: **₹0.00**\n"
            f"• Net Monthly Expenses: **₹0.00**\n"
            f"• Net Cash Flow: **₹0.00**\n\n"
            f"**Dashboard Synchronized ✅**\n\n"
            f"💡 **AI Financial Notice:** Your financial ledger has been reset to zero! You can now start fresh."
        )
        return reply, True

    # 4. CREATE BUDGET TOOL
    elif any(kw in msg for kw in ['create budget', 'set budget', 'budget for', 'budget of']):
        if amount and amount > 0:
            cat = "Food" if "food" in msg else "Shopping" if "shopping" in msg else "Transportation" if "travel" in msg else "Overall"
            existing = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.category == cat).first()
            if existing:
                existing.limit_amount = amount
            else:
                db.add(Budget(user_id=current_user.id, category=cat, period="Monthly", limit_amount=amount))
            db.commit()

            reply = (
                f"**Intent Detected:** Create / Update Budget\n"
                f"**Action Executed:** `create_budget()`\n"
                f"**Status:** Success ✅\n\n"
                f"**Details:**\n"
                f"• Category: **{cat}**\n"
                f"• Monthly Budget Limit: **₹{amount:,.2f}**\n\n"
                f"**Dashboard Synchronized ✅**\n\n"
                f"💡 **AI Financial Tip:** Setting strict category budgets prevents impulse overspending!"
            )
            return reply, True

    # 5. CREATE SAVINGS GOAL TOOL
    elif any(kw in msg for kw in ['create goal', 'create savings goal', 'new goal', 'savings target']):
        if amount and amount > 0:
            words = [w for w in msg.split() if w not in ['create', 'goal', 'savings', 'target', 'for', 'of', 'rs', 'inr'] and not w.isdigit()]
            goal_title = " ".join(words).capitalize() if words else "Emergency Reserve"
            db.add(Goal(user_id=current_user.id, title=goal_title, target_amount=amount, current_amount=0.0))
            db.commit()

            reply = (
                f"**Intent Detected:** Create Savings Goal\n"
                f"**Action Executed:** `create_goal()`\n"
                f"**Status:** Success ✅\n\n"
                f"**Details:**\n"
                f"• Goal Title: **{goal_title}**\n"
                f"• Target Amount: **₹{amount:,.2f}**\n\n"
                f"**Dashboard Synchronized ✅**\n\n"
                f"💡 **AI Financial Tip:** Automate monthly contributions towards this target to achieve your goal faster!"
            )
            return reply, True

    # 6. CALCULATE EMI TOOL
    elif any(kw in msg for kw in ['calculate emi', 'emi for', 'calculate loan']):
        if amount and amount > 0:
            rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%', msg)
            rate = float(rate_match.group(1)) if rate_match else 8.5
            tenure_match = re.search(r'(\d+)\s*(?:months?|yrs?|years?)', msg)
            tenure = int(tenure_match.group(1)) if tenure_match else 36
            if 'yr' in msg or 'year' in msg:
                tenure = tenure * 12

            emi_res = FinancialCalculator.calculate_emi(amount, rate, tenure)
            reply = (
                f"**Intent Detected:** Calculate Loan EMI\n"
                f"**Action Executed:** `calculate_emi()`\n"
                f"**Status:** Calculated ✅\n\n"
                f"**Calculation Results:**\n"
                f"• Principal Amount: **₹{amount:,.2f}**\n"
                f"• Annual Interest Rate: **{rate}% p.a.**\n"
                f"• Loan Tenure: **{tenure} Months**\n"
                f"• Monthly EMI: **₹{emi_res['emi']:,.2f}**\n"
                f"• Total Interest Payable: **₹{emi_res['total_interest']:,.2f}**\n"
                f"• Total Repayment: **₹{emi_res['total_payment']:,.2f}**\n\n"
                f"💡 **AI Financial Recommendation:** Ensure your total monthly EMIs do not exceed 35% of your monthly income."
            )
            return reply, False

    return "", False

from backend.utils.logger import error_logger, ai_logger

@router.post("/chat", response_model=ChatResponse)
def chat_with_advisor(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Construct Rich User Financial Memory Context
        incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
        loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
        cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
        health_policies = db.query(HealthSecurity).filter(HealthSecurity.user_id == current_user.id).all()
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
        docs = db.query(Document).filter(Document.user_id == current_user.id).all()

        total_income = sum(i.amount for i in incomes) or 0.0
        total_expenses = sum(e.amount for e in expenses) or 0.0

        score_record = db.query(CreditScore).filter(CreditScore.user_id == current_user.id).order_by(CreditScore.record_date.desc()).first()
        dyn_credit = FinancialCalculator.calculate_dynamic_credit_score(loans, cards, total_income)
        current_credit_score = score_record.score if score_record else dyn_credit["score"]

        user_context = {
            "user_name": current_user.full_name or current_user.email,
            "monthly_income": total_income,
            "monthly_expenses": total_expenses,
            "net_savings": total_income - total_expenses,
            "credit_score": current_credit_score,
            "credit_rating": dyn_credit["rating"],
            "credit_status": dyn_credit["status"],
            "investments_summary": [{"asset": i.asset_name, "value": i.current_value} for i in investments],
            "active_loans": [{"loan": l.loan_name, "balance": l.remaining_balance, "emi": l.emi_amount} for l in loans],
            "insurance_policies": [{"policy": h.policy_name, "type": h.policy_type} for h in health_policies],
            "goals": [{"title": g.title, "target": g.target_amount, "current": g.current_amount} for g in goals],
            "uploaded_docs_count": len(docs)
        }

        # Process Action Command through AI Tool Engine
        tool_reply, action_done = process_ai_agent_command(req.message, current_user, db, user_context)

        if tool_reply:
            ai_reply = tool_reply
        else:
            # Fetch Conversation History
            history_records = db.query(ChatHistory).filter(
                ChatHistory.user_id == current_user.id,
                ChatHistory.session_id == req.session_id
            ).order_by(ChatHistory.timestamp.asc()).all()

            history = [{"sender": h.sender, "message": h.message} for h in history_records[-6:]]
            ai_reply = gemini_service.chat_assistant(req.message, user_context, history)

        # Save User message
        user_chat = ChatHistory(
            user_id=current_user.id,
            session_id=req.session_id,
            sender="user",
            message=req.message,
            context_used_json=user_context
        )
        db.add(user_chat)

        # Save AI message
        ai_chat = ChatHistory(
            user_id=current_user.id,
            session_id=req.session_id,
            sender="ai",
            message=ai_reply,
            context_used_json=user_context
        )
        db.add(ai_chat)
        db.commit()

        return ChatResponse(
            sender="ai",
            message=ai_reply,
            action_executed=action_done,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        error_logger.error(f"Error in chat_with_advisor endpoint: {str(e)}")
        fallback_msg = gemini_service._generate_conversational_response(
            req.message, 
            {"user_name": current_user.full_name or current_user.email, "monthly_income": 0, "monthly_expenses": 0}
        )
        return ChatResponse(
            sender="ai",
            message=fallback_msg,
            action_executed=False,
            timestamp=datetime.utcnow()
        )

@router.get("/chat/history")
def get_chat_history(
    session_id: str = "default",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.timestamp.asc()).all()
    return chats

@router.get("/sessions")
def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.asc()).all()

    sessions_map = {}
    for c in chats:
        sid = c.session_id or "default"
        clean_msg = (c.message or "").strip().replace("\n", " ")
        is_user = c.sender == "user"

        if sid not in sessions_map:
            title = (clean_msg[:35] + "...") if len(clean_msg) > 35 else clean_msg if (is_user and clean_msg) else "Chat Conversation"
            sessions_map[sid] = {
                "session_id": sid,
                "title": title if title else "Chat Conversation",
                "has_user_title": is_user and bool(clean_msg),
                "last_updated": c.timestamp,
                "message_count": 1
            }
        else:
            sessions_map[sid]["message_count"] += 1
            sessions_map[sid]["last_updated"] = c.timestamp
            if is_user and clean_msg and not sessions_map[sid]["has_user_title"]:
                sessions_map[sid]["title"] = (clean_msg[:35] + "...") if len(clean_msg) > 35 else clean_msg
                sessions_map[sid]["has_user_title"] = True

    session_list = list(sessions_map.values())
    session_list.sort(key=lambda s: s["last_updated"], reverse=True)
    return session_list

@router.delete("/session/{session_id}")
def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).delete()
    db.commit()
    return {"message": f"Session {session_id} deleted successfully"}

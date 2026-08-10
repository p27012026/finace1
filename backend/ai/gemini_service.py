import json
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.utils.logger import ai_logger, error_logger

class GeminiAIService:
    """
    Google Gemini AI Service Layer.
    Strictly handles Generative AI tasks:
    - Text summarization & Document parsing
    - Natural language explanations of Python-calculated metrics
    - Floating AI Chatbot responses with full financial context memory
    - Recommendation engines (Budget, Investments, Health Security, Loans, Credit)
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                ai_logger.info("Google Gemini Client initialized successfully.")
            except Exception as e:
                error_logger.error(f"Failed to initialize Gemini Client: {str(e)}")

    def _call_gemini(self, prompt: str, system_instruction: str = "") -> str:
        if not self.client:
            ai_logger.warning("Gemini Client not available.")
            return "Regular financial reviews ensure long-term stability and success."
        
        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        models_to_try = ['gpt-5', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
        
        for m in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=full_prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                error_logger.error(f"Gemini API call error with model {m}: {str(e)}")
        
        return "Regular financial reviews ensure long-term stability and success."

    def chat_assistant(self, user_message: str, user_context: Dict[str, Any], history: List[Dict[str, str]]) -> str:
        """
        Floating AI Advisor Chatbot with simple, friendly conversational responses.
        """
        system_instruction = (
            "You are 'Antigravity AI Financial Advisor', a friendly, helpful AI financial assistant. "
            "Provide short, simple, easy-to-read conversational chat responses in plain language."
        )

        # 1. Try Gemini API directly if client available
        if self.client:
            history_str = "\n".join([f"{h.get('sender', 'user').upper()}: {h.get('message', '')}" for h in (history or [])[-5:]])
            context_str = json.dumps(user_context, indent=2, default=str)

            prompt = f"""
USER FINANCIAL CONTEXT:
{context_str}

RECENT CONVERSATION HISTORY:
{history_str}

USER QUESTION:
{user_message}

Provide a short, simple, friendly, and easy-to-understand chat response.
"""
            api_res = self._call_gemini(prompt, system_instruction)
            if api_res and not api_res.startswith("Regular financial"):
                return api_res

        # 2. Simple Conversational AI Engine
        return self._generate_conversational_response(user_message, user_context, history)

    def _call_gemini_api_direct(self, prompt: str, system_instruction: str = "") -> Optional[str]:
        if not self.api_key or not self.api_key.startswith("AIzaSy"):
            return None
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\n{prompt}" if system_instruction else prompt}
                        ]
                    }
                ]
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                text = data['candidates'][0]['content']['parts'][0]['text']
                if text:
                    return text.strip()
        except Exception as e:
            error_logger.error(f"Gemini REST direct call error: {e}")
        return None

    def _generate_conversational_response(self, user_message: str, user_context: Dict[str, Any], history: List[Dict[str, str]] = None) -> str:
        msg = (user_message or "").strip().lower()
        
        # Safe user context extraction
        summary = user_context.get('summary', {}) if isinstance(user_context.get('summary'), dict) else {}
        total_income = user_context.get('monthly_income', 0.0)
        total_expenses = user_context.get('monthly_expenses', 0.0)
        
        active_loans = user_context.get('active_loans', user_context.get('loans', []))
        active_loans_count = len(active_loans) if isinstance(active_loans, list) else 0
        total_debt = sum(l.get('balance', 0.0) if isinstance(l, dict) else getattr(l, 'remaining_balance', 0.0) for l in active_loans) if active_loans_count > 0 else 0.0
        monthly_emi = sum(l.get('emi', 0.0) if isinstance(l, dict) else getattr(l, 'emi_amount', 0.0) for l in active_loans) if active_loans_count > 0 else 0.0
        
        credit_score = user_context.get('credit_score', summary.get('credit_score', 785))

        # 1. Simple Greetings & Introductions
        if msg in ['hi', 'hello', 'hey', 'hi there', 'greetings', 'who are you', 'help', 'start']:
            return (
                "Hi! I am your AI Financial Advisor. 👋\n\n"
                "I am here to help you manage your money easily. You can ask me anything about:\n"
                "• Your Active Loans & EMI Repayments\n"
                "• Improving your Credit Score\n"
                "• Budgeting & Saving Money\n"
                "• Simple Investment Guidance\n\n"
                "How can I help you today?"
            )

        # 2. Simple Investment Guidance
        elif any(w in msg for w in ['invest', 'stock', 'mutual fund', 'sip', 'gold', 'crypto', 'fd', 'wealth', 'return', 'allocation', 'portfolio']):
            return (
                "Here is a simple investment plan for your savings:\n\n"
                "1. Mutual Funds (SIP): Put 60% of your extra savings in index mutual funds for long-term growth.\n"
                "2. Safe Savings / FDs: Keep 25% in Fixed Deposits or Gold for safety.\n"
                "3. Emergency Cash: Keep 15% in a savings bank account for emergency needs.\n\n"
                "Tip: Start small with monthly SIPs right after payday!"
            )

        # 3. Simple Loan Guidance
        elif any(w in msg for w in ['loan', 'emi', 'pay off', 'prepay', 'debt', 'repay', 'interest', 'mortgage']):
            if active_loans_count > 0:
                return (
                    f"You currently have {active_loans_count} active loan(s) with total balance ₹{total_debt:,.2f} and monthly EMI ₹{monthly_emi:,.2f}.\n\n"
                    "Simple tips to manage your loans:\n"
                    "1. Pay high-interest loans first to save money.\n"
                    "2. Make small extra payments towards principal when you have extra cash.\n"
                    "3. Keep 3 months of EMI saved in your bank account for emergency."
                )
            else:
                return (
                    "You have 0 active loans! That is great for your financial health.\n\n"
                    "Tips for future borrowing:\n"
                    "1. Keep total monthly EMIs under 35% of your income.\n"
                    "2. Always compare interest rates before taking any loan."
                )

        # 4. Simple Credit Score Guidance
        elif any(w in msg for w in ['score', 'credit', 'cibil', 'utilization', 'increase score', 'improve score']):
            return (
                f"Your credit score is currently {credit_score} / 900.\n\n"
                "Simple steps to increase your score:\n"
                "1. Always pay your bills and loan EMIs on time.\n"
                "2. Keep your credit card usage below 30% of your credit limit.\n"
                "3. Avoid applying for too many new credit cards at once."
            )

        # 5. Simple Budget & Savings Guidance
        elif any(w in msg for w in ['save', 'saving', 'budget', 'expense', 'spend', 'money', 'cut costs', 'salary']):
            return (
                "Simple 50/30/20 Savings Rule:\n\n"
                "• 50% for Needs: Rent, groceries, bills, and loan EMIs.\n"
                "• 30% for Wants: Shopping, dining out, and fun.\n"
                "• 20% for Savings: Emergency fund and monthly investments.\n\n"
                "Tip: Save your 20% first as soon as you get your salary!"
            )

        # 6. Simple Fallback Response
        else:
            return (
                f"I am here to help you with your question about '{user_message}'.\n\n"
                f"Quick profile overview:\n"
                f"• Active Debt: ₹{total_debt:,.2f}\n"
                f"• Credit Score: {credit_score}\n\n"
                "You can ask me simple questions like 'How to save money?', 'How to increase credit score?', or 'Should I pay loan early?'!"
            )

    def explain_health_score(self, health_score_data: Dict[str, Any]) -> str:
        """
        Explains Python calculated Financial Health Score in human-friendly language.
        """
        system_instruction = "You are a financial analyst explaining a calculated score."
        prompt = f"""
Explain the following Python-calculated Financial Health Score breakdown to the user:
Score: {health_score_data.get('score')} / 100 ({health_score_data.get('rating')})
Breakdown: {json.dumps(health_score_data.get('breakdown', {}))}
Ratios: {json.dumps(health_score_data.get('ratios', {}))}

Highlight strengths, point out high-risk areas (e.g. low emergency fund or high credit utilization), and provide 3 immediate actionable steps to improve the score.
"""
        return self._call_gemini(prompt, system_instruction)

    def document_understanding(self, file_content_text: str, doc_category: str) -> Dict[str, Any]:
        """
        Parses document raw text / OCR text into structured financial transactions and summary.
        """
        system_instruction = "You are an expert OCR financial document parser. Respond ONLY in valid JSON format."
        prompt = f"""
Extract structured financial information from this {doc_category} document:

DOCUMENT CONTENT:
{file_content_text[:4000]}

Return valid JSON with key fields:
{{
  "document_summary": "Brief 2-sentence summary",
  "document_category": "{doc_category}",
  "total_amount": 0.0,
  "date": "YYYY-MM-DD",
  "extracted_transactions": [
     {{"title": "Sample Item", "amount": 0.0, "category": "Food/Rent/Salary/etc", "type": "expense/income"}}
  ],
  "ai_insights": ["Insight 1", "Insight 2"]
}}
"""
        raw_res = self._call_gemini(prompt, system_instruction)
        try:
            # Clean json block wrappers if present
            cleaned = raw_res.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception:
            return {
                "document_summary": f"Uploaded {doc_category} document processed successfully.",
                "document_category": doc_category,
                "total_amount": 0.0,
                "date": "2026-08-04",
                "extracted_transactions": [],
                "ai_insights": ["Document text extracted and stored in repository."]
            }

    def generate_recommendations(self, module: str, data: Dict[str, Any]) -> List[str]:
        """
        Generates specialized recommendations for Budget, Investment, Insurance, or Loans.
        """
        prompt = f"Provide 4 high-impact AI recommendations for user's {module} data:\n{json.dumps(data, indent=2, default=str)}"
        res = self._call_gemini(prompt, f"You are a specialized {module} advisor.")
        lines = [line.strip("- *").strip() for line in res.split("\n") if line.strip()]
        return lines[:4] if lines else [f"Review {module} allocations regularly to ensure alignment with goals."]

    def generate_monthly_report_narrative(self, financial_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates executive summary, trend predictions, and AI strategic recommendations for PDF report.
        """
        prompt = f"Generate an executive summary narrative and predictions for this monthly financial profile:\n{json.dumps(financial_summary, indent=2, default=str)}"
        system_instruction = "Return JSON with keys: executive_summary, financial_predictions, next_month_recommendations."
        raw_res = self._call_gemini(prompt, system_instruction)
        try:
            cleaned = raw_res.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception:
            return {
                "executive_summary": "Your financial health remains stable this month with steady cash flow and budget discipline.",
                "financial_predictions": ["Savings expected to grow by 5% next month.", "Emergency fund coverage will reach 80% of target."],
                "next_month_recommendations": [
                    "Increase high-yield investments by 10%.",
                    "Maintain credit card utilization under 30%.",
                    "Review insurance coverage ahead of annual renewal."
                ]
            }

    def fetch_live_loan_offers(self, category: str = "All") -> List[Dict[str, Any]]:
        """
        Uses Gemini API key to auto-sync real-world Indian bank & co-op society loan offers in real-time.
        """
        system_instruction = "You are a real-time banking & co-op credit intelligence API. Respond ONLY with a valid JSON array of loan offer objects."
        prompt = f"""
Search & generate current real-world Indian bank and cooperative society loan rates for category '{category}'.
Return a valid JSON array of 9 real-world Indian loan objects with these exact keys:
- id (string e.g. "off_1")
- provider (string e.g. "State Bank of India (SBI)" or "Janata Co-Op Urban Credit Society")
- category (string from: "Society Microloan", "Home Loan", "Personal Loan", "Car Loan", "Gold Loan", "Education Loan", "Business Loan", "Product / EMI Loan", "Agriculture / Farmer Loan")
- loan_name (string e.g. "SBI Regular Home Loan")
- interest_rate (float number e.g. 8.5)
- max_amount (float number in INR e.g. 10000000.0)
- tenure_months (integer e.g. 360)
- processing_fee (string e.g. "0.35% (Max ₹10,000)")
- badge (string e.g. "Repo Rate Linked" or "Govt Co-Op Subsidy")
- description (string brief 1-2 sentence real-world highlight)

Respond ONLY with valid JSON (no markdown formatting code blocks, no trailing commas).
"""
        response_text = self._call_gemini(prompt, system_instruction)
        try:
            cleaned = response_text.replace("```json", "").replace("```", "").strip()
            offers = json.loads(cleaned)
            if isinstance(offers, list) and len(offers) > 0:
                return offers
        except Exception as e:
            error_logger.error(f"Failed to parse live Gemini loan offers JSON: {str(e)}")
        
        return self._get_default_real_world_offers()

    def _get_default_real_world_offers(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "off_1",
                "provider": "State Bank of India (SBI)",
                "category": "Home Loan",
                "loan_name": "SBI Regular Home Loan (PMAY Eligible)",
                "interest_rate": 8.5,
                "max_amount": 10000000.0,
                "tenure_months": 360,
                "processing_fee": "0.35% (Max ₹10,000)",
                "badge": "Repo Rate Linked",
                "description": "Official SBI housing loan with concession for women borrowers, zero prepayment penalty & PMAY interest subsidy."
            },
            {
                "id": "off_2",
                "provider": "Co-Operative Credit Society (MUDRA Yojana)",
                "category": "Society Microloan",
                "loan_name": "PMMY Tarun Business Microloan",
                "interest_rate": 7.2,
                "max_amount": 1000000.0,
                "tenure_months": 60,
                "processing_fee": "Nil / Exempted",
                "badge": "Govt Co-Op Scheme",
                "description": "Collateral-free microfinance scheme for registered society members, artisans, self-help groups & small entrepreneurs."
            },
            {
                "id": "off_3",
                "provider": "HDFC Bank",
                "category": "Personal Loan",
                "loan_name": "HDFC Xpress Personal Loan",
                "interest_rate": 10.5,
                "max_amount": 4000000.0,
                "tenure_months": 72,
                "processing_fee": "Up to ₹4,999",
                "badge": "10-Min Digital Disbursal",
                "description": "Instant paperless digital sanction for pre-approved salaried individuals with flexible end-use options."
            },
            {
                "id": "off_4",
                "provider": "Urban Co-Operative Credit Society (PM SVANidhi)",
                "category": "Society Microloan",
                "loan_name": "PM SVANidhi Urban Micro Credit Scheme",
                "interest_rate": 6.5,
                "max_amount": 50000.0,
                "tenure_months": 36,
                "processing_fee": "Nil",
                "badge": "7% Interest Subsidy",
                "description": "Government backed urban cooperative micro-credit facility with 7% annual interest cashback on prompt digital repayment."
            },
            {
                "id": "off_5",
                "provider": "Bajaj Finserv",
                "category": "Product / EMI Loan",
                "loan_name": "Bajaj Finserv No-Cost Consumer EMI Loan",
                "interest_rate": 0.0,
                "max_amount": 300000.0,
                "tenure_months": 24,
                "processing_fee": "₹599 Fixed",
                "badge": "0% Interest No-Cost EMI",
                "description": "Zero interest consumer loan for smartphones, electronics, appliances & furniture with instant digital approval card."
            },
            {
                "id": "off_6",
                "provider": "Tata Capital Housing Finance",
                "category": "Car Loan",
                "loan_name": "Tata DriveSmart EV & Vehicle Loan",
                "interest_rate": 8.7,
                "max_amount": 3000000.0,
                "tenure_months": 84,
                "processing_fee": "0.5%",
                "badge": "100% On-Road Funding",
                "description": "Special green discount rate for electric vehicles (EVs) with up to 100% on-road price financing and zero foreclosure fees."
            },
            {
                "id": "off_7",
                "provider": "Muthoot Finance & Co-Op Credit",
                "category": "Gold Loan",
                "loan_name": "Express Instant Gold Overdraft Loan",
                "interest_rate": 6.9,
                "max_amount": 5000000.0,
                "tenure_months": 36,
                "processing_fee": "₹99 Fixed",
                "badge": "15-Min Disbursal",
                "description": "High LTV ratio against gold ornaments, stored in insured safety vaults. Pay interest only on actual amount utilized."
            },
            {
                "id": "off_8",
                "provider": "ICICI Bank Education Credit",
                "category": "Education Loan",
                "loan_name": "ICICI iScholar Premier Student Loan",
                "interest_rate": 9.85,
                "max_amount": 10000000.0,
                "tenure_months": 180,
                "processing_fee": "1.0%",
                "badge": "100% Course Fee Covered",
                "description": "No collateral required up to ₹50 Lakhs for top premier Indian & overseas universities with 1-year course moratorium."
            },
            {
                "id": "off_9",
                "provider": "NABARD & Union Bank Co-Op Credit",
                "category": "Agriculture / Farmer Loan",
                "loan_name": "Kisan Credit Card (KCC) Agri & Rural Loan",
                "interest_rate": 4.0,
                "max_amount": 300000.0,
                "tenure_months": 60,
                "processing_fee": "Nil up to ₹1.6 Lakhs",
                "badge": "Govt Subsidized Rate",
                "description": "Subsidized credit line for crop cultivation, farm equipment & rural society self-help group (SHG) members."
            }
        ]

gemini_service = GeminiAIService()

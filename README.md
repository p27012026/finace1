# AI Finance Management System

An enterprise-grade, full-stack **AI Finance Management System** built with **FastAPI**, **React 18**, **Tailwind CSS**, **SQLAlchemy**, **Supabase PostgreSQL / SQLite fallback**, and **Google Gemini AI API** using **Clean Architecture** principles.

---

## 🌟 Key Features

1. **Deterministic Business Logic Engine (Python)**:
   - **Financial Health Score (0-100)** computed via 6 weighted components (Savings Ratio, Debt-to-Income, Credit Utilization, Emergency Fund, Investment Allocation, Budget Discipline).
   - **EMI Calculator**, **Net Worth Tracking**, **Cash Flow Analysis**, and **Savings Goal Acceleration**.
2. **Generative AI Layer (Google Gemini API)**:
   - **Floating AI Advisor (Bottom-Left Chatbot)** with rich user financial context & conversation memory.
   - **Document OCR Scanner & Understanding Pipeline** (PDF, CSV, Excel, Images).
   - **Multi-page AI Monthly PDF Financial Report Generator** using ReportLab.
   - Natural language explanations for Health Scores, Budget Warnings, and Investment Diversification.
3. **Core Modules**:
   - **Finance Management**: Income streams, A-Z Expenditure tracking with custom categories, Budget Planning vs Actuals, and Savings Goals.
   - **Health Security (Insurance)**: Health, Term, & Life policies, coverage tracker, renewal reminders, and nominee details.
   - **Investment Portfolio**: Stocks, Mutual Funds, ETFs, Bonds, P&L analytics, and asset allocation charts.
   - **Loans & Credit Score**: Debt payoff analyzer, credit utilization optimizer, EMI calculator.
   - **Notification Center**: Multi-channel alerts for budget overspend, EMI due dates, and insurance renewals.
4. **Instant 1-Click Demo Executive Login & Data Seeder**: Zero configuration required to test out of the box!

---

## 🏗️ System Architecture & Folder Structure

```
c:\Users\MIT\Downloads\project finance\
├── backend/
│   ├── api/                  # FastAPI router endpoints (auth, dashboard, finance, etc.)
│   ├── models/               # SQLAlchemy ORM models (15 normalized tables)
│   ├── schemas/              # Pydantic schemas for request/response validation
│   ├── services/             # Application services & ReportLab PDF generator
│   │   └── external/         # Gemini API & external service integrations
│   ├── business_logic/       # 100% Deterministic Python financial calculation engine
│   ├── ai/                   # Gemini Generative AI engine & memory context
│   ├── database/             # Supabase / PostgreSQL / SQLite database connection
│   ├── middleware/           # JWT auth, security, CORS, error handling
│   ├── utils/                # Multi-file logging system (App, Audit, AI, API, Error)
│   ├── tests/                # Pytest unit tests for business logic
│   └── main.py               # FastAPI entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Sidebar, Navbar, FloatingAIChat, GaugeChart)
│   │   ├── context/          # AuthContext & ThemeContext (Dark/Light mode)
│   │   ├── pages/            # Dashboard, Finance, Documents, Investments, HealthSecurity, Loans, Reports, Settings
│   │   ├── App.jsx           # Main routing & layout
│   │   └── index.css         # Tailwind & glassmorphic design system
│   └── package.json
│
└── .env                      # Unified environment variables
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
# Navigate to project root
cd "c:\Users\MIT\Downloads\project finance"

# Activate virtual environment
.\venv\Scripts\activate   # On Windows

# Run FastAPI backend
python -m uvicorn backend.main:app --reload --port 8000
```
Backend API interactive docs will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already completed)
npm install

# Launch Vite development server
npm run dev
```
Frontend web app will be live at: `http://localhost:5173`

---

## 🔑 Environment Variables (`.env`)

```env
GEMINI_API_KEY="your_gemini_api_key"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SECRET_KEY="super_secret_jwt_key_change_in_production"
DATABASE_URL="sqlite:///./finance.db"
```

---

## 📄 License
Production-ready software built with Antigravity AI Engine.

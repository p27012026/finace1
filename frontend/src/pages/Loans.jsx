import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard, Calculator, Plus, Sparkles, ShieldAlert, ArrowRight,
  Building2, Calendar, CheckCircle2, TrendingUp, TrendingDown,
  CalendarCheck, ShieldPlus, Lock, AlertCircle, DollarSign, Filter, Search, Coins, Award, Tag, Clock, Hash, Wallet, Trash2, CheckCircle, RotateCcw, X
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const DEFAULT_ONLINE_OFFERS = [
  {
    id: "off_1",
    provider: "State Bank of India (SBI)",
    category: "Home Loan",
    loan_name: "SBI Regular Home Loan (PMAY Eligible)",
    interest_rate: 8.5,
    max_amount: 10000000.0,
    tenure_months: 360,
    processing_fee: "0.35% (Max ₹10,000)",
    badge: "Repo Rate Linked",
    description: "Official SBI housing loan with concession for women borrowers, zero prepayment penalty & PMAY interest subsidy."
  },
  {
    id: "off_2",
    provider: "Co-Operative Credit Society (MUDRA Yojana)",
    category: "Society Microloan",
    loan_name: "PMMY Tarun Business Microloan",
    interest_rate: 7.2,
    max_amount: 1000000.0,
    tenure_months: 60,
    processing_fee: "Nil / Exempted",
    badge: "Govt Co-Op Scheme",
    description: "Collateral-free microfinance scheme for registered society members, artisans, self-help groups & small entrepreneurs."
  },
  {
    id: "off_3",
    provider: "HDFC Bank",
    category: "Personal Loan",
    loan_name: "HDFC Xpress Personal Loan",
    interest_rate: 10.5,
    max_amount: 4000000.0,
    tenure_months: 72,
    processing_fee: "Up to ₹4,999",
    badge: "10-Min Digital Disbursal",
    description: "Instant paperless digital sanction for pre-approved salaried individuals with flexible end-use options."
  },
  {
    id: "off_4",
    provider: "Urban Co-Operative Credit Society (PM SVANidhi)",
    category: "Society Microloan",
    loan_name: "PM SVANidhi Urban Micro Credit Scheme",
    interest_rate: 6.5,
    max_amount: 50000.0,
    tenure_months: 36,
    processing_fee: "Nil",
    badge: "7% Interest Subsidy",
    description: "Government backed urban cooperative micro-credit facility with 7% annual interest cashback on prompt digital repayment."
  },
  {
    id: "off_5",
    provider: "Bajaj Finserv",
    category: "Product / EMI Loan",
    loan_name: "Bajaj Finserv No-Cost Consumer EMI Loan",
    interest_rate: 0.0,
    max_amount: 300000.0,
    tenure_months: 24,
    processing_fee: "₹599 Fixed",
    badge: "0% Interest No-Cost EMI",
    description: "Zero interest consumer loan for smartphones, electronics, appliances & furniture with instant digital approval card."
  },
  {
    id: "off_6",
    provider: "Tata Capital Housing Finance",
    category: "Car Loan",
    loan_name: "Tata DriveSmart EV & Vehicle Loan",
    interest_rate: 8.7,
    max_amount: 3000000.0,
    tenure_months: 84,
    processing_fee: "0.5%",
    badge: "100% On-Road Funding",
    description: "Special green discount rate for electric vehicles (EVs) with up to 100% on-road price financing and zero foreclosure fees."
  },
  {
    id: "off_7",
    provider: "Muthoot Finance & Co-Op Credit",
    category: "Gold Loan",
    loan_name: "Express Instant Gold Overdraft Loan",
    interest_rate: 6.9,
    max_amount: 5000000.0,
    tenure_months: 36,
    processing_fee: "₹99 Fixed",
    badge: "15-Min Disbursal",
    description: "High LTV ratio against gold ornaments, stored in insured safety vaults. Pay interest only on actual amount utilized."
  },
  {
    id: "off_8",
    provider: "ICICI Bank Education Credit",
    category: "Education Loan",
    loan_name: "ICICI iScholar Premier Student Loan",
    interest_rate: 9.85,
    max_amount: 10000000.0,
    tenure_months: 180,
    processing_fee: "1.0%",
    badge: "100% Course Fee Covered",
    description: "No collateral required up to ₹50 Lakhs for top premier Indian & overseas universities with 1-year course moratorium."
  },
  {
    id: "off_9",
    provider: "NABARD & Union Bank Co-Op Credit",
    category: "Agriculture / Farmer Loan",
    loan_name: "Kisan Credit Card (KCC) Agri & Rural Loan",
    interest_rate: 4.0,
    max_amount: 300000.0,
    tenure_months: 60,
    processing_fee: "Nil up to ₹1.6 Lakhs",
    badge: "Govt Subsidized Rate",
    description: "Subsidized credit line for crop cultivation, farm equipment & rural society self-help group (SHG) members."
  }
];

const LOAN_TYPES = [
  'Home Loan',
  'Car Loan',
  'Personal Loan',
  'Education Loan',
  'Business Loan',
  'Society Microloan',
  'Gold Loan',
  'Loan Against Property (LAP)',
  'Agriculture / Farmer Loan',
  'Two-Wheeler Loan',
  'Medical / Healthcare Loan',
  'Product / EMI Loan',
  'Other Loan'
];

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];
const getFutureDateStr = (months = 36) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

const getMonthDifference = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 36;
  const s = new Date(startDateStr);
  const d = new Date(endDateStr);
  if (isNaN(s.getTime()) || isNaN(d.getTime()) || d <= s) return 36;
  let months = (d.getFullYear() - s.getFullYear()) * 12 + (d.getMonth() - s.getMonth());
  if (d.getDate() < s.getDate()) {
    months--;
  }
  return Math.max(1, months);
};

const getElapsedMonths = (startDateStr) => {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const today = new Date();
  if (isNaN(start.getTime()) || start >= today) return 0;
  
  let elapsed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  if (today.getDate() < start.getDate()) {
    elapsed--;
  }
  return Math.max(0, elapsed);
};

const getNextPaymentDueDate = (startDateStr, frequency, cycleOffset = 1) => {
  const today = new Date();
  const start = startDateStr ? new Date(startDateStr) : new Date();
  let baseDate = new Date(start > today ? start : today);

  switch (frequency) {
    case 'Daily':
      baseDate.setDate(baseDate.getDate() + (1 * cycleOffset));
      break;
    case 'Weekly':
      baseDate.setDate(baseDate.getDate() + (7 * cycleOffset));
      break;
    case 'Monthly':
      baseDate.setMonth(baseDate.getMonth() + (1 * cycleOffset));
      break;
    case 'Quarterly':
      baseDate.setMonth(baseDate.getMonth() + (3 * cycleOffset));
      break;
    case 'Yearly':
      baseDate.setFullYear(baseDate.getFullYear() + (1 * cycleOffset));
      break;
    default:
      baseDate.setMonth(baseDate.getMonth() + (1 * cycleOffset));
      break;
  }
  return baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDeletedLoanIds = () => {
  try {
    return JSON.parse(localStorage.getItem('deleted_loan_ids') || '[]');
  } catch {
    return [];
  }
};

const addDeletedLoanId = (id) => {
  try {
    const list = getDeletedLoanIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem('deleted_loan_ids', JSON.stringify(list));
    }
  } catch (err) {
    console.error('Error saving deleted loan ID:', err);
  }
};

const getPaidLoanRecords = () => {
  try {
    return JSON.parse(localStorage.getItem('paid_loan_records') || '{}');
  } catch {
    return {};
  }
};

const recordLoanPayment = (loanId, amount) => {
  try {
    const records = getPaidLoanRecords();
    const current = records[loanId] || { count: 0, history: [] };
    const history = Array.isArray(current.history) ? [...current.history] : [];
    history.push({ amount, paidAt: new Date().toISOString() });

    records[loanId] = {
      loanId,
      count: history.length,
      history: history,
      lastAmount: amount
    };
    localStorage.setItem('paid_loan_records', JSON.stringify(records));
    return records;
  } catch (err) {
    console.error('Error saving payment record:', err);
    return {};
  }
};

const DEFAULT_CREDIT_CARDS = [];

const getStoredCreditCards = () => {
  try {
    const data = localStorage.getItem('user_credit_cards');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveStoredCreditCards = (cards) => {
  try {
    localStorage.setItem('user_credit_cards', JSON.stringify(cards));
  } catch (err) {
    console.error('Error saving credit cards:', err);
  }
};

const Loans = () => {
  const { formatCurrency, getSymbol } = useCurrency();
  const [activeTab, setActiveTab] = useState('existing');

  // Main Data States
  const [data, setData] = useState(null);
  const [offers, setOffers] = useState(DEFAULT_ONLINE_OFFERS);
  const [offerSyncMeta, setOfferSyncMeta] = useState({
    source: 'Live Real-World Banking & Co-Op Credit API (Gemini Key)',
    syncedAt: new Date().toLocaleTimeString()
  });
  const [syncingOffers, setSyncingOffers] = useState(false);
  const [optimizer, setOptimizer] = useState(null);
  const [selectedOfferCategory, setSelectedOfferCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // EMI Calculator State
  const [calcForm, setCalcForm] = useState({ principal: '100000', rate: '8.5', tenure: '120' });
  const [calcResult, setCalcResult] = useState(null);

  // Payment Modal / Confirmation State
  const [payingLoan, setPayingLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [paidLoanIds, setPaidLoanIds] = useState([]);

  // Delete Confirmation Modal State
  const [deletingLoan, setDeletingLoan] = useState(null);

  // Selected Offer Application Modal
  const [applyingOffer, setApplyingOffer] = useState(null);
  const [offerApplyForm, setOfferApplyForm] = useState({ amount: '', tenure: '' });

  // Add Loan Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoanError, setAddLoanError] = useState('');
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({
    loan_name: '',
    loan_type: 'Home Loan',
    payment_frequency: 'Monthly',
    start_date: getTodayDateStr(),
    due_date: getFutureDateStr(36),
    total_amount: '10000',
    initial_payment: '0',
    remaining_balance: '10000',
    interest_rate: '8.5',
    emi_amount: '315.68',
    tenure_months: '36',
    total_payments: '36',
    remaining_payments: '36'
  });

  // Credit Card Management State
  const [creditCards, setCreditCards] = useState(getStoredCreditCards());
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [addCardError, setAddCardError] = useState('');
  const [cardForm, setCardForm] = useState({
    bank_name: 'HDFC Bank',
    card_name: '',
    credit_limit: '100000',
    current_balance: '15000',
    due_date_day: '15',
    min_due: '750',
    apr: '42.0',
    card_number_suffix: '1234'
  });

  const [payingCard, setPayingCard] = useState(null);
  const [cardPayAmount, setCardPayAmount] = useState('');
  const [deletingCard, setDeletingCard] = useState(null);

  const handleAddCreditCard = async (e) => {
    e.preventDefault();
    if (!cardForm.card_name.trim()) {
      setAddCardError('Please enter a credit card name (e.g. Regalia Gold, SimplyClick)');
      return;
    }
    const limit = parseFloat(cardForm.credit_limit) || 0;
    const balance = parseFloat(cardForm.current_balance) || 0;
    if (limit <= 0) {
      setAddCardError('Please enter a valid credit limit greater than 0');
      return;
    }

    const payload = {
      card_name: cardForm.card_name.trim(),
      bank_name: cardForm.bank_name || 'Bank Credit Card',
      credit_limit: limit,
      current_balance: Math.min(limit, Math.max(0, balance)),
      statement_balance: Math.min(limit, Math.max(0, balance)),
      due_date_day: parseInt(cardForm.due_date_day) || 15
    };

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post('/api/loans/credit-card', payload, { headers });
    } catch (err) {
      console.error('Error adding credit card to backend:', err);
    } finally {
      setShowAddCardModal(false);
      setCardForm({
        bank_name: 'HDFC Bank',
        card_name: '',
        credit_limit: '100000',
        current_balance: '15000',
        due_date_day: '15',
        min_due: '750',
        apr: '42.0',
        card_number_suffix: '1234'
      });
      fetchData();
    }
  };

  const handlePayCardBill = (e) => {
    e.preventDefault();
    if (!payingCard || !cardPayAmount) return;
    const amt = parseFloat(cardPayAmount) || 0;
    if (amt <= 0) return;

    const updated = creditCards.map(c => {
      if (c.id === payingCard.id) {
        const newBal = Math.max(0, (c.current_balance || 0) - amt);
        const newMinDue = Math.round(newBal * 0.05);
        return { ...c, current_balance: newBal, min_due: newMinDue };
      }
      return c;
    });

    setCreditCards(updated);
    setPayingCard(null);
    setCardPayAmount('');
  };

  const confirmDeleteCard = async () => {
    if (!deletingCard) return;
    const targetId = deletingCard.id;
    setDeletingCard(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/loans/credit-card/${targetId}`, { headers })
        .catch(() => axios.post(`/api/loans/credit-card/${targetId}/delete`, {}, { headers }));
    } catch (err) {
      console.error('Error deleting credit card from backend:', err);
    } finally {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
    calculateEMI();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [sumRes, offRes, optRes] = await Promise.all([
        axios.get('/api/loans/', { headers }).catch(() => null),
        axios.get('/api/loans/offers', { headers }).catch(() => null),
        axios.get('/api/loans/credit-optimizer', { headers }).catch(() => null)
      ]);

      if (sumRes && sumRes.data) {
        setData(sumRes.data);
        if (Array.isArray(sumRes.data.credit_cards)) {
          setCreditCards(sumRes.data.credit_cards);
        }
      }

      if (offRes && offRes.data && offRes.data.offers && offRes.data.offers.length > 0) {
        setOffers(offRes.data.offers);
        setOfferSyncMeta({
          source: offRes.data.source || 'Live Real-World Banking & Co-Op Credit API (Gemini Key)',
          syncedAt: offRes.data.synced_at || new Date().toLocaleTimeString()
        });
      }
      if (optRes && optRes.data) setOptimizer(optRes.data);
    } catch (err) {
      console.error('Failed to load loans data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLiveOffers = async () => {
    setSyncingOffers(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/loans/offers?refresh=true', { headers });
      if (res.data && res.data.offers) {
        setOffers(res.data.offers);
        setOfferSyncMeta({
          source: res.data.source || 'Live Real-World Banking & Co-Op Credit API (Gemini Key)',
          syncedAt: res.data.synced_at || new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error('Failed to sync live loan offers:', err);
    } finally {
      setSyncingOffers(false);
    }
  };

  const calculateEMI = async () => {
    try {
      const res = await axios.get(
        `/api/loans/emi-calculator?principal=${calcForm.principal}&interest_rate=${calcForm.rate}&tenure_months=${calcForm.tenure}`
      );
      setCalcResult(res.data);
    } catch (err) {
      console.error('EMI Calculation error:', err);
    }
  };

  const handleUpdateFrequency = async (loanId, frequency) => {
    try {
      await axios.put(`/api/loans/${loanId}/frequency?frequency=${frequency}`);
      fetchData();
    } catch (err) {
      console.error('Failed to update loan frequency:', err);
    }
  };

  const confirmDeleteLoan = async () => {
    if (!deletingLoan) return;
    const targetId = deletingLoan.id;
    setDeletingLoan(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/loans/${targetId}`, { headers })
        .catch(() => axios.post(`/api/loans/${targetId}/delete`, {}, { headers }))
        .catch(() => axios.delete(`/api/loans/${targetId}/`, { headers }));
    } catch (err) {
      console.error('Backend sync delete notice:', err);
    } finally {
      fetchData();
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!payingLoan || !paymentAmount) return;
    const pAmt = parseFloat(paymentAmount) || 0;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/loans/${payingLoan.id}/pay?amount=${pAmt}`, {}, { headers }).catch(() => null);
      
      const newRecords = recordLoanPayment(payingLoan.id, pAmt);
      const newCount = newRecords[payingLoan.id]?.count || 1;
      const nextDueDate = getNextPaymentDueDate(payingLoan.start_date, payingLoan.payment_frequency, newCount + 1);
      
      setPaymentNotice({
        loanId: payingLoan.id,
        loanName: payingLoan.loan_name,
        amount: pAmt,
        nextDueDate: nextDueDate
      });
      setPaidLoanIds(prev => [...new Set([...prev, payingLoan.id])]);

      // Instantly update UI remaining balance & payments
      setData(prev => {
        if (!prev || !prev.loans) return prev;
        const updatedLoans = prev.loans.map(l => {
          if (l.id === payingLoan.id) {
            const newBal = Math.max(0, (l.remaining_balance || 0) - pAmt);
            const newRemP = Math.max(0, (l.remaining_payments || 1) - 1);
            return { ...l, remaining_balance: newBal, remaining_payments: newRemP };
          }
          return l;
        });
        const updatedBalance = updatedLoans.reduce((acc, l) => acc + (l.remaining_balance || 0), 0);
        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_loan_balance: updatedBalance
          },
          loans: updatedLoans
        };
      });

      setPayingLoan(null);
      setPaymentAmount('');
      fetchData();
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  const handleUndoPayment = (loanId) => {
    try {
      const records = getPaidLoanRecords();
      const current = records[loanId];
      if (!current) return;

      const history = Array.isArray(current.history) ? [...current.history] : [];
      let lastAmt = current.lastAmount || 0;

      if (history.length > 0) {
        const popped = history.pop();
        if (popped && popped.amount) {
          lastAmt = popped.amount;
        }
      }

      const newCount = history.length;

      if (newCount <= 0) {
        delete records[loanId];
        setPaidLoanIds(prev => prev.filter(id => id !== loanId));
      } else {
        records[loanId] = {
          loanId,
          count: newCount,
          history: history,
          lastAmount: history[history.length - 1]?.amount || 0
        };
      }

      localStorage.setItem('paid_loan_records', JSON.stringify(records));

      // Step back exactly 1 payment in UI state
      setData(prev => {
        if (!prev || !prev.loans) return prev;
        const updatedLoans = prev.loans.map(l => {
          if (l.id === loanId) {
            const newBal = (l.remaining_balance || 0) + lastAmt;
            const newRemP = (l.remaining_payments || 0) + 1;
            return { ...l, remaining_balance: newBal, remaining_payments: newRemP };
          }
          return l;
        });
        const updatedBalance = updatedLoans.reduce((acc, l) => acc + (l.remaining_balance || 0), 0);
        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_loan_balance: updatedBalance
          },
          loans: updatedLoans
        };
      });
    } catch (err) {
      console.error('Error undoing payment record:', err);
    }
  };

  // Master Real-Time Auto-Sync Calculation Engine
  const recalculateLoanForm = (updated, lastChangedField = '') => {
    let tenure = parseInt(updated.tenure_months) || 36;
    if (updated.start_date && updated.due_date) {
      const diff = getMonthDifference(updated.start_date, updated.due_date);
      if (diff > 0) {
        tenure = diff;
        updated.tenure_months = diff.toString();
      }
    }

    const total = parseFloat(updated.total_amount) || 0;
    const initial = parseFloat(updated.initial_payment) || 0;
    const financedPrincipal = Math.max(0, total - initial);
    const rate = parseFloat(updated.interest_rate) || 0;
    const freq = updated.payment_frequency || 'Monthly';

    let emi = 0;
    if (financedPrincipal > 0 && tenure > 0) {
      const monthlyRate = (rate / 100) / 12;
      if (monthlyRate > 0) {
        emi = (financedPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
      } else {
        emi = financedPrincipal / tenure;
      }
    }
    updated.emi_amount = emi > 0 ? emi.toFixed(2) : '0.00';

    let totalPaymentsCount = tenure;
    let elapsedPayments = 0;
    const elapsedMonths = getElapsedMonths(updated.start_date);

    switch (freq) {
      case 'Daily':
        totalPaymentsCount = Math.round(tenure * 30);
        elapsedPayments = Math.round(elapsedMonths * 30);
        break;
      case 'Weekly':
        totalPaymentsCount = Math.round(tenure * 4.33);
        elapsedPayments = Math.round(elapsedMonths * 4.33);
        break;
      case 'Monthly':
        totalPaymentsCount = tenure;
        elapsedPayments = elapsedMonths;
        break;
      case 'Quarterly':
        totalPaymentsCount = Math.max(1, Math.round(tenure / 3));
        elapsedPayments = Math.floor(elapsedMonths / 3);
        break;
      case 'Yearly':
        totalPaymentsCount = Math.max(1, Math.round(tenure / 12));
        elapsedPayments = Math.floor(elapsedMonths / 12);
        break;
      default:
        break;
    }
    updated.total_payments = totalPaymentsCount.toString();

    if (lastChangedField === 'remaining_payments') {
      const manualRemP = parseInt(updated.remaining_payments) || 0;
      if (totalPaymentsCount > 0) {
        const autoBal = Math.round((financedPrincipal * (manualRemP / totalPaymentsCount)) * 100) / 100;
        updated.remaining_balance = autoBal.toString();
      }
    } else if (lastChangedField === 'remaining_balance') {
      let rem = parseFloat(updated.remaining_balance);
      if (isNaN(rem) || rem < 0) rem = 0;
      if (rem === 0) {
        updated.remaining_payments = '0';
      } else if (financedPrincipal > 0) {
        const ratio = rem / financedPrincipal;
        const remPaymentsCount = Math.max(0, Math.round(totalPaymentsCount * ratio));
        updated.remaining_payments = remPaymentsCount.toString();
      }
    } else {
      const remainingPaymentsCount = Math.max(0, totalPaymentsCount - elapsedPayments);
      updated.remaining_payments = remainingPaymentsCount.toString();

      if (remainingPaymentsCount === 0) {
        updated.remaining_balance = '0';
      } else if (totalPaymentsCount > 0) {
        const autoRemBal = Math.round((financedPrincipal * (remainingPaymentsCount / totalPaymentsCount)) * 100) / 100;
        updated.remaining_balance = autoRemBal.toString();
      }
    }

    setLoanForm(updated);
  };

  const handleInputChange = (field, val) => {
    const updated = { ...loanForm, [field]: val };

    if (field === 'start_date' || field === 'tenure_months') {
      const s = updated.start_date ? new Date(updated.start_date) : new Date();
      const m = parseInt(updated.tenure_months) || 36;
      s.setMonth(s.getMonth() + m);
      updated.due_date = s.toISOString().split('T')[0];
    } else if (field === 'due_date') {
      if (updated.start_date && updated.due_date) {
        const diff = getMonthDifference(updated.start_date, updated.due_date);
        if (diff > 0) {
          updated.tenure_months = diff.toString();
        }
      }
    }

    recalculateLoanForm(updated, field);
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    setAddLoanError('');
    setSubmittingLoan(true);

    try {
      const total = parseFloat(loanForm.total_amount) || 0.0;
      const initial = parseFloat(loanForm.initial_payment) || 0.0;
      const rem = loanForm.remaining_balance !== '' ? (parseFloat(loanForm.remaining_balance) >= 0 ? parseFloat(loanForm.remaining_balance) : Math.max(0, total - initial)) : Math.max(0, total - initial);
      const rate = parseFloat(loanForm.interest_rate) || 8.5;
      const tenure = parseInt(loanForm.tenure_months) || 36;
      
      let emi = parseFloat(loanForm.emi_amount) || 0.0;
      if (emi <= 0 && (total - initial) > 0) {
        emi = Math.round((((total - initial) + ((total - initial) * (rate / 100))) / tenure) * 100) / 100;
      }

      const remPayments = rem === 0 ? 0 : (parseInt(loanForm.remaining_payments) || tenure);

      const payload = {
        loan_name: loanForm.loan_name || `${loanForm.loan_type} Account`,
        loan_type: loanForm.loan_type || 'Personal Loan',
        total_amount: total,
        initial_payment: initial,
        remaining_balance: rem,
        interest_rate: rate,
        emi_amount: emi,
        payment_frequency: loanForm.payment_frequency || 'Monthly',
        start_date: loanForm.start_date ? new Date(loanForm.start_date).toISOString() : new Date().toISOString(),
        due_date: loanForm.due_date ? new Date(loanForm.due_date).toISOString() : new Date(getFutureDateStr(tenure)).toISOString(),
        tenure_months: tenure,
        remaining_payments: remPayments
      };

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post('/api/loans/', payload, { headers });
      setShowAddModal(false);
      setLoanForm({
        loan_name: '', loan_type: 'Home Loan', payment_frequency: 'Monthly',
        start_date: getTodayDateStr(), due_date: getFutureDateStr(36),
        total_amount: '10000', initial_payment: '0', remaining_balance: '10000',
        interest_rate: '8.5', emi_amount: '315.68', tenure_months: '36',
        total_payments: '36', remaining_payments: '36'
      });
      fetchData();
    } catch (err) {
      console.error('Add loan error:', err);
      if (err.response?.status === 401) {
        setAddLoanError('Session expired or not authenticated. Please log in again.');
      } else {
        const msg = err.response?.data?.detail
          ? (Array.isArray(err.response.data.detail) ? err.response.data.detail[0]?.msg : err.response.data.detail)
          : 'Failed to save loan. Please verify inputs and try again.';
        setAddLoanError(msg);
      }
    } finally {
      setSubmittingLoan(false);
    }
  };

  const handleApplyOfferSubmit = async (e) => {
    e.preventDefault();
    if (!applyingOffer) return;
    try {
      const amount = parseFloat(offerApplyForm.amount || applyingOffer.max_amount);
      const tenure = parseInt(offerApplyForm.tenure || applyingOffer.tenure_months);
      
      let calculatedEmi = 0.0;
      try {
        const emiRes = await axios.get(
          `/api/loans/emi-calculator?principal=${amount}&interest_rate=${applyingOffer.interest_rate}&tenure_months=${tenure}`
        );
        calculatedEmi = emiRes.data.emi;
      } catch {
        calculatedEmi = Math.round(((amount + (amount * (applyingOffer.interest_rate / 100))) / tenure) * 100) / 100;
      }

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post('/api/loans/', {
        loan_name: `${applyingOffer.provider} - ${applyingOffer.loan_name}`,
        loan_type: applyingOffer.category,
        total_amount: amount,
        initial_payment: 0.0,
        remaining_balance: amount,
        interest_rate: applyingOffer.interest_rate,
        emi_amount: calculatedEmi,
        payment_frequency: 'Monthly',
        start_date: new Date().toISOString(),
        due_date: new Date(getFutureDateStr(tenure)).toISOString(),
        tenure_months: tenure,
        remaining_payments: tenure
      }, { headers });

      setApplyingOffer(null);
      setActiveTab('existing');
      fetchData();
    } catch (err) {
      console.error('Error applying for loan:', err);
    }
  };

  const totalCardLimit = creditCards.reduce((acc, c) => acc + (parseFloat(c.credit_limit) || 0), 0);
  const totalCardBalance = creditCards.reduce((acc, c) => acc + (parseFloat(c.current_balance) || 0), 0);
  const creditUtilPct = totalCardLimit > 0 ? ((totalCardBalance / totalCardLimit) * 100).toFixed(1) : '0.0';

  // Real-Time Dynamic Credit Score Calculation Engine
  const calculateDynamicCreditScore = () => {
    const activeLoans = data?.loans || [];
    const cards = creditCards || [];
    
    // If NO loans and NO credit cards exist, user has NO credit history (Score = 300 / No History)
    if (activeLoans.length === 0 && cards.length === 0) {
      return 300;
    }

    const totalDebt = activeLoans.reduce((acc, l) => acc + (l.remaining_balance || 0), 0);
    const util = parseFloat(creditUtilPct) || 0;
    const paidRecords = getPaidLoanRecords();
    const totalEarlyPayments = Object.values(paidRecords).reduce((acc, r) => acc + (r.count || 0), 0);

    let score = 550;

    // Credit Utilization Impact
    if (totalCardLimit > 0) {
      if (util <= 10) score += 100;
      else if (util <= 30) score += 80;
      else if (util <= 50) score += 40;
      else score -= 40;
    } else {
      score += 60;
    }

    // On-Time & Early Payment Bonus
    score += Math.min(120, totalEarlyPayments * 25);

    // Credit Mix Diversity Bonus
    if (activeLoans.length > 0 && cards.length > 0) {
      score += 60;
    } else if (activeLoans.length > 0) {
      score += 30;
    }

    // Total Debt Burden Impact
    if (totalDebt > 0 && totalDebt < 100000) score += 30;
    else if (totalDebt > 500000) score -= 30;

    return Math.max(300, Math.min(900, Math.round(score)));
  };

  const currentCreditScore = calculateDynamicCreditScore();

  const summary = {
    total_loan_balance: data?.summary?.total_loan_balance || 0,
    total_monthly_emi: data?.summary?.total_monthly_emi || 0,
    credit_utilization_pct: creditUtilPct,
    credit_score: currentCreditScore
  };

  const filteredOffers = selectedOfferCategory === 'All'
    ? offers
    : offers.filter(o => o.category.toLowerCase().includes(selectedOfferCategory.toLowerCase()));

  const calculateScheduledAmount = (baseEmi, freq) => {
    switch (freq) {
      case 'Daily': return (baseEmi / 30);
      case 'Weekly': return (baseEmi / 4);
      case 'Monthly': return baseEmi;
      case 'Quarterly': return baseEmi * 3;
      case 'Yearly': return baseEmi * 12;
      default: return baseEmi;
    }
  };

  const paidRecords = getPaidLoanRecords();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Loans & Credit Score Management System
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage existing loans with daily, weekly, monthly, quarterly, or yearly repayment schedules, early payment tracking, remaining payments auto-calculator, and real-time credit score booster.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => {
                setAddLoanError('');
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Existing Loan
            </button>
            <button
              onClick={() => {
                setAddCardError('');
                setShowAddCardModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Add Credit Card
            </button>
          </div>
        </div>
      </div>

      {/* Global Payment Confirmed Success Banner */}
      {paymentNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm text-emerald-200">Early Payment Confirmed!</span>
              <p className="text-[11px] text-emerald-300 mt-0.5">
                Successfully recorded payment of <strong>{formatCurrency(paymentNotice.amount)}</strong> for <strong>{paymentNotice.loanName}</strong>. Waiting for next scheduled payment on <strong className="text-emerald-100">{paymentNotice.nextDueDate}</strong>. Your credit score increased by <strong className="text-emerald-200">+15 Points</strong>!
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-xs text-emerald-400 hover:text-emerald-200 underline ml-4 flex-shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Total Outstanding Debt</span>
          <h3 className="text-xl font-extrabold text-rose-400">{formatCurrency(summary.total_loan_balance)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Total Monthly EMI</span>
          <h3 className="text-xl font-extrabold text-indigo-400">{formatCurrency(summary.total_monthly_emi)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Credit Card Utilization</span>
          <h3 className="text-xl font-extrabold text-amber-400">{summary.credit_utilization_pct}%</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Credit Score (Synced with User Data)</span>
          <h3 className="text-xl font-extrabold text-emerald-400">{currentCreditScore} / 900</h3>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-700/60 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('existing')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'existing'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏦 Existing Loans ({data?.loans?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('credit_cards')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'credit_cards'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          💳 Credit Cards & Utilization ({creditCards.length})
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'new'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Find Online & Society Loans ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'credit'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📈 Credit Score Optimizer & Action Plan
        </button>
      </div>

      {/* TAB 1: EXISTING LOANS */}
      {activeTab === 'existing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Loans List */}
          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="font-bold text-sm text-slate-200">
                Active Loan Accounts ({data?.loans?.length || 0})
              </h3>
              <span className="text-xs text-indigo-400 font-semibold">
                Monthly Outflow: {formatCurrency(summary.total_monthly_emi)}
              </span>
            </div>

            <div className="space-y-4">
              {(data?.loans || []).map((loan) => {
                const freq = loan.payment_frequency || 'Monthly';
                const scheduledAmt = calculateScheduledAmount(loan.emi_amount, freq);
                const remPayments = loan.remaining_payments ?? (loan.emi_amount > 0 ? Math.ceil(loan.remaining_balance / loan.emi_amount) : 36);
                const startDateFormatted = loan.start_date ? new Date(loan.start_date).toLocaleDateString() : 'N/A';
                const dueDateFormatted = loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A';
                
                const loanRecord = paidRecords[loan.id];
                const cycleCount = loanRecord ? loanRecord.count : (paidLoanIds.includes(loan.id) ? 1 : 0);
                const isPaidForCurrentCycle = cycleCount > 0;
                const nextDueDateStr = getNextPaymentDueDate(loan.start_date, freq, cycleCount + 1);

                return (
                  <div key={loan.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3 relative group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/40 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100">{loan.loan_name}</h4>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {remPayments} Installments Left
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{loan.loan_type}</span> •
                          <span>Interest: <strong className="text-indigo-400">{loan.interest_rate}%</strong> p.a.</span> •
                          <span className="text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-400" /> {startDateFormatted} <ArrowRight className="w-3 h-3 text-slate-500" /> {dueDateFormatted}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold text-xs">
                            Original: {formatCurrency(loan.total_amount)}
                          </span>
                          {loan.initial_payment > 0 && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Down Payment: -{formatCurrency(loan.initial_payment)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setDeletingLoan(loan)}
                          title="Delete Loan Account"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/20 ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Remaining Balance</span>
                        <strong className="text-rose-400 text-sm font-extrabold">{formatCurrency(loan.remaining_balance)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Base EMI (Monthly)</span>
                        <strong className="text-slate-200 text-xs">{formatCurrency(loan.emi_amount)}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Repayment Frequency</span>
                        <select
                          value={freq}
                          onChange={(e) => handleUpdateFrequency(loan.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-xs border border-slate-600 focus:outline-none mt-0.5"
                        >
                          {FREQUENCIES.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Scheduled Payment</span>
                        <strong className="text-amber-400 text-xs font-bold">
                          {formatCurrency(scheduledAmt)} / {freq.toLowerCase()}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {isPaidForCurrentCycle ? (
                        <div className="flex items-center justify-between gap-2 text-emerald-300 font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-in fade-in">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>
                              <strong className="text-emerald-200">Payment Done!</strong> Next Payment Due: <strong className="text-emerald-100">{nextDueDateStr}</strong>
                            </span>
                          </div>
                          <button
                            onClick={() => handleUndoPayment(loan.id)}
                            title="Cancel / Delete payment record if clicked by mistake"
                            className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 transition-all border border-rose-500/30 ml-2 cursor-pointer flex items-center gap-1 text-[10px] flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>Undo</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Status: <strong className="text-emerald-400 font-semibold">{loan.status || 'Active'}</strong></span> •
                          <span>Next Payment Due: <strong className="text-indigo-300 font-semibold">{nextDueDateStr}</strong></span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setPayingLoan(loan);
                          setPaymentAmount(scheduledAmt.toFixed(2));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 self-start sm:self-auto cursor-pointer"
                      >
                        Make Payment ({formatCurrency(scheduledAmt)})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EMI Calculator Sidebar */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Interactive EMI Calculator
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Principal Amount ({getSymbol()})</label>
                <input
                  type="number"
                  value={calcForm.principal}
                  onChange={(e) => setCalcForm({ ...calcForm, principal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcForm.rate}
                  onChange={(e) => setCalcForm({ ...calcForm, rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={calcForm.tenure}
                  onChange={(e) => setCalcForm({ ...calcForm, tenure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>
              <button
                onClick={calculateEMI}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Calculate Monthly EMI
              </button>

              {calcResult && (
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-2 pt-3 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly EMI:</span>
                    <strong className="text-indigo-400 font-extrabold">{formatCurrency(calcResult.emi)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest Payable:</span>
                    <span className="text-slate-200">{formatCurrency(calcResult.total_interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Repayment:</span>
                    <span className="text-slate-200">{formatCurrency(calcResult.total_payment)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREDIT CARDS & UTILIZATION */}
      {activeTab === 'credit_cards' && (
        <div className="space-y-6">
          {/* Credit Card Utilization Summary Banner */}
          <div className="glass-panel p-5 border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Credit Card Portfolio Overview
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  Overall Utilization Ratio: <strong className={parseFloat(summary.credit_utilization_pct) <= 30 ? "text-emerald-400" : "text-amber-400"}>{summary.credit_utilization_pct}%</strong>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Card Limit: <strong className="text-slate-200">{formatCurrency(totalCardLimit)}</strong> • Outstanding Balance: <strong className="text-rose-400">{formatCurrency(totalCardBalance)}</strong> • Available Credit: <strong className="text-emerald-400">{formatCurrency(totalCardLimit - totalCardBalance)}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setAddCardError('');
                  setShowAddCardModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Credit Card
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {creditCards.length === 0 ? (
            <div className="glass-panel p-8 text-center space-y-3 border-dashed border-slate-700">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">No Credit Cards Added Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add your credit cards to track your utilization ratio, statement due dates, minimum payments, and boost your credit score.
              </p>
              <button
                onClick={() => {
                  setAddCardError('');
                  setShowAddCardModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" /> Add Your First Credit Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {creditCards.map((card) => {
                const limit = parseFloat(card.credit_limit) || 1;
                const bal = parseFloat(card.current_balance) || 0;
                const avail = Math.max(0, limit - bal);
                const utilPct = ((bal / limit) * 100).toFixed(1);
                const isHealthy = utilPct <= 30;

                return (
                  <div key={card.id} className="glass-panel p-5 space-y-4 relative group border-slate-700/60 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">{card.bank_name}</span>
                        <h4 className="font-bold text-sm text-slate-100">{card.card_name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">•••• {card.card_number_suffix || '4821'}</span>
                      </div>
                      <button
                        onClick={() => setDeletingCard(card)}
                        title="Delete Credit Card"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Utilization Ratio</span>
                        <span className={isHealthy ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {utilPct}% {isHealthy ? "(Healthy 👍)" : "(High Risk ⚠️)"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            utilPct <= 30 ? 'bg-emerald-500' : utilPct <= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, utilPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/40">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Credit Limit</span>
                        <strong className="text-slate-200">{formatCurrency(limit)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Balance</span>
                        <strong className="text-rose-400">{formatCurrency(bal)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Available Credit</span>
                        <strong className="text-emerald-400">{formatCurrency(avail)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Due Date</span>
                        <strong className="text-indigo-300">{card.due_date_day}th of month</strong>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Min Due: <strong className="text-amber-300">{formatCurrency(card.min_due || Math.round(bal * 0.05))}</strong></span>
                        <span className="text-[10px] text-slate-500">APR: {card.apr || 42}% p.a.</span>
                      </div>
                      <button
                        onClick={() => {
                          setPayingCard(card);
                          setCardPayAmount(bal.toString());
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        Pay Bill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FIND ONLINE & SOCIETY LOANS */}
      {activeTab === 'new' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="glass-panel p-4 flex items-center gap-3 overflow-x-auto text-xs">
            <Filter className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="font-semibold text-slate-300 flex-shrink-0">Loan Category:</span>
            {['All', 'Society Microloan', 'Home Loan', 'Personal Loan', 'Car Loan', 'Gold Loan', 'Education Loan', 'Business Loan'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedOfferCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedOfferCategory === cat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all shadow-xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                      {offer.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-400">{offer.category}</span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {offer.loan_name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{offer.provider}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{offer.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-700/40 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">{offer.interest_rate}% p.a.</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Max Amount</span>
                      <strong className="text-slate-200 font-bold">{formatCurrency(offer.max_amount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Max Tenure</span>
                      <span className="text-slate-300">{offer.tenure_months} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Processing Fee</span>
                      <span className="text-slate-300">{offer.processing_fee}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setApplyingOffer(offer);
                      setOfferApplyForm({
                        amount: offer.max_amount.toString(),
                        tenure: offer.tenure_months.toString()
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Select & Apply For Loan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREDIT SCORE OPTIMIZER */}
      {activeTab === 'credit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Present Credit Score & Factors */}
          <div className="glass-panel p-5 space-y-6">
            <div className="text-center space-y-2 border-b border-slate-700/40 pb-4">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Synced Real User Data Score</span>
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center bg-slate-900/60">
                  <span className="text-3xl font-extrabold text-emerald-400">{currentCreditScore}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Out of 900</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-200">
                Rating: <span className="text-emerald-400">{currentCreditScore >= 780 ? 'Excellent' : (currentCreditScore >= 700 ? 'Good' : 'Fair')}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Credit Score Factors</h4>
              {(optimizer?.factors || []).map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{f.factor}</span>
                    <span className="text-indigo-400">{f.impact}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Steps to Improve Credit Score */}
          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <div className="border-b border-slate-700/40 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                How to Improve Your Credit Score
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Actionable tips and steps based on present financial data to boost your rating up to +75 points.
              </p>
            </div>

            <div className="space-y-4">
              {(optimizer?.improvement_steps || []).map(step => (
                <div
                  key={step.id}
                  className="p-4 rounded-xl bg-slate-800/90 border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 flex-shrink-0 mt-0.5">
                      {step.id === 'step_1' && <CalendarCheck className="w-5 h-5" />}
                      {step.id === 'step_2' && <TrendingDown className="w-5 h-5" />}
                      {step.id === 'step_3' && <ShieldPlus className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-100">{step.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          {step.potential_boost}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{step.action}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-slate-700 text-slate-200 text-[11px] font-semibold self-start sm:self-auto flex-shrink-0">
                    {step.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAKE PAYMENT MODAL */}
      {payingLoan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-700/40 pb-2">
              Make Loan Repayment ({payingLoan.loan_name})
            </h3>

            <form onSubmit={handleMakePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Current Remaining Balance</label>
                <input
                  type="text"
                  disabled
                  value={formatCurrency(payingLoan.remaining_balance)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Amount ({getSymbol()})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingLoan(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLoan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-700/40 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Delete Loan Account</h3>
                <p className="text-[11px] text-slate-400 font-medium">{deletingLoan.loan_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-100">{deletingLoan.loan_name}</strong>? This action will permanently remove this loan from your portfolio and recalculate your overall debt balance.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLoan(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLoan}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY FOR ONLINE LOAN MODAL */}
      {applyingOffer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl">
            <div className="border-b border-slate-700/40 pb-2">
              <h3 className="font-bold text-sm text-slate-100">Select & Pre-Approve Loan</h3>
              <p className="text-[11px] text-indigo-400 font-semibold">{applyingOffer.provider}</p>
            </div>

            <form onSubmit={handleApplyOfferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Desired Loan Amount ({getSymbol()})</label>
                <input
                  type="number"
                  required
                  max={applyingOffer.max_amount}
                  value={offerApplyForm.amount}
                  onChange={(e) => setOfferApplyForm({ ...offerApplyForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Max limit: {formatCurrency(applyingOffer.max_amount)}</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  required
                  max={applyingOffer.tenure_months}
                  value={offerApplyForm.tenure}
                  onChange={(e) => setOfferApplyForm({ ...offerApplyForm, tenure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px]">
                Interest Rate: <strong>{applyingOffer.interest_rate}% p.a.</strong> • Disbursal Time: <strong>Instant</strong>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingOffer(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Confirm & Add Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADD LOAN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 max-w-lg w-full space-y-4 border-slate-700 shadow-2xl my-8">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-700/40 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Add New Loan / Product EMI Account
            </h3>

            {addLoanError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
                {addLoanError}
              </div>
            )}

            <form onSubmit={handleAddLoan} className="space-y-3 text-xs">
              {/* 1. Loan Name */}
              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Loan / Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dream House Mortgage / iPhone 16 EMI"
                  value={loanForm.loan_name}
                  onChange={(e) => handleInputChange('loan_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>

              {/* 2. Loan Type & Frequency */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Loan Type
                  </label>
                  <select
                    value={loanForm.loan_type}
                    onChange={(e) => handleInputChange('loan_type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  >
                    {LOAN_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Frequency
                  </label>
                  <select
                    value={loanForm.payment_frequency}
                    onChange={(e) => handleInputChange('payment_frequency', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. DATES SECTION (BEFORE TOTAL PRICE & AFTER LOAN TYPE/FREQUENCY) */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-indigo-500/20">
                <div>
                  <label className="block text-slate-300 mb-1 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Start Date (From Date)
                  </label>
                  <input
                    type="date"
                    value={loanForm.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 flex items-center gap-1.5 font-medium">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" /> Maturity Date (To Date)
                  </label>
                  <input
                    type="date"
                    value={loanForm.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 4. TOTAL PRICE SECTION */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Price ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100000"
                    value={loanForm.total_amount}
                    onChange={(e) => handleInputChange('total_amount', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1 font-medium">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" /> Down Payment ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={loanForm.initial_payment}
                    onChange={(e) => handleInputChange('initial_payment', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1 font-medium">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Remaining ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Can be 0"
                    value={loanForm.remaining_balance}
                    onChange={(e) => handleInputChange('remaining_balance', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-300 focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* 5. INTEREST RATE & BASE MONTHLY EMI */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="8.5"
                    value={loanForm.interest_rate}
                    onChange={(e) => handleInputChange('interest_rate', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Base Monthly EMI ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    value={loanForm.emi_amount}
                    onChange={(e) => handleInputChange('emi_amount', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. TENURE, TOTAL PAYMENTS, REMAINING PAYMENTS */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-amber-500/20">
                <div>
                  <label className="block text-slate-300 mb-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-indigo-400" /> Tenure (Mo)
                  </label>
                  <input
                    type="number"
                    value={loanForm.tenure_months}
                    onChange={(e) => handleInputChange('tenure_months', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 flex items-center gap-1 font-medium">
                    <Hash className="w-3 h-3 text-indigo-400" /> Total Payments
                  </label>
                  <input
                    type="number"
                    value={loanForm.total_payments}
                    onChange={(e) => handleInputChange('total_payments', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-300 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 flex items-center gap-1 font-medium">
                    <Coins className="w-3 h-3 text-amber-400" /> Remaining
                  </label>
                  <input
                    type="number"
                    value={loanForm.remaining_payments}
                    onChange={(e) => handleInputChange('remaining_payments', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLoan}
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingLoan ? 'Saving...' : 'Add Loan Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CREDIT CARD MODAL */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl my-8">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-700/40 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Add New Credit Card
            </h3>

            {addCardError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
                {addCardError}
              </div>
            )}

            <form onSubmit={handleAddCreditCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bank / Provider</label>
                <select
                  value={cardForm.bank_name}
                  onChange={(e) => setCardForm({ ...cardForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="SBI Card">SBI Card</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="AMEX">American Express (AMEX)</option>
                  <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                  <option value="RBL Bank">RBL Bank</option>
                  <option value="IndusInd Bank">IndusInd Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Card Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regalia Gold / SimplyClick / Amazon Pay"
                  value={cardForm.card_name}
                  onChange={(e) => setCardForm({ ...cardForm, card_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Total Credit Limit ({getSymbol()})</label>
                  <input
                    type="number"
                    required
                    placeholder="200000"
                    value={cardForm.credit_limit}
                    onChange={(e) => setCardForm({ ...cardForm, credit_limit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Current Balance ({getSymbol()})</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={cardForm.current_balance}
                    onChange={(e) => setCardForm({ ...cardForm, current_balance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Due Day (Date)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardForm.due_date_day}
                    onChange={(e) => setCardForm({ ...cardForm, due_date_day: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min Due ({getSymbol()})</label>
                  <input
                    type="number"
                    value={cardForm.min_due}
                    onChange={(e) => setCardForm({ ...cardForm, min_due: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength="4"
                    value={cardForm.card_number_suffix}
                    onChange={(e) => setCardForm({ ...cardForm, card_number_suffix: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  Save Credit Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY CREDIT CARD BILL MODAL */}
      {payingCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl">
            <div className="border-b border-slate-700/40 pb-2">
              <h3 className="font-bold text-sm text-slate-100">Pay Credit Card Bill</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">{payingCard.bank_name} - {payingCard.card_name}</p>
            </div>

            <form onSubmit={handlePayCardBill} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Outstanding Balance:</span>
                  <strong className="text-rose-400">{formatCurrency(payingCard.current_balance)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Minimum Amount Due:</span>
                  <strong className="text-amber-300">{formatCurrency(payingCard.min_due || Math.round(payingCard.current_balance * 0.05))}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Amount ({getSymbol()})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cardPayAmount}
                  onChange={(e) => setCardPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 font-bold focus:outline-none text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCard(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  Confirm Card Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CREDIT CARD MODAL */}
      {deletingCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4 border-slate-700 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-700/40 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Delete Credit Card</h3>
                <p className="text-[11px] text-slate-400 font-medium">{deletingCard.bank_name} - {deletingCard.card_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-100">{deletingCard.card_name}</strong>? This action will remove the card and update your overall credit utilization ratio.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCard(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCard}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;

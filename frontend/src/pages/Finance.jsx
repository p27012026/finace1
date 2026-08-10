import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Plus, Trash2, Tag, Target, PieChart, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const AZ_CATEGORIES = [
  'Food', 'Groceries', 'Restaurants', 'Shopping', 'Rent', 'Electricity', 'Water',
  'Internet', 'Mobile Recharge', 'Fuel', 'Public Transport', 'Vehicle Maintenance',
  'Medical', 'Insurance', 'Education', 'Entertainment', 'Travel', 'Taxes',
  'Charity', 'Pets', 'Children', 'Business Expenses', 'Subscriptions', 'Investments', 'Miscellaneous'
];

const INCOME_SOURCES = ['Salary', 'Business Income', 'Freelancing', 'Rental Income', 'Interest Income', 'Other Income'];

const Finance = () => {
  const { formatCurrency, getSymbol } = useCurrency();
  const [activeTab, setActiveTab] = useState('expenses');
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  // Form states
  const [incForm, setIncForm] = useState({ title: '', source: 'Salary', amount: '', frequency: 'Monthly' });
  const [expForm, setExpForm] = useState({ title: '', category: 'Food', amount: '', customCategory: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'Groceries', limit_amount: '', period: 'Monthly' });
  const [goalForm, setGoalForm] = useState({ title: 'Buy House', target_amount: '', current_amount: '', priority: 'Medium' });

  useEffect(() => {
    fetchAllData();
    window.addEventListener('finance-data-updated', fetchAllData);
    return () => window.removeEventListener('finance-data-updated', fetchAllData);
  }, []);

  const fetchAllData = async () => {
    try {
      const [incRes, expRes, budRes, goalRes] = await Promise.all([
        axios.get('/api/finance/income'),
        axios.get('/api/finance/expense'),
        axios.get('/api/finance/budget'),
        axios.get('/api/finance/goal')
      ]);
      setIncomes(incRes.data);
      setExpenses(expRes.data);
      setBudgets(budRes.data);
      setGoals(goalRes.data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/income', { ...incForm, amount: parseFloat(incForm.amount) });
      setIncForm({ title: '', source: 'Salary', amount: '', frequency: 'Monthly' });
      fetchAllData();
    } catch (err) {
      console.error('Add income error:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const finalCategory = expForm.category === 'Custom' ? expForm.customCategory : expForm.category;
    try {
      await axios.post('/api/finance/expense', { ...expForm, category: finalCategory, amount: parseFloat(expForm.amount) });
      setExpForm({ title: '', category: 'Food', amount: '', customCategory: '' });
      fetchAllData();
    } catch (err) {
      console.error('Add expense error:', err);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/budget', { ...budgetForm, limit_amount: parseFloat(budgetForm.limit_amount) });
      setBudgetForm({ category: 'Groceries', limit_amount: '', period: 'Monthly' });
      fetchAllData();
    } catch (err) {
      console.error('Add budget error:', err);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/goal', {
        ...goalForm,
        target_amount: parseFloat(goalForm.target_amount),
        current_amount: parseFloat(goalForm.current_amount || 0)
      });
      setGoalForm({ title: 'Buy House', target_amount: '', current_amount: '', priority: 'Medium' });
      fetchAllData();
    } catch (err) {
      console.error('Add goal error:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    await axios.delete(`/api/finance/expense/${id}`);
    fetchAllData();
  };

  const handleDeleteIncome = async (id) => {
    await axios.delete(`/api/finance/income/${id}`);
    fetchAllData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Module Header & Tabs */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" />
            Finance Management (Core Module)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track income sources, A-Z expenditures, budget warnings, and savings goals.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 text-xs font-semibold">
          {['expenses', 'income', 'budgets', 'goals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: EXPENSES (A-Z Categories) */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Expense Form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-700/40 pb-3">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Expense Transaction
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Groceries"
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category (A-Z Support)</label>
                <select
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {AZ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">+ Add Custom Category</option>
                </select>
              </div>

              {expForm.category === 'Custom' && (
                <div>
                  <label className="block text-slate-400 mb-1">Custom Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Collectibles"
                    value={expForm.customCategory}
                    onChange={(e) => setExpForm({ ...expForm, customCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Amount ({getSymbol()})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
              >
                Log Expense
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="font-bold text-sm text-slate-200">Recent Expenditure Log ({expenses.length})</h3>
              <span className="text-xs text-indigo-400 font-semibold">
                Total: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{exp.title}</h4>
                      <p className="text-[10px] text-slate-400">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-rose-400">-{formatCurrency(exp.amount)}</span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME */}
      {activeTab === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Add Income Source</h3>
            <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Income Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Tech Salary"
                  value={incForm.title}
                  onChange={(e) => setIncForm({ ...incForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Income Source</label>
                <select
                  value={incForm.source}
                  onChange={(e) => setIncForm({ ...incForm, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Monthly Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={incForm.amount}
                  onChange={(e) => setIncForm({ ...incForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
              >
                Add Income
              </button>
            </form>
          </div>

          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="font-bold text-sm text-slate-200">Income Streams ({incomes.length})</h3>
              <span className="text-xs text-emerald-400 font-semibold">
                Total: {formatCurrency(incomes.reduce((sum, i) => sum + i.amount, 0))}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {incomes.map((inc) => (
                <div key={inc.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{inc.title}</h4>
                      <p className="text-[10px] text-slate-400">{inc.source} • {inc.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-emerald-400">+{formatCurrency(inc.amount)}</span>
                    <button
                      onClick={() => handleDeleteIncome(inc.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGETS */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Set Category Budget</h3>
            <form onSubmit={handleAddBudget} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Category</label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {AZ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Budget Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={budgetForm.limit_amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, limit_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Save Budget
              </button>
            </form>
          </div>

          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">
              Budget Performance vs Actual Spending
            </h3>
            <div className="space-y-3">
              {budgets.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{b.category}</span>
                    <div className="flex items-center gap-2">
                      {b.overspent ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Overspent Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Within Budget
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Spent: {formatCurrency(b.actual_spent || 0)}</span>
                    <span>Limit: {formatCurrency(b.limit_amount || 0)}</span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.overspent ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (b.actual_spent / b.limit_amount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAVINGS GOALS */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Create Savings Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Goal Name</label>
                <select
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['Buy House', 'Buy Car', 'Vacation', 'Emergency Fund', 'Retirement', 'Education', 'Business Startup'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Amount ({getSymbol()})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000.00"
                  value={goalForm.target_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Saved ({getSymbol()})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={goalForm.current_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, current_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all"
              >
                Create Goal
              </button>
            </form>
          </div>

          <div className="glass-panel p-5 lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Active Goals Calculator</h3>
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      {g.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                      {g.progress_pct}% Completed
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${g.progress_pct}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-slate-400">
                    <div>
                      <span>Saved: </span>
                      <strong className="text-slate-200">{formatCurrency(g.current_amount || 0)}</strong>
                    </div>
                    <div>
                      <span>Target: </span>
                      <strong className="text-slate-200">{formatCurrency(g.target_amount || 0)}</strong>
                    </div>
                    <div>
                      <span>Req. Monthly: </span>
                      <strong className="text-emerald-400">{formatCurrency(g.required_monthly_savings || 0)}/mo</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;

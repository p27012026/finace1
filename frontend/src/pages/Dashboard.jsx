import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GaugeChart from '../components/common/GaugeChart';
import { useCurrency } from '../context/CurrencyContext';
import {
  Wallet, TrendingUp, CreditCard, ShieldAlert, Sparkles,
  ArrowUpRight, ArrowDownRight, Target, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('finance-data-updated', fetchDashboardData);
    return () => window.removeEventListener('finance-data-updated', fetchDashboardData);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard/widgets');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard widgets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const health = data?.financial_health_score || { score: 82, rating: 'Good' };
  const netWorth = data?.net_worth || { total_assets: 70000, total_liabilities: 17000, net_worth: 53000 };
  const cashFlow = data?.cash_flow || { monthly_income: 9550, monthly_expenses: 3945, net_cash_flow: 5605 };
  const emergency = data?.emergency_fund_status || { current_balance: 15000, target_balance: 11835, coverage_months: 3.8 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Overview Bar: Health Score & Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Widget 1: Financial Health Score Gauge */}
        <div className="glass-panel p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-3 left-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Financial Health Score
          </div>
          <div className="mt-3">
            <GaugeChart score={health.score} rating={health.rating} />
          </div>
        </div>

        {/* Widget 2: Net Worth */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Worth</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-100">{formatCurrency(netWorth.net_worth)}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{data?.monthly_growth_pct}% MoM Growth
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/40 flex justify-between">
            <span>Assets: {formatCurrency(netWorth.total_assets)}</span>
            <span>Liabilities: {formatCurrency(netWorth.total_liabilities)}</span>
          </div>
        </div>

        {/* Widget 3: Cash Flow */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Monthly Cash Flow</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-100">{formatCurrency(cashFlow.net_cash_flow)}</h3>
            <p className="text-xs text-indigo-400 mt-1 font-medium">
              Savings Rate: {cashFlow.savings_rate_pct}% of Income
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/40 flex justify-between">
            <span>Income: {formatCurrency(cashFlow.monthly_income)}</span>
            <span>Spent: {formatCurrency(cashFlow.monthly_expenses)}</span>
          </div>
        </div>

        {/* Widget 4: Debt-to-Income & Credit Score */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Debt & Credit Profile</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Debt-to-Income</span>
              <h4 className="text-xl font-bold text-slate-100">{data?.dti_ratio_pct}%</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Credit Score</span>
              <h4 className={`text-xl font-bold ${data?.credit_score === 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data?.credit_score === 300 ? '300 (No History)' : data?.credit_score}
              </h4>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/40 flex justify-between">
            <span>Upcoming EMI: {formatCurrency(data?.upcoming_emi || 0)}</span>
            <span className="text-emerald-400 font-medium">Optimal DTI &lt; 30%</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Emergency Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Expense Distribution */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">Expense Category Distribution</h3>
            <span className="text-xs text-slate-400">A-Z Categories</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.expense_chart_data || []}>
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Asset Allocation Pie Chart */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">Asset Allocation</h3>
            <span className="text-xs text-indigo-400 font-semibold">{formatCurrency(data?.total_investments || 0)}</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.investment_chart_data || []}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={40}
                >
                  {(data?.investment_chart_data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(data?.investment_chart_data || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span>{item.type}: {formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Fund, Goals & AI Suggestions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Reserve & Reminders */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Emergency Reserve & Reminders
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Emergency Fund</span>
                <span className="text-emerald-400">{emergency.coverage_months} Months Cover</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Current: {formatCurrency(emergency.current_balance)} / Target: {formatCurrency(emergency.target_balance)}
              </p>
            </div>

            {/* Upcoming EMI & Insurance Alerts */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-xs">Upcoming Loan EMI</h5>
                <p className="text-[11px] text-amber-200/80">Monthly EMI of {formatCurrency(data?.upcoming_emi || 0)} due in 12 days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goals Progress */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Active Savings Goals
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            {(data?.goals_progress || []).slice(0, 3).map((g) => (
              <div key={g.id} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>{g.title}</span>
                  <span className="text-indigo-400">{g.progress_pct}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${g.progress_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick AI Suggestions */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Strategic Insights
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {(data?.ai_insights || []).map((insight, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-800/60 border border-indigo-500/20 text-slate-300 flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <p className="leading-snug">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

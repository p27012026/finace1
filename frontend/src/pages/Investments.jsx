import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Plus, Trash2, Shield, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const Investments = () => {
  const [data, setData] = useState(null);
  const { formatCurrency, getSymbol } = useCurrency();
  const [form, setForm] = useState({
    asset_name: '',
    asset_type: 'Stocks',
    amount_invested: '',
    current_value: '',
    risk_level: 'Moderate'
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const res = await axios.get('/api/investments');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load investments:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/investments', {
        ...form,
        amount_invested: parseFloat(form.amount_invested),
        current_value: parseFloat(form.current_value)
      });
      setForm({ asset_name: '', asset_type: 'Stocks', amount_invested: '', current_value: '', risk_level: 'Moderate' });
      fetchInvestments();
    } catch (err) {
      console.error('Add investment error:', err);
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/investments/${id}`);
    fetchInvestments();
  };

  const pnl = data?.portfolio_summary || { amount_invested: 0, current_value: 0, pnl: 0, pnl_pct: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Investment Portfolio & Asset Allocation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Track Stocks, Mutual Funds, ETFs, and Bonds with real-time P&L analytics and Gemini AI diversification guidance.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Total Capital Invested</span>
          <h3 className="text-xl font-extrabold text-slate-100">{formatCurrency(pnl.amount_invested)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Current Value</span>
          <h3 className="text-xl font-extrabold text-indigo-400">{formatCurrency(pnl.current_value)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Profit & Loss (P&L)</span>
          <h3 className={`text-xl font-extrabold ${pnl.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pnl.pnl >= 0 ? '+' : ''}{formatCurrency(pnl.pnl)} ({pnl.pnl_pct}%)
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Add Asset</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vanguard S&P 500 ETF"
                value={form.asset_name}
                onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Asset Class</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              >
                {['Stocks', 'Mutual Funds', 'ETFs', 'Bonds'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Amount Invested ({getSymbol()})</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount_invested}
                onChange={(e) => setForm({ ...form, amount_invested: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Current Valuation ({getSymbol()})</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Add to Portfolio
            </button>
          </form>
        </div>

        {/* Portfolio List & AI Advice */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">
            Holdings & AI Diversification Strategy
          </h3>

          <div className="space-y-3">
            {(data?.investments || []).map((inv) => {
              const itemPnl = inv.current_value - inv.amount_invested;
              return (
                <div key={inv.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200">{inv.asset_name}</h4>
                    <p className="text-[10px] text-slate-400">{inv.asset_type} • Risk: {inv.risk_level}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-bold text-slate-200">{formatCurrency(inv.current_value)}</span>
                      <p className={`text-[10px] ${itemPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {itemPnl >= 0 ? '+' : ''}{formatCurrency(itemPnl)}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(inv.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Recommendations */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-indigo-500/30 space-y-2 mt-4 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Investment Insights
            </h4>
            {(data?.ai_recommendations || []).map((rec, idx) => (
              <p key={idx} className="text-slate-300">• {rec}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;

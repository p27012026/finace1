import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Trash2, Calendar, User, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const HealthSecurity = () => {
  const [data, setData] = useState(null);
  const { formatCurrency, getSymbol } = useCurrency();
  const [form, setForm] = useState({
    policy_name: '',
    policy_type: 'Health Insurance',
    coverage_amount: '',
    premium_amount: '',
    renewal_date: '',
    nominee: '',
    policy_number: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get('/api/health-security');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load insurance policies:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/health-security', {
        ...form,
        coverage_amount: parseFloat(form.coverage_amount),
        premium_amount: parseFloat(form.premium_amount),
        renewal_date: new Date(form.renewal_date).toISOString()
      });
      setForm({ policy_name: '', policy_type: 'Health Insurance', coverage_amount: '', premium_amount: '', renewal_date: '', nominee: '', policy_number: '' });
      fetchPolicies();
    } catch (err) {
      console.error('Add insurance error:', err);
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/health-security/${id}`);
    fetchPolicies();
  };

  const summary = data?.summary || { total_coverage: 0, total_annual_premiums: 0, active_policies: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Health Security Module (Insurance Protection)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage Health, Term, and Life Insurance policies with renewal alerts, nominee details, and Gemini AI insurance recommendations.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Total Insurance Coverage</span>
          <h3 className="text-xl font-extrabold text-emerald-400">{formatCurrency(summary.total_coverage)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Annual Premiums Outflow</span>
          <h3 className="text-xl font-extrabold text-indigo-400">{formatCurrency(summary.total_annual_premiums)}</h3>
        </div>
        <div className="glass-panel p-4">
          <span className="text-xs text-slate-400">Active Policies</span>
          <h3 className="text-xl font-extrabold text-slate-100">{summary.active_policies} Policies</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Add Policy</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Policy Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Health Guard Supreme"
                value={form.policy_name}
                onChange={(e) => setForm({ ...form, policy_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Insurance Type</label>
              <select
                value={form.policy_type}
                onChange={(e) => setForm({ ...form, policy_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              >
                {['Health Insurance', 'Term Insurance', 'Life Insurance'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Coverage Amount ({getSymbol()})</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.coverage_amount}
                onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Annual Premium ({getSymbol()})</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.premium_amount}
                onChange={(e) => setForm({ ...form, premium_amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Renewal Date</label>
              <input
                type="date"
                required
                value={form.renewal_date}
                onChange={(e) => setForm({ ...form, renewal_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nominee & Policy No.</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nominee"
                  value={form.nominee}
                  onChange={(e) => setForm({ ...form, nominee: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Policy #"
                  value={form.policy_number}
                  onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
            >
              Add Insurance Policy
            </button>
          </form>
        </div>

        {/* Policies List & AI Guidance */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Active Policies</h3>
          <div className="space-y-3">
            {(data?.policies || []).map((pol) => (
              <div key={pol.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-200">{pol.policy_name}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      {pol.policy_type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Coverage: {formatCurrency(pol.coverage_amount)} • Premium: {formatCurrency(pol.premium_amount)}/yr • Policy: #{pol.policy_number || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-amber-300 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" /> Renewal: {new Date(pol.renewal_date).toLocaleDateString()}
                    </span>
                    <p className="text-[10px] text-slate-400">Nominee: {pol.nominee || 'N/A'}</p>
                  </div>
                  <button onClick={() => handleDelete(pol.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/30 space-y-2 mt-4 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Health Security Recommendations
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

export default HealthSecurity;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Wrench, Hammer, Clock, Sparkles, Bot, Shield, ArrowRight, Construction } from 'lucide-react';

const Investments = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Investment Portfolio & Wealth Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time Stock Market Feeds, Mutual Funds, ETFs, and Automated AI Rebalancing Engine.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2 shrink-0">
            <Hammer className="w-4 h-4 animate-bounce text-amber-400" />
            <span>Status: Under Active Construction 🚧</span>
          </div>
        </div>
      </div>

      {/* Main Full-Page Still Building Hero Screen */}
      <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden space-y-8 border-amber-500/30">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

        {/* Central Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-indigo-600/30 to-purple-600/20 border border-amber-500/40 flex items-center justify-center shadow-2xl">
            <Construction className="w-12 h-12 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-400">
            <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Hero Title & Subtext */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Feature Coming Soon in Next Platform Upgrade</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Investments Module is <span className="text-amber-400 underline decoration-amber-500/40">Still Building</span> 🚧
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Our engineering team is actively building live stock market integration (NSE & BSE), automated Mutual Fund NAV sync, SIP wealth calculators, and AI-driven portfolio risk rebalancing.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-2 text-xs">
          <div className="flex justify-between font-semibold">
            <span className="text-slate-400">Development Progress</span>
            <span className="text-amber-400">75% Completed</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700 p-0.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 w-[75%] animate-pulse"></div>
          </div>
        </div>

        {/* Upcoming Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left pt-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="p-2 w-fit rounded-xl bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-200">Live Stock Feeds</h4>
            <p className="text-[11px] text-slate-400">Real-time NSE/BSE ticker prices & intraday tracking.</p>
            <span className="inline-block text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10">Building... 🛠️</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="p-2 w-fit rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-200">Mutual Fund NAV</h4>
            <p className="text-[11px] text-slate-400">Automated daily NAV sync across equity & debt funds.</p>
            <span className="inline-block text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10">Building... 🛠️</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="p-2 w-fit rounded-xl bg-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-200">Gold & Sovereign Bonds</h4>
            <p className="text-[11px] text-slate-400">Physical Gold, Digital Gold & SGB tracking.</p>
            <span className="inline-block text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10">Building... 🛠️</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="p-2 w-fit rounded-xl bg-indigo-500/20 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-200">AI Rebalancer</h4>
            <p className="text-[11px] text-slate-400">Automated asset allocation advice powered by Gemini.</p>
            <span className="inline-block text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10">Building... 🛠️</span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Advisor for Investment Guidance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer border border-slate-700"
          >
            Return to Dashboard Overview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Investments;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Moon, Sun, ShieldCheck, Award } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settingsData, setSettingsData] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings/');
      setSettingsData(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const creditScore = settingsData?.credit_score || 300;
  const creditRating = settingsData?.credit_rating || (creditScore === 300 ? 'No Credit History' : 'Good');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-12">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          System Settings & Profile Overview
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure profile preferences and view synchronized financial status.</p>
      </div>

      <div className="glass-panel p-6 space-y-6 text-xs">
        {/* Profile Info & Synchronized Credit Score Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">{user?.full_name || 'User Account'}</h3>
              <p className="text-slate-400">{user?.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                Role: {user?.role || 'Standard User'}
              </span>
            </div>
          </div>

          {/* Synchronized Credit Score Profile Status */}
          <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Synchronized Credit Score</span>
              <div className="flex items-center gap-2">
                <strong className={`text-base font-bold ${creditScore === 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {creditScore === 300 ? '300 / 900' : `${creditScore} / 900`}
                </strong>
                <span className="text-[11px] text-slate-300 font-medium">({creditRating})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-200 text-sm">Application Preferences</h4>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div>
              <span className="font-semibold text-slate-200">Interface Theme</span>
              <p className="text-[10px] text-slate-400">Switch between dark mode and light mode aesthetics</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Database, LogOut, User, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="glass-panel m-4 mb-0 px-6 py-4 flex items-center justify-between border-slate-800">
      <div>
        <h2 className="text-xl font-bold text-slate-100">
          Welcome back, <span className="gradient-text">{user?.full_name || 'Financial Master'}</span>
        </h2>
        <p className="text-xs text-slate-400">Autonomous Financial Intelligence & Health Monitor</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-slate-200 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 glass-panel p-4 z-50 shadow-2xl border-slate-700 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h4 className="font-semibold text-xs text-slate-200">System Notifications</h4>
                <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No new notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {n.type}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-200">{n.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

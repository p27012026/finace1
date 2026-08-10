import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, User, RefreshCw, MessageSquare, Plus,
  Trash2, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const WELCOME_MESSAGE = {
  sender: 'ai',
  message: 'Hello! I am your **Antigravity AI Financial Advisor**. 👋\n\nI am your primary financial command center! You can ask me to perform actions directly, such as:\n• `Add ₹10,000 salary` or `Add ₹350 pizza expense`\n• `Set Food budget to ₹15,000` or `Create goal New Laptop target ₹80,000`\n• `Calculate EMI for ₹5,00,000 at 8.5% for 36 months`\n• `Delete last expense`\n\nWhat financial task would you like to execute today?'
};

const AIChatCenter = () => {
  const { formatCurrency } = useCurrency();
  const [sessionId, setSessionId] = useState(
    () => `session_${Date.now()}`
  );
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchSummaryData();
    window.addEventListener('finance-data-updated', fetchSummaryData);
    return () => window.removeEventListener('finance-data-updated', fetchSummaryData);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSummaryData = async () => {
    try {
      const res = await axios.get('/api/dashboard/widgets');
      setSummaryData(res.data);
    } catch (err) {
      console.error('Failed to load AI summary data:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/ai/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  const loadSession = async (sid) => {
    setSessionId(sid);
    setLoading(true);
    try {
      const res = await axios.get(`/api/ai/chat/history?session_id=${sid}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (err) {
      console.error('Failed to load session history:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    const newSid = `session_${Date.now()}`;
    setSessionId(newSid);
    setMessages([WELCOME_MESSAGE]);
    fetchSessions();
  };

  const deleteSession = async (e, sid) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/ai/session/${sid}`);
      setSessions(prev => prev.filter(s => s.session_id !== sid));
      if (sessionId === sid) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat session:', err);
    }
  };

  const handleSendText = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    setInputMsg('');
    setMessages(prev => [...prev, { sender: 'user', message: text }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { 
        message: text,
        session_id: sessionId 
      });
      setMessages(prev => [...prev, { sender: 'ai', message: res.data.message }]);
      if (res.data.action_executed) {
        window.dispatchEvent(new CustomEvent('finance-data-updated'));
        fetchSummaryData();
      }
      fetchSessions();
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { sender: 'ai', message: 'I encountered an issue executing your AI command. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendText();
  };

  const QUICK_PROMPTS = [
    { label: "➕ Add ₹10,000 Salary", prompt: "Add ₹10000 salary" },
    { label: "🍕 Add ₹350 Pizza Expense", prompt: "I spent ₹350 on Pizza yesterday" },
    { label: "🎯 Set Food Budget ₹15,000", prompt: "Create budget of ₹15000 for Food" },
    { label: "🧮 Calculate EMI (5 Lakhs)", prompt: "Calculate EMI for ₹500000 at 8.5% for 36 months" },
    { label: "🗑️ Delete Last Expense", prompt: "Delete last expense" },
    { label: "📈 Investment Strategy", prompt: "Suggest investment allocation plan" }
  ];

  const netCashFlow = summaryData?.cash_flow?.net_cash_flow || 0;
  const totalInc = summaryData?.cash_flow?.monthly_income || 0;
  const totalExp = summaryData?.cash_flow?.monthly_expenses || 0;
  const healthScore = summaryData?.financial_health_score?.score || 82;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-7xl mx-auto pb-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Hero Header & Live Financial Metrics Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Toggle Chat History Sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              AI Advisor Command Center
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Primary Financial Assistant • Multi-session Auto-Saved Chat History like ChatGPT.
            </p>
          </div>
        </div>

        {/* Live Context Metrics */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-[10px] text-slate-400 block">Monthly Income</span>
            <strong className="text-emerald-400 font-bold">{formatCurrency(totalInc)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-[10px] text-slate-400 block">Monthly Expenses</span>
            <strong className="text-rose-400 font-bold">{formatCurrency(totalExp)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-[10px] text-slate-400 block">Net Savings</span>
            <strong className="text-indigo-300 font-bold">{formatCurrency(netCashFlow)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 text-xs bg-indigo-950/30">
            <span className="text-[10px] text-indigo-300 block">Health Score</span>
            <strong className="text-amber-400 font-bold">{healthScore} / 100</strong>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace Layout with ChatGPT Sidebar */}
      <div className="glass-panel flex-1 flex overflow-hidden border-slate-800 shadow-2xl relative">
        {/* ChatGPT History Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col flex-shrink-0 animate-in slide-in-from-left duration-200">
            {/* New Chat Button */}
            <div className="p-3 border-b border-slate-800">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Chat</span>
              </button>
            </div>

            {/* Saved Sessions History List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-indigo-400" /> Recent Chat Sessions
              </div>

              {sessions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-[11px]">
                  No saved chat history yet. Start typing to save automatically!
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = s.session_id === sessionId;
                  return (
                    <div
                      key={s.session_id}
                      onClick={() => loadSession(s.session_id)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="truncate text-xs">{s.title || 'Conversation Session'}</span>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, s.session_id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Central Chat Feed Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto flex-shrink-0">
            <span className="text-[11px] text-indigo-400 font-bold whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Actions:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendText(qp.prompt)}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all whitespace-nowrap cursor-pointer shadow-sm hover:border-indigo-500/50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-300`}
                >
                  <div className={`p-2 rounded-xl h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-md ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] leading-relaxed space-y-2 ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20 font-medium' 
                      : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/80 shadow-md'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600 text-white animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Executing AI action & saving session...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 flex-shrink-0">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI or execute commands (e.g. 'Add ₹10000 salary', 'I spent ₹350 on pizza')..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>Execute</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatCenter;

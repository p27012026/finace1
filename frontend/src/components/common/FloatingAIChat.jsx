import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw } from 'lucide-react';
import axios from 'axios';

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      message: 'Hello! I am your **Antigravity AI Financial Advisor**. How can I help optimize your budget, investments, loans, or financial health today?'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/ai/chat/history');
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { sender: 'user', message: userText }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: userText });
      setMessages(prev => [...prev, { sender: 'ai', message: res.data.message }]);
      if (res.data.action_executed) {
        window.dispatchEvent(new CustomEvent('finance-data-updated'));
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { sender: 'ai', message: 'I encountered an issue connecting to Gemini AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Floating Trigger Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-2xl shadow-indigo-500/50 hover:scale-105 transition-all duration-300 group border border-indigo-400/40"
        >
          <div className="p-1.5 rounded-full bg-white/20">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <span className="text-sm">AI Financial Advisor</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[520px] glass-panel flex flex-col shadow-2xl border-slate-700/80 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900 rounded-t-2xl border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  AI Financial Advisor
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-indigo-300">Context Memory & Gemini 2.5 Active</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-inner'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini AI is analyzing financial context...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => setInputMsg('How can I improve my financial health score?')}
              className="px-2 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              💡 Improve Health Score
            </button>
            <button
              onClick={() => setInputMsg('What is my debt-to-income ratio and loan advice?')}
              className="px-2 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              💳 Debt & Loans
            </button>
            <button
              onClick={() => setInputMsg('Suggest an investment allocation plan.')}
              className="px-2 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              📈 Investment Plan
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 rounded-b-2xl border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask anything about your finances..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingAIChat;

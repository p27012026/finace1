import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Download, Sparkles, FileCheck, RefreshCw } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState('August 2026');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axios.post(`/api/reports/generate?period=${encodeURIComponent(period)}`);
      fetchReports();
    } catch (err) {
      console.error('Generate report error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            AI Monthly Financial Reports Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate professional multi-page downloadable PDF reports complete with Cover Page, Health Score, Summaries, and Gemini AI Predictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            placeholder="e.g. August 2026"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all whitespace-nowrap"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Monthly Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">
          Generated PDF Report Archive ({reports.length})
        </h3>
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{rep.title}</h4>
                  <p className="text-[10px] text-slate-400">
                    Health Score: {rep.health_score}/100 • Generated on {new Date(rep.generated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <a
                href={`/api/reports/download/${rep.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;

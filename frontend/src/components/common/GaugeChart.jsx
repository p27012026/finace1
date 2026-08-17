import React from 'react';

const GaugeChart = ({ score = 0, rating = 'No Data' }) => {
  const getRatingColor = () => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 70) return 'text-indigo-400 stroke-indigo-400';
    if (score >= 50) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const strokeDashoffset = 283 - (283 * (score / 100));

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <svg className="w-36 h-36 transform -rotate-90">
        <circle
          cx="72"
          cy="72"
          r="45"
          className="stroke-slate-700/60"
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx="72"
          cy="72"
          r="45"
          className={`transition-all duration-1000 ease-out ${getRatingColor()}`}
          strokeWidth="10"
          strokeDasharray="283"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-100">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Out of 100</span>
      </div>
      <span className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 ${getRatingColor()}`}>
        {rating}
      </span>
    </div>
  );
};

export default GaugeChart;

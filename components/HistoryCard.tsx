
import React from 'react';
import { formatDateFr } from '../utils/dateUtils';
import { DailyData } from '../types';

interface HistoryCardProps {
  date: string;
  data: DailyData;
  onChange: (value: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ date, data, onChange }) => {
  const completedCount = data.todos.filter(t => t.completed).length;
  const totalCount = data.todos.length;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 group">
      <div className="px-5 py-3 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
          {formatDateFr(date)}
        </span>
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-[10px] font-black text-indigo-600">
              {completedCount}/{totalCount}
            </span>
          </div>
        )}
      </div>
      <div className="p-0">
        <textarea
          value={data.note}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Aucune note pour ce jour..."
          className="w-full min-h-[140px] p-5 text-slate-700 text-xs leading-relaxed focus:outline-none resize-none bg-white placeholder:text-slate-200 font-medium"
        />
      </div>
      {totalCount > 0 && (
        <div className="px-5 py-3 bg-slate-50/30 border-t-2 border-slate-50 flex gap-1 overflow-x-auto no-scrollbar">
          {['task', 'bugfix', 'idea', 'reminder'].map(cat => {
            const count = data.todos.filter(t => t.category === cat).length;
            if (count === 0) return null;
            const colors = {
              task: 'bg-blue-100 text-blue-600',
              bugfix: 'bg-rose-100 text-rose-600',
              idea: 'bg-amber-100 text-amber-600',
              reminder: 'bg-emerald-100 text-emerald-600'
            };
            return (
              <span key={cat} className={`text-[8px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap ${colors[cat as keyof typeof colors]}`}>
                {count} {cat.toUpperCase()}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

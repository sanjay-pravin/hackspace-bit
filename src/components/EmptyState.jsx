import React from 'react';
import { CalendarX, Search } from 'lucide-react';

export default function EmptyState({ 
  title = 'No records found', 
  description = 'Try adjusting your search criteria or filters.',
  action = null 
}) {
  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-4">
        <CalendarX className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
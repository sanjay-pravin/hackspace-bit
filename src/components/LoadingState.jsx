import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading records...' }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <p className="text-xs text-slate-400 font-medium">{message}</p>
    </div>
  );
}
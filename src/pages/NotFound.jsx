import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-cyan-400 border border-indigo-500/30 flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 — Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-md">
        The campus link you followed does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
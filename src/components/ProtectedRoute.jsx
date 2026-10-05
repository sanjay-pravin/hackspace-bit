import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Verifying security credentials...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strictly block students from accessing any admin routes
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">403 — Unauthorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Access to this administrative section is strictly restricted to verified campus staff and event organizers. Your account ({user.email}) has student privileges.
          </p>
          <a
            href="/student/dashboard"
            className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Return to Student Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
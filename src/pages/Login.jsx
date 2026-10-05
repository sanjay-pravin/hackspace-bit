import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, loginWithPcdp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [portalMode, setPortalMode] = useState('pcdp'); // 'pcdp' | 'admin'
  const [username, setUsername] = useState('sanjaypravinr.cs25@bitsathy.ac.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePcdpLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await loginWithPcdp(username, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'PCDP Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleOneTap = async (email = 'sanjaypravinr.cs25@bitsathy.ac.in') => {
    setSubmitting(true);
    setError('');
    try {
      const user = await loginWithGoogle(email);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-10 bg-slate-50">
      <div className="max-w-[420px] w-full space-y-4">
        {/* Portal Switcher Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setPortalMode('pcdp');
              setUsername('sanjaypravinr.cs25@bitsathy.ac.in');
              setPassword('password123');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              portalMode === 'pcdp'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PCDP Portal (BIT Sathy)
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalMode('admin');
              setUsername('sarah.admin@campus.edu');
              setPassword('password123');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              portalMode === 'admin'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty / Admin
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {portalMode === 'pcdp' ? (
          /* Exact Match to ps.bitsathy.ac.in screenshot */
          <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-7 sm:p-8 space-y-5 border border-slate-200">
            {/* Logo and Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-8 h-8 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24.42.4.92.74 1.48 1.01.62.3 1.31.5 2.05.62.45.07.9.11 1.35.13.45-.02.9-.06 1.35-.13.74-.12 1.43-.32 2.05-.62.56-.27 1.06-.61 1.48-1.01C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">PCDP Portal</h1>
              </div>
              <h2 className="text-sm font-semibold text-indigo-600">Hi, Welcome Back!</h2>
            </div>

            <form onSubmit={handlePcdpLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-[#6366f1] hover:bg-[#5254db] text-white shadow-sm transition disabled:opacity-50"
              >
                {submitting ? 'Verifying with PCDP Portal...' : 'Login'}
              </button>
            </form>

            {/* Divider "Or" */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">Or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Exact match to the Google Sign In Button in screenshot */}
            <button
              type="button"
              onClick={() => handleGoogleOneTap('sanjaypravinr.cs25@bitsathy.ac.in')}
              disabled={submitting}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center space-x-2.5 text-left">
                {/* Green Avatar with white S */}
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                  S
                </div>
                <div className="leading-tight">
                  <div className="text-[11px] font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition">
                    Sign In as SANJAYPRAVIN
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    sanjaypravinr.cs25@bitsathy.ac.in
                  </div>
                </div>
              </div>
              {/* Google 4-Color Icon */}
              <svg className="w-4 h-4 shrink-0 mr-1" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
          </div>
        ) : (
          /* Faculty / Admin Login Card */
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Staff & Organizer Console</h3>
            </div>
            <p className="text-xs text-slate-500">
              Access hackathon publish controls, venue OTP gates, and real-time participant verification.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email ID</label>
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sarah.admin@campus.edu"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition disabled:opacity-50"
              >
                {submitting ? 'Verifying Admin Access...' : 'Sign In as Faculty Admin'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Quick Demos:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('sarah.admin@campus.edu');
                    setPassword('password123');
                  }}
                  className="text-purple-600 hover:text-purple-700 underline font-mono text-[10px]"
                >
                  Admin (Sarah)
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('pcdp');
                    setUsername('alex.student@campus.edu');
                    setPassword('password123');
                  }}
                  className="text-blue-600 hover:text-blue-700 underline font-mono text-[10px]"
                >
                  Student (Alex)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-500">
          New user?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

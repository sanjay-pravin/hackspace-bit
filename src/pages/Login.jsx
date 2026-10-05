import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Login() {
  const { login, loginWithPcdp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [portalMode, setPortalMode] = useState('student'); // 'student' | 'admin'
  const [username, setUsername] = useState('sanjaypravinr.cs25@bitsathy.ac.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Google Sign-In Chooser Modal
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  const handleStudentSubmit = async (e) => {
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
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
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
      setError(err.message || 'Admin authentication failed. Enter username: sarah.admin@campus.edu or admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminOneClick = async () => {
    setSubmitting(true);
    setError('');
    try {
      await login('sarah.admin@campus.edu', 'password123');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Admin sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAccountSelect = async (email, displayName = null) => {
    setSubmitting(true);
    setError('');
    try {
      const user = await loginWithGoogle(email, displayName);
      setIsGoogleModalOpen(false);
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

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    await handleGoogleAccountSelect(customGoogleEmail.trim(), customGoogleName.trim() || null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-[420px] w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-blue-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Vision Builders • Campus Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Log in to Campus Events
          </h1>
          <p className="text-xs text-slate-500">
            Choose your preferred sign-in method to continue.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vercel-Style "Continue with Google" Button */}
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsGoogleModalOpen(true);
            }}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2.5 group cursor-pointer"
          >
            {/* Google 4-Color Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setPortalMode('student');
                setUsername('sanjaypravinr.cs25@bitsathy.ac.in');
                setPassword('password123');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                portalMode === 'student'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalMode('admin');
                setUsername('sarah.admin@campus.edu');
                setPassword('password123');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                portalMode === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Faculty / Admin
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={portalMode === 'student' ? handleStudentSubmit : handleAdminSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {portalMode === 'student' ? 'Student Email / Roll No' : 'Staff Username / Email'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={portalMode === 'student' ? 'e.g. yourname.cs25@bitsathy.ac.in' : 'sarah.admin@campus.edu or admin'}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[10px] text-slate-400">Default: password123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Authenticating...' : portalMode === 'student' ? 'Sign In as Student' : 'Sign In as Faculty Admin'}
            </button>
          </form>

          {/* 1-Click Admin Shortcut */}
          {portalMode === 'admin' && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAdminOneClick}
                disabled={submitting}
                className="w-full py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>1-Click Sign In as Admin (Dr. Sarah Jenkins)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Create Student Account
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            Protected by BIT Sathy PCDP Portal verification & Campus Auth.
          </p>
        </div>
      </div>

      {/* Google Account Selector Modal (Exact Google OAuth Popup Experience) */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          setIsGoogleModalOpen(false);
          setShowCustomGoogleInput(false);
        }}
        title="Sign in with Google"
      >
        <div className="space-y-4 py-1">
          <div className="text-center space-y-1 pb-1">
            <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <h3 className="text-base font-bold text-slate-900">Choose an account</h3>
            <p className="text-xs text-slate-500">to continue to Campus Event Management</p>
          </div>

          {/* Account List */}
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
            {/* Account 1: Sanjay Pravin R */}
            <button
              type="button"
              onClick={() => handleGoogleAccountSelect('sanjaypravinr.cs25@bitsathy.ac.in', 'SANJAYPRAVIN R')}
              disabled={submitting}
              className="w-full p-3 text-left hover:bg-slate-50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center space-x-1.5">
                    <span>SANJAYPRAVIN R</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-semibold">PCDP L2</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    sanjaypravinr.cs25@bitsathy.ac.in
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
            </button>

            {/* Account 2: Alex Rivera */}
            <button
              type="button"
              onClick={() => handleGoogleAccountSelect('alex.student@campus.edu', 'Alex Rivera')}
              disabled={submitting}
              className="w-full p-3 text-left hover:bg-slate-50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                    Alex Rivera (Student)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    alex.student@campus.edu
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
            </button>

            {/* Account 3: Dr. Sarah Jenkins */}
            <button
              type="button"
              onClick={() => handleGoogleAccountSelect('sarah.admin@campus.edu', 'Dr. Sarah Jenkins')}
              disabled={submitting}
              className="w-full p-3 text-left hover:bg-slate-50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition flex items-center space-x-1.5">
                    <span>Dr. Sarah Jenkins</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-800 font-semibold">Faculty Admin</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    sarah.admin@campus.edu
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition" />
            </button>

            {/* Option 4: Use another account */}
            {!showCustomGoogleInput ? (
              <button
                type="button"
                onClick={() => setShowCustomGoogleInput(true)}
                className="w-full p-3 text-left hover:bg-slate-50 transition flex items-center space-x-3 text-xs font-semibold text-slate-700"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} className="p-3 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-800">Enter your Google Email:</div>
                <input
                  type="email"
                  required
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="e.g. username@gmail.com or campus email"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  placeholder="Full Name (optional)"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="px-3 py-1 text-xs text-slate-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !customGoogleEmail.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    {submitting ? 'Connecting...' : 'Sign In with this Account'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            To continue, Google will share your name, email address, and profile photo with Campus Events.
          </p>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  Calendar, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShieldCheck, 
  ClipboardList
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                AI Campus Event Assistant
              </span>
              <p className="text-[10px] text-slate-400">Vision Builders • HACKSPACE</p>
            </div>
          </Link>

          {/* Navigation Links — Strictly separate by role */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/events') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Explore Events
            </Link>

            {/* Student-only Links (Students CANNOT see admin items) */}
            {user && !isAdmin && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/student/dashboard') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/student/registrations"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/student/registrations') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Registrations
                </Link>
                <Link
                  to="/student/teams"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/student/teams') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Teams
                </Link>
              </>
            )}

            {/* Admin-only Links (ONLY shown to authenticated admins) */}
            {user && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/admin/dashboard') ? 'text-white bg-slate-800' : 'text-purple-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/events"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/admin/events') ? 'text-white bg-slate-800' : 'text-purple-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Manage Events
                </Link>
                <Link
                  to="/admin/attendance"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/admin/attendance') ? 'text-cyan-300 bg-slate-800' : 'text-cyan-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Venue Attendance
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* If Admin: display read-only staff badge */}
            {isAdmin && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wider">
                Staff Admin
              </span>
            )}

            {user && <NotificationBell />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-slate-700 transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.display_name}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <span className="text-xs text-slate-200 truncate max-w-[110px]">
                    {user.display_name.split(' ')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-50 p-1.5 text-xs">
                    <div className="p-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-white truncate">{user.display_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isAdmin ? 'bg-purple-900/60 text-purple-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </Link>

                    {/* Role-specific menu item */}
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-purple-300 hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        to="/student/registrations"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                        <span>My Registrations</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {isAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold border border-purple-800">
                Admin
              </span>
            )}
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2 text-xs">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Explore Events
          </Link>

          {/* Student mobile links */}
          {user && !isAdmin && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                to="/student/registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-300 hover:text-white"
              >
                My Registrations
              </Link>
              <Link
                to="/student/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-300 hover:text-white"
              >
                My Teams
              </Link>
            </>
          )}

          {/* Admin mobile links */}
          {user && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-purple-300"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-purple-300"
              >
                Manage Events
              </Link>
              <Link
                to="/admin/attendance"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-cyan-300"
              >
                Venue Attendance
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-1 text-red-400"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex space-x-2 pt-1">
                <Link to="/login" className="flex-1 text-center py-1.5 bg-slate-800 text-white rounded">
                  Log In
                </Link>
                <Link to="/signup" className="flex-1 text-center py-1.5 bg-indigo-600 text-white rounded">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
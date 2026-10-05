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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                AI Campus Event Assistant
              </span>
              <p className="text-[10px] text-slate-500">Vision Builders • HACKSPACE</p>
            </div>
          </Link>

          {/* Navigation Links — Strictly separate by role */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/events') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    isActive('/student/dashboard') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/student/registrations"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/student/registrations') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Registrations
                </Link>
                <Link
                  to="/student/teams"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/student/teams') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    isActive('/admin/dashboard') ? 'text-purple-700 bg-purple-50 font-bold' : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/events"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/admin/events') ? 'text-purple-700 bg-purple-50 font-bold' : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Manage Events
                </Link>
                <Link
                  to="/admin/attendance"
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive('/admin/attendance') ? 'text-blue-700 bg-blue-50 font-bold' : 'text-blue-700 hover:bg-blue-50'
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
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                Staff Admin
              </span>
            )}

            {user && <NotificationBell />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.display_name}
                    className="w-6 h-6 rounded-md object-cover border border-slate-200"
                  />
                  <span className="text-xs font-medium text-slate-800 truncate max-w-[110px]">
                    {user.display_name.split(' ')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 text-xs">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-900 truncate">{user.display_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </Link>

                    {/* Role-specific menu item */}
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        to="/student/registrations"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Registrations</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50"
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
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {isAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                Admin
              </span>
            )}
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 text-xs">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-700 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-700 hover:text-blue-600"
          >
            Explore Events
          </Link>

          {user && !isAdmin && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-700 hover:text-blue-600"
              >
                Student Dashboard
              </Link>
              <Link
                to="/student/registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-700 hover:text-blue-600"
              >
                My Registrations
              </Link>
              <Link
                to="/student/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-700 hover:text-blue-600"
              >
                My Squads & Teams
              </Link>
            </>
          )}

          {user && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-purple-700 font-semibold"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-purple-700 font-semibold"
              >
                Manage Events
              </Link>
              <Link
                to="/admin/attendance"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-blue-700 font-semibold"
              >
                Venue Attendance
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-800 font-medium">{user.display_name}</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg bg-slate-100 text-slate-800 font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

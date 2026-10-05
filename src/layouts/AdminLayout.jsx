import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  CalendarRange, 
  Users2, 
  QrCode, 
  PlusCircle, 
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Manage Events', path: '/admin/events', icon: CalendarRange },
    { label: 'Participants & CSV', path: '/admin/participants', icon: Users2 },
    { label: 'Live QR Attendance', path: '/admin/attendance', icon: QrCode, highlight: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Admin Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Admin Profile Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-800/40 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{user?.display_name}</p>
                  <p className="text-[11px] text-purple-300 font-medium">Event Administration</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
                    Lead Organizer
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-800/30 flex items-center justify-between text-xs text-slate-400">
                <span>Security Engine</span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  {isSupabaseConfigured ? 'Supabase Live' : 'Verified Local DB'}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operations Suite
              </p>
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : item.highlight
                        ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
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
  ShieldCheck,
  ChevronRight
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Admin Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Admin Profile Box */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.display_name}</p>
                  <p className="text-[11px] text-purple-700 font-medium">Event Administration</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Lead Organizer
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Database Engine</span>
                <span className="text-emerald-700 font-medium text-[11px]">
                  {isSupabaseConfigured ? 'Supabase Live' : 'Verified Local DB'}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
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
                        ? 'bg-purple-600 text-white shadow-sm'
                        : item.highlight
                        ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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

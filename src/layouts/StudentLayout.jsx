import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  User, 
  Compass, 
  ChevronRight
} from 'lucide-react';

export default function StudentLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Registrations', path: '/student/registrations', icon: ClipboardList },
    { label: 'My Teams', path: '/student/teams', icon: Users },
    { label: 'Profile Settings', path: '/profile', icon: User },
    { label: 'Explore Events', path: '/events', icon: Compass },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Student Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-5">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                  alt={user?.display_name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.display_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.student_id || 'Student'}</p>
                  <p className="text-[10px] text-blue-600 font-medium truncate">{user?.department}</p>
                </div>
              </div>
            </div>

            <nav className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              {links.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

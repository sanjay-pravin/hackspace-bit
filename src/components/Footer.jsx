import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm">AI Campus Event Assistant</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Every Campus Event. One Connected Campus. Discover events, register squads, and verify attendance directly at the venue using Venue OTPs.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider mb-3">Event Categories</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/events?category=Hackathon" className="text-slate-600 hover:text-blue-600 transition">Hackathons</Link></li>
              <li><Link to="/events?category=Technical+Workshop" className="text-slate-600 hover:text-blue-600 transition">Technical Workshops</Link></li>
              <li><Link to="/events?category=Coding+Competition" className="text-slate-600 hover:text-blue-600 transition">Coding Competitions</Link></li>
              <li><Link to="/events?category=Seminar" className="text-slate-600 hover:text-blue-600 transition">Seminars & Keynotes</Link></li>
              <li><Link to="/events?category=Cultural+Event" className="text-slate-600 hover:text-blue-600 transition">Cultural Festivals</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Portals (strictly non-admin for students) */}
          <div>
            <h4 className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider mb-3">Student Hub</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/events" className="text-slate-600 hover:text-blue-600 transition">Explore All Events</Link></li>
              <li><Link to="/student/dashboard" className="text-slate-600 hover:text-blue-600 transition">Student Dashboard</Link></li>
              <li><Link to="/student/registrations" className="text-slate-600 hover:text-blue-600 transition">My Registrations</Link></li>
              <li><Link to="/student/teams" className="text-slate-600 hover:text-blue-600 transition">My Squads & Teams</Link></li>
              {/* Only render admin links if the logged-in user is an administrator */}
              {isAdmin && (
                <li className="pt-1 border-t border-slate-100">
                  <Link to="/admin/dashboard" className="text-purple-600 hover:text-purple-700 font-semibold transition">
                    Admin Console
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider mb-3">Accreditation</h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="font-semibold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Vision Builders</span>
              </p>
              <p className="text-[10px] text-slate-500">
                HACKSPACE Hackathon Campus Event Assistant. Secure role-based architecture.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} AI Campus Event Assistant. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-Based Security Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

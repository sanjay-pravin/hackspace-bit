import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, CheckCircle, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="font-bold text-white text-sm">AI Campus Event Assistant</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Every Campus Event. One Connected Campus. Discover events, register squads, and verify attendance directly at the venue using Venue OTPs.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-3">Event Categories</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/events?category=Hackathon" className="hover:text-white transition">Hackathons</Link></li>
              <li><Link to="/events?category=Technical+Workshop" className="hover:text-white transition">Technical Workshops</Link></li>
              <li><Link to="/events?category=Coding+Competition" className="hover:text-white transition">Coding Competitions</Link></li>
              <li><Link to="/events?category=Seminar" className="hover:text-white transition">Seminars & Keynotes</Link></li>
              <li><Link to="/events?category=Cultural+Event" className="hover:text-white transition">Cultural Festivals</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Portals (strictly non-admin for students) */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-3">Student Hub</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/events" className="hover:text-white transition">Explore All Events</Link></li>
              <li><Link to="/student/dashboard" className="hover:text-white transition">Student Dashboard</Link></li>
              <li><Link to="/student/registrations" className="hover:text-white transition">My Registrations</Link></li>
              <li><Link to="/student/teams" className="hover:text-white transition">My Squads & Teams</Link></li>
              {/* Only render admin links if the logged-in user is an administrator */}
              {isAdmin && (
                <li className="pt-1 border-t border-slate-800">
                  <Link to="/admin/dashboard" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                    Admin Console
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-3">Accreditation</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <p className="font-semibold text-white flex items-center space-x-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vision Builders</span>
              </p>
              <p className="text-[10px] text-slate-400">
                HACKSPACE Hackathon Campus Event Assistant. Secure role-based architecture.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} AI Campus Event Assistant. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Security Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
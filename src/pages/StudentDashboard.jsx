import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';
import { 
  Users, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Clock,
  KeyRound
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingState from '../components/LoadingState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      if (!user) return;
      setLoading(true);
      try {
        const [regs, userTeams] = await Promise.all([
          registrationService.getUserRegistrations(user.id),
          teamService.getUserTeams(user.id),
        ]);
        setRegistrations(regs);
        setTeams(userTeams);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [user]);

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  const confirmed = registrations.filter(r => r.status === 'confirmed');
  const attended = registrations.filter(r => r.hasAttended || r.status === 'attended');
  const nextEvent = confirmed
    .filter(r => new Date(r.event?.start_at) > new Date())
    .sort((a, b) => new Date(a.event?.start_at) - new Date(b.event?.start_at))[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.display_name}!
            </h1>
            <p className="text-xs text-slate-500">
              {user?.department} • {user?.academic_year}
            </p>
          </div>

          <Link
            to="/events"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xl font-bold text-slate-900">{confirmed.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Active Registrations</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xl font-bold text-emerald-600">{attended.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Present at Venue</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xl font-bold text-blue-600">{teams.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Squads</p>
          </div>
        </div>
      </div>

      {/* Next Upcoming Event */}
      {nextEvent && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Next Upcoming Event</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ID: {nextEvent.public_registration_id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {nextEvent.event?.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(nextEvent.event?.start_at)} at {formatTime(nextEvent.event?.start_at)}
              </p>
              <p className="text-xs text-blue-600 font-medium flex items-center space-x-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Venue: {nextEvent.event?.venue}</span>
              </p>
            </div>

            <Link
              to="/student/registrations"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1.5 shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Enter Venue OTP</span>
            </Link>
          </div>
        </div>
      )}

      {/* Registered Events */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Your Registered Events</h2>
          <Link
            to="/student/registrations"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {confirmed.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
            <p className="text-xs text-slate-500">You are not currently registered for any upcoming events.</p>
            <Link
              to="/events"
              className="inline-block px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {confirmed.slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-slate-500">{reg.public_registration_id}</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">Confirmed</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{reg.event?.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {formatDate(reg.event?.start_at)} • {reg.event?.venue}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 capitalize">
                    {reg.registration_type}
                  </span>
                  <Link
                    to="/student/registrations"
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center space-x-1"
                  >
                    <span>Check In</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teams list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Your Squads</h2>
          <Link
            to="/student/teams"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>Manage squads</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm text-center space-y-1">
            <p className="text-xs text-slate-500">No team memberships yet.</p>
            <Link to="/student/teams" className="text-xs text-blue-600 hover:underline">
              Create or Join a Squad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {t.team_code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">Event: {t.event?.title}</p>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="capitalize">{t.userRole}</span>
                  <span>{t.members?.length || 1} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

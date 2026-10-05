import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarRange, 
  Users2, 
  CheckCircle2, 
  TrendingUp, 
  QrCode, 
  PlusCircle, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { eventService } from '../services/eventService';
import { attendanceService } from '../services/attendanceService';
import LoadingState from '../components/LoadingState';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [liveStats, attendanceLog] = await Promise.all([
          eventService.getLiveStats(),
          attendanceService.getRecentAttendance(),
        ]);
        setStats(liveStats);
        setRecentAttendance(attendanceLog.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) return <LoadingState message="Aggregating campus analytics..." />;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry, attendance verifications, and event capacity tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/attendance"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Venue Attendance Console</span>
          </Link>
          <Link
            to="/admin/events"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <CalendarRange className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalEvents || 0}</p>
          <p className="text-[11px] text-slate-500">
            <strong className="text-emerald-600">{stats?.upcomingEvents} upcoming</strong> across campus
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
            <Users2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-600">{stats?.totalRegistrations || 0}</p>
          <p className="text-[11px] text-slate-500">Confirmed student participants</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats?.attendanceCount || 0}</p>
          <p className="text-[11px] text-slate-500">Verified at venue entrance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Turnout Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats?.attendanceRate || 0}%</p>
          <p className="text-[11px] text-slate-500">Of registered participants verified</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Events by Category</h3>
              <p className="text-xs text-slate-500">Program distribution across academic tracks</p>
            </div>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#2563EB' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Attendance Stream */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Venue Check-ins</h3>
                <p className="text-xs text-slate-500">Real-time attendance verifications</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentAttendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No attendance records logged yet today. Use the Venue Attendance Console to verify attendees.
                </div>
              ) : (
                recentAttendance.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.studentName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{item.eventTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-blue-600 font-semibold">{item.registrationId}</span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/admin/attendance"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition"
            >
              <span>Launch Venue Attendance Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

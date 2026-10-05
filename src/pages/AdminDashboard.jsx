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
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { eventService } from '../services/eventService';
import { attendanceService } from '../services/attendanceService';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingState from '../components/LoadingState';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

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
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organizer Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry, attendance verifications, and event capacity tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/attendance"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </Link>
          <Link
            to="/admin/events"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <CalendarRange className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalEvents || 0}</p>
          <p className="text-[11px] text-slate-400">
            <strong className="text-emerald-400">{stats?.upcomingEvents} upcoming</strong> across campus
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Passes</span>
            <Users2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-indigo-400">{stats?.totalRegistrations || 0}</p>
          <p className="text-[11px] text-slate-400">Confirmed student participants</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">{stats?.attendanceCount || 0}</p>
          <p className="text-[11px] text-slate-400">Verified at campus entry gates</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Turnout Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{stats?.attendanceRate || 0}%</p>
          <p className="text-[11px] text-slate-400">Of registered participants verified</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Events by Category</h3>
              <p className="text-xs text-slate-400">Program distribution across academic tracks</p>
            </div>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748B" 
                  fontSize={10} 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Attendance Stream */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Gate Check-ins</h3>
                <p className="text-xs text-slate-400">Real-time attendance verifications</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {recentAttendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No attendance records logged yet today. Use the Live QR Scanner to verify student passes.
                </div>
              ) : (
                recentAttendance.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{item.studentName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.eventTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 font-semibold">{item.registrationId}</span>
                      <p className="text-[10px] text-slate-500">
                        {new Date(item.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/admin/attendance"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              <span>Launch Live Check-in Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
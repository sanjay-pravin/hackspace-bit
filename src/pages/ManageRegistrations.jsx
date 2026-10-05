import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { registrationService } from '../services/registrationService';
import { eventService } from '../services/eventService';
import { exportToCsv } from '../utils/exportCsv';
import { formatDate } from '../utils/formatters';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function ManageRegistrations() {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allEvents, participantsList] = await Promise.all([
        eventService.getAllAdminEvents(),
        registrationService.getAllParticipantsForAdmin({
          eventId: selectedEventId,
          status: selectedStatus,
          search,
        }),
      ]);
      setEvents(allEvents);
      setParticipants(participantsList);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEventId, selectedStatus, search]);

  const handleExportCsv = () => {
    const filename = `campus_event_participants_${new Date().toISOString().slice(0, 10)}`;
    const exportRows = participants.map(p => ({
      'Registration ID': p.public_registration_id,
      'Event Title': p.event_title,
      'Student Name': p.student_name,
      'Student Email': p.student_email,
      'Department': p.department,
      'Year': p.academic_year,
      'Student ID': p.student_id,
      'Team Name': p.team_name,
      'Type': p.registration_type,
      'Status': p.status,
      'Checked In': p.isCheckedIn ? 'YES' : 'NO',
      'Registered Date': p.registered_at,
    }));
    exportToCsv(filename, exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Participant Directory</h1>
          <p className="text-xs text-slate-400">
            Audit registered attendees, review verification status, and export official lists to CSV.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Search Attendee
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, or Pass ID..."
              className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Check-in Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended & Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <LoadingState message="Fetching participant registers..." />
      ) : participants.length === 0 ? (
        <EmptyState
          title="No participants found"
          description="Try clearing filters or search keywords."
        />
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Pass ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Type / Squad</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {p.public_registration_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.student_name}</div>
                      <div className="text-[11px] text-slate-400">{p.student_email} • {p.department}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-200">
                      {p.event_title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium">{p.registration_type}</span>
                      {p.team_name !== 'Individual' && (
                        <div className="text-[10px] text-purple-400 font-semibold">Squad: {p.team_name}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.isCheckedIn ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Checked In</span>
                        </span>
                      ) : p.status === 'cancelled' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Cancelled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Registered</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {formatDate(p.registered_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Records: <strong className="text-white">{participants.length}</strong></span>
            <span>Accredited for Vision Builders • HACKSPACE</span>
          </div>
        </div>
      )}
    </div>
  );
}
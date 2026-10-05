import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import { eventService } from '../services/eventService';
import { 
  Users, 
  PlusCircle, 
  KeyRound, 
  Copy, 
  Check, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';

export default function MyTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamEvents, setTeamEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userTeams, allEvents] = await Promise.all([
        teamService.getUserTeams(user.id),
        eventService.getEvents(),
      ]);
      setTeams(userTeams);
      const allowed = allEvents.filter(e => e.maximum_team_size > 1 && e.status === 'published');
      setTeamEvents(allowed);
      if (allowed.length > 0 && !selectedEventId) {
        setSelectedEventId(allowed[0].id);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await teamService.createTeam({
        name: teamName,
        eventId: selectedEventId,
        leaderId: user.id,
      });
      setIsCreateModalOpen(false);
      setTeamName('');
      setSuccessMsg('Squad created successfully! Share your team code with your teammates.');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const result = await teamService.joinTeamByCode(joinCode, user.id);
      setIsJoinModalOpen(false);
      setJoinCode('');
      setSuccessMsg(`Joined squad "${result.team.name}" for "${result.event.title}"! Your registration has been confirmed.`);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join team');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Squad Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Hackathon Squads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Form squads, invite teammates with simple 6-character codes, and collaborate on campus challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setErrorMsg('');
              setIsJoinModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition flex items-center space-x-1.5"
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Squad</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingState message="Loading your squad memberships..." />
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Squad Memberships Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create a squad for an upcoming hackathon or ask your team captain for their invitation code to join.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              Join Squad by Code
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition"
            >
              Create Squad
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5 truncate max-w-xs">
                    {team.event?.title || 'Campus Event'}
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  team.userRole === 'leader'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {team.userRole === 'leader' ? 'Squad Captain' : 'Squad Member'}
                </span>
              </div>

              {/* Invitation Code Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Invite Code (Share with teammates)
                  </span>
                  <span className="text-base font-mono font-extrabold text-slate-900 tracking-wider">
                    {team.team_code}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(team.team_code, team.id)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition flex items-center space-x-1"
                >
                  {copiedId === team.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Roster */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Squad Roster</span>
                  <span>{team.members?.length || 1} / {team.event?.maximum_team_size || 4} members</span>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                  {team.members?.map((m) => (
                    <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={m.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={m.profile?.display_name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {m.profile?.display_name || 'Student'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {m.profile?.student_id || m.profile?.department || 'Member'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-400 capitalize">
                        {m.role === 'leader' ? '👑 Captain' : 'Member'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Event Action */}
              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
                <Link
                  to={`/events/${team.event?.slug}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center space-x-1"
                >
                  <span>View Event Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/student/registrations"
                  className="text-slate-500 hover:text-slate-700"
                >
                  My Registrations
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Hackathon Squad"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Squad Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Byte Busters, Neural Knights"
              className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Event *</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {teamEvents.map(evt => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} (Max {evt.maximum_team_size} members)
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            As captain, an invite code will be generated for your squad that you can share with teammates to register.
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating Squad...' : 'Create Squad'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Squad by Code"
      >
        <form onSubmit={handleJoinTeam} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Squad Invitation Code *</label>
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().trim())}
              placeholder="e.g. NK-7782"
              className="w-full py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Enter the squad code provided by your team captain (e.g. <strong className="text-slate-800">NK-7782</strong> for Neural Knights).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 space-y-1">
            <p className="font-semibold text-blue-950">✓ What happens when you join:</p>
            <p>1. You are automatically enrolled in the squad roster.</p>
            <p>2. Your event registration is confirmed and mapped with the team ID.</p>
            <p>3. You can check in at the venue using the Venue OTP.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !joinCode.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Verifying Code...' : 'Join Squad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

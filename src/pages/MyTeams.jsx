import React, { useState, useEffect } from 'react';
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
  Sparkles
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
      // Filter events that allow teams
      const allowed = allEvents.filter(e => e.maximum_team_size > 1 && e.status === 'published');
      setTeamEvents(allowed);
      if (allowed.length > 0) setSelectedEventId(allowed[0].id);
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
      await teamService.joinTeamByCode(joinCode, user.id);
      setIsJoinModalOpen(false);
      setJoinCode('');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team Management</h1>
          <p className="text-xs text-slate-400">
            Form squads, invite classmates with team codes, and participate in hackathons together.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setErrorMsg('');
              setIsJoinModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center space-x-1.5"
          >
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Join by Code</span>
          </button>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Squad</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <LoadingState message="Loading your teams..." />
      ) : teams.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Team Memberships Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create a squad for an upcoming hackathon or enter an invitation code given by your team leader.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
            >
              Create Team
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200"
            >
              Join by Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{team.name}</h3>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5 truncate max-w-xs">
                    {team.event?.title || 'Campus Event'}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {team.userRole === 'leader' ? 'Leader' : 'Member'}
                </span>
              </div>

              {/* Invitation Code Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Invite Code</span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest">{team.team_code}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(team.team_code, team.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  {copiedId === team.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="text-[10px] font-semibold">{copiedId === team.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Roster */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Roster</span>
                  <span>{team.members?.length || 1} / {team.event?.maximum_team_size || 4} members</span>
                </div>

                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-950/40 border border-slate-800/60 overflow-hidden">
                  {team.members?.map((m) => (
                    <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <img
                          src={m.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={m.profile?.display_name}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="text-white font-medium">{m.profile?.display_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {m.role === 'leader' ? 'Squad Lead' : 'Teammate'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create a New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Squad Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Cyber Ninjas"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Event *</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {teamEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.minimum_team_size}-{evt.maximum_team_size} members)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Squad'}
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
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Invitation Code *</label>
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. NK-7782"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Ask your team captain for the 7-character invite code.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Join Squad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Lock,
  UserCheck,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';
import { pcdpService } from '../services/pcdpService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, formatDateTime, getCategoryBadgeClass } from '../utils/formatters';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';

export default function EventDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEligibleModalOpen, setIsEligibleModalOpen] = useState(false);
  const [regType, setRegType] = useState('individual');
  const [teamName, setTeamName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState('');
  const [confirmedReg, setConfirmedReg] = useState(null);

  const [existingReg, setExistingReg] = useState(null);

  useEffect(() => {
    async function fetchEventDetails() {
      setLoading(true);
      setError(null);
      try {
        const found = await eventService.getEventBySlug(slug);
        if (!found) {
          setError('Event not found');
          return;
        }
        setEvent(found);

        if (user) {
          const userRegs = await registrationService.getUserRegistrations(user.id);
          const current = userRegs.find(r => r.event_id === found.id && r.status === 'confirmed');
          setExistingReg(current || null);
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('Error loading event information');
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [slug, user]);

  if (loading) return <div className="py-24"><LoadingState message="Retrieving event details..." /></div>;
  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Event Not Found</h2>
        <Link to="/events" className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white">
          Back to Events
        </Link>
      </div>
    );
  }

  const isPastDeadline = new Date(event.registration_deadline) < new Date();
  const isFull = (event.registered_count || 0) >= event.capacity;
  const isCancelled = event.status === 'cancelled';
  const canRegister = !isPastDeadline && !isFull && !isCancelled && !existingReg;
  const allowsTeams = event.maximum_team_size > 1;
  const remainingSlots = Math.max(0, event.capacity - (event.registered_count || 0));
  const eligibility = pcdpService.checkEventEligibility(event, user);

  const handleOpenRegister = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/events/${slug}` } });
      return;
    }
    const check = pcdpService.checkEventEligibility(event, user);
    if (!check.eligible) {
      setIsEligibleModalOpen(true);
      return;
    }
    setRegError('');
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRegError('');

    try {
      let teamId = null;
      if (regType === 'team') {
        if (!teamName.trim()) {
          throw new Error('Please enter a squad name to register.');
        }
        const createdTeam = await teamService.createTeam({
          name: teamName.trim(),
          eventId: event.id,
          leaderId: user.id,
        });
        teamId = createdTeam.id;
      }

      const reg = await registrationService.registerForEvent({
        eventId: event.id,
        userId: user.id,
        registrationType: regType,
        teamId,
      });

      setConfirmedReg(reg);
      setExistingReg(reg);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Registration failed:', err);
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Poster */}
      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
        <img
          src={event.poster_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded shadow-sm ${getCategoryBadgeClass(event.category)}`}>
              {event.category}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-white/90 text-slate-800 uppercase shadow-sm">
              {event.event_format}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">About the Event</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
              <span className="font-semibold text-slate-400 uppercase text-[10px] block">Schedule</span>
              <p><strong className="text-slate-900">Starts:</strong> {formatDateTime(event.start_at)}</p>
              <p><strong className="text-slate-900">Ends:</strong> {formatDateTime(event.end_at)}</p>
              <p className="text-red-600 pt-1">
                <strong>Deadline:</strong> {formatDateTime(event.registration_deadline)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
              <span className="font-semibold text-slate-400 uppercase text-[10px] block">Location & Organizer</span>
              <p><strong className="text-slate-900">Mapped Venue:</strong> {event.venue}</p>
              <p><strong className="text-slate-900">Format:</strong> {event.event_format.toUpperCase()}</p>
              <p><strong className="text-slate-900">Organized by:</strong> {event.organizer_name}</p>
            </div>
          </div>

          {/* PCDP Eligibility Criteria Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 uppercase text-[10px] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Participation Eligibility
              </span>
              {event.eligibility_type === 'pcdp_skill' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  PCDP Skill Prerequisite
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Open FCFS Entry
                </span>
              )}
            </div>

            {event.eligibility_type === 'pcdp_skill' ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-700">
                  Prerequisite: <strong className="text-slate-900">{event.required_skill} Level {event.required_skill_level}</strong> cleared on the BIT Sathy PCDP Portal.
                </div>

                {user ? (
                  <div className={'p-3 rounded-lg border text-xs flex items-start space-x-2.5 ' + (
                    eligibility.eligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  )}>
                    {eligibility.eligible ? (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-800">PCDP Verified: Eligible to Participate</div>
                          <div className="text-[11px] text-emerald-700">
                            {user.display_name} has verified completion of {event.required_skill} Level {eligibility.currentLevel} ({eligibility.slot || 'PCDP Slot'}).
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-bold text-amber-800">Prerequisite Not Met</div>
                          <div className="text-[11px] text-amber-700">
                            Required: {event.required_skill} Level {event.required_skill_level} | Your Current Status: Level {eligibility.currentLevel || 0}.
                          </div>
                          <a
                            href="https://ps.bitsathy.ac.in"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:underline text-[10px] font-semibold pt-0.5"
                          >
                            <span>Go to ps.bitsathy.ac.in to take slot test</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Sign in with your student account or Google Mail to automatically verify your PCDP skill level.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                This event is open on a First-Come-First-Served basis to all registered college students.
              </p>
            )}
          </div>

          {event.eligibility_rules && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Eligibility Requirements</span>
              </h3>
              <p className="text-xs text-slate-600">{event.eligibility_rules}</p>
            </div>
          )}

          {event.event_rules && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Event Rules</span>
              </h3>
              <p className="text-xs text-slate-600 whitespace-pre-line">{event.event_rules}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 sticky top-20">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Registration Status
              </span>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  {isCancelled ? 'Cancelled' : isFull ? 'Event Full' : isPastDeadline ? 'Closed' : 'Open'}
                </span>
                <span className="text-xs text-slate-500">
                  {remainingSlots} spots left
                </span>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Seats Filled</span>
                <span className="text-slate-800 font-medium">{event.registered_count} / {event.capacity}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-800 font-medium">
                  {allowsTeams ? `Squad (${event.minimum_team_size}-${event.maximum_team_size} members)` : 'Individual'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Venue:</span>
                <span className="text-blue-600 font-medium truncate max-w-[140px]">{event.venue}</span>
              </div>
            </div>

            {existingReg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <UserCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">You are Registered</h4>
                  <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                    Registration ID: {existingReg.public_registration_id}
                  </p>
                </div>
                <Link
                  to="/student/registrations"
                  className="w-full inline-block py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition mt-1 shadow-sm"
                >
                  Enter Venue OTP in My Registrations
                </Link>
              </div>
            ) : canRegister ? (
              <button
                onClick={handleOpenRegister}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                Register for Event
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Registration Closed</span>
              </button>
            )}

            <p className="text-[10px] text-slate-500 text-center">
              Attendance will be verified directly at {event.venue} using the Venue OTP.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setConfirmedReg(null);
        }}
        title={confirmedReg ? 'Registration Successful' : `Register: ${event.title}`}
      >
        {confirmedReg ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Registration Confirmed</h4>
              <p className="text-xs text-slate-500">
                Assigned Registration ID:
              </p>
              <p className="font-mono text-sm font-bold text-blue-600">
                {confirmedReg.public_registration_id}
              </p>
              <p className="text-xs text-slate-600 pt-1">
                When you arrive at <strong>{event.venue}</strong>, check in using the Venue OTP.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <Link
                to="/student/registrations"
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to My Registrations
              </Link>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {regError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {regError}
              </div>
            )}

            {allowsTeams && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Registration Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegType('individual')}
                    className={`p-3 rounded-lg border text-left text-xs ${
                      regType === 'individual'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegType('team')}
                    className={`p-3 rounded-lg border text-left text-xs ${
                      regType === 'team'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Squad Lead
                  </button>
                </div>
              </div>
            )}

            {regType === 'team' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Neural Knights"
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <p><strong>Registrant:</strong> {user?.display_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
              >
                {submitting ? 'Confirming...' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* PCDP Ineligible Modal */}
      <Modal
        isOpen={isEligibleModalOpen}
        onClose={() => setIsEligibleModalOpen(false)}
        title="Eligibility Criteria Notice"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Registration Blocked by PCDP Criteria</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              This event requires participants to have cleared <strong>{event.required_skill} Level {event.required_skill_level}</strong> on the college PCDP Portal (<strong>ps.bitsathy.ac.in</strong>).
            </p>
            <div className="pt-1 text-[11px] text-amber-700">
              Your Current Verified Status: <strong className="text-slate-900">Level {eligibility.currentLevel || 0}</strong>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href="https://ps.bitsathy.ac.in"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition text-center"
            >
              <span>Open PCDP Portal (ps.bitsathy.ac.in)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Demo Testing Shortcuts:
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    pcdpService.updateStudentSkill(user.email, event.required_skill, event.required_skill_level);
                    setIsEligibleModalOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left transition flex items-center justify-between"
                >
                  <span>✓ Simulate Passing {event.required_skill} Level {event.required_skill_level}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Upgrade</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await authService.signInWithGoogle('sanjaypravinr.cs25@bitsathy.ac.in');
                    window.location.reload();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-left transition flex items-center justify-between"
                >
                  <span>👤 Switch to SANJAYPRAVIN (Level 2 Passed)</span>
                  <span className="text-[10px] uppercase font-bold text-purple-700">Switch User</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEligibleModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

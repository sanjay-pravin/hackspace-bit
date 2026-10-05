import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registrationService';
import { attendanceService } from '../services/attendanceService';
import { formatDate, formatTime } from '../utils/formatters';
import { 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Venue OTP Check-in Modal
  const [otpTarget, setOtpTarget] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await registrationService.getUserRegistrations(user.id);
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !user) return;
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(cancelTarget.id, user.id);
      setCancelTarget(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenOtpModal = (reg) => {
    setOtpTarget(reg);
    setEnteredOtp('');
    setOtpError('');
    setOtpSuccess(null);
  };

  const handleOtpCheckIn = async (e) => {
    e.preventDefault();
    if (!otpTarget || !user) return;
    setVerifyingOtp(true);
    setOtpError('');

    try {
      const res = await attendanceService.verifyVenueOtp({
        registrationId: otpTarget.id,
        otp: enteredOtp.trim(),
        userId: user.id,
      });

      if (!res.success) {
        setOtpError(res.message);
        return;
      }

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setOtpSuccess(res);
      await loadData();
    } catch (err) {
      setOtpError(err.message || 'Failed to record attendance');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const isAttended = r.hasAttended || r.status === 'attended';
    if (filter === 'confirmed') return r.status === 'confirmed' && !isAttended;
    if (filter === 'attended') return isAttended;
    if (filter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Registrations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your confirmed registrations and enter the Venue OTP when you arrive to mark attendance Present.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 border-b border-slate-200 pb-2 text-xs">
        {[
          { key: 'all', label: `All (${registrations.length})` },
          { key: 'confirmed', label: `Upcoming (${registrations.filter(r => r.status === 'confirmed' && !r.hasAttended).length})` },
          { key: 'attended', label: `Present at Venue (${registrations.filter(r => r.hasAttended || r.status === 'attended').length})` },
          { key: 'cancelled', label: `Cancelled (${registrations.filter(r => r.status === 'cancelled').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <LoadingState message="Loading your registrations..." />
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations found"
          description="Browse upcoming campus events to register individually or as a squad."
          action={
            <Link
              to="/events"
              className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              Explore Events
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRegistrations.map((reg) => {
            const isCancelled = reg.status === 'cancelled';
            const isAttended = reg.hasAttended || reg.status === 'attended';
            const isTeam = reg.registration_type === 'team' || Boolean(reg.team_id);

            return (
              <div
                key={reg.id}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      ID: {reg.public_registration_id}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {reg.event?.category}
                    </span>

                    {isAttended ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>PRESENT at Venue</span>
                      </span>
                    ) : isCancelled ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-800 border border-red-200">
                        Cancelled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Registered • Awaiting Venue OTP
                      </span>
                    )}

                    {isTeam && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-50 text-purple-800 border border-purple-200 flex items-center space-x-1">
                        <Users className="w-3 h-3 text-purple-600" />
                        <span>Squad Entry</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{reg.event?.title}</h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(reg.event?.start_at)} ({formatTime(reg.event?.start_at)})</span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Venue: <strong>{reg.event?.venue}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clean Actions without pass option */}
                <div className="flex items-center space-x-2 shrink-0">
                  {!isCancelled && !isAttended && (
                    <button
                      onClick={() => handleOpenOtpModal(reg)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Enter Venue OTP</span>
                    </button>
                  )}

                  {!isCancelled && !isAttended && (
                    <button
                      onClick={() => setCancelTarget(reg)}
                      className="px-2.5 py-2 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Venue OTP Check-in Modal */}
      <Modal
        isOpen={Boolean(otpTarget)}
        onClose={() => setOtpTarget(null)}
        title="Event Venue Attendance Check-in"
      >
        {otpSuccess ? (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Attendance Confirmed: PRESENT</h3>
              <p className="text-xs text-slate-600">
                You have been marked present at venue: <strong className="text-slate-900">{otpSuccess.venue}</strong>
              </p>
              {otpSuccess.isTeam && (
                <p className="text-xs text-purple-700">
                  Squad attendance mapped for: <strong>{otpSuccess.teamName || 'Your Squad'}</strong>
                </p>
              )}
            </div>
            <button
              onClick={() => setOtpTarget(null)}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleOtpCheckIn} className="space-y-4">
            {otpError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <p className="font-semibold text-slate-900">{otpTarget?.event?.title}</p>
              <div className="flex items-center space-x-1.5 text-blue-600">
                <MapPin className="w-3.5 h-3.5" />
                <span>Mapped Venue: <strong>{otpTarget?.event?.venue}</strong></span>
              </div>
              {otpTarget?.registration_type === 'team' && (
                <p className="text-purple-700 text-[11px] pt-0.5">
                  * Squad registration: Entering this OTP marks the entire team present at the venue.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter 6-Digit Venue Check-in OTP *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 849201"
                className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-center font-mono text-xl tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Look for the 6-digit code displayed at the entrance</span>
                {otpTarget?.event?.venue_otp && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Code: {otpTarget.event.venue_otp}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyingOtp || enteredOtp.length !== 6}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-sm"
              >
                {verifyingOtp ? 'Verifying...' : 'Mark Present at Venue'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Registration"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            Cancel registration for <strong className="text-slate-900">{cancelTarget?.event?.title}</strong>? Your slot will be released for other students.
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setCancelTarget(null)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
            >
              Keep
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-3 py-1.5 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
            >
              {cancelling ? 'Cancelling...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

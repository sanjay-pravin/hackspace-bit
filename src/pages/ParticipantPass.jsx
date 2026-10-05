import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { registrationService } from '../services/registrationService';
import { attendanceService } from '../services/attendanceService';
import { 
  Calendar, 
  MapPin, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Users,
  Building2,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';

export default function ParticipantPass() {
  const { registrationId } = useParams();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Venue OTP modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(null);

  const loadPass = async () => {
    setLoading(true);
    try {
      const data = await registrationService.getRegistrationById(registrationId);
      setPassData(data);
    } catch (err) {
      console.error('Failed to load participant pass:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPass();
  }, [registrationId]);

  const handleOtpCheckIn = async (e) => {
    e.preventDefault();
    if (!passData) return;
    setVerifyingOtp(true);
    setOtpError('');

    try {
      const res = await attendanceService.verifyVenueOtp({
        registrationId: passData.id,
        otp: enteredOtp.trim(),
        userId: passData.user_id,
      });

      if (!res.success) {
        setOtpError(res.message);
        return;
      }

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setOtpSuccess(res);
      await loadPass();
    } catch (err) {
      setOtpError(err.message || 'Verification error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) return <div className="py-24"><LoadingState message="Loading participant credential..." /></div>;

  if (!passData) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Pass Not Found</h2>
        <p className="text-xs text-slate-400">The requested pass could not be retrieved.</p>
        <Link to="/student/registrations" className="inline-block px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white">
          Back to Registrations
        </Link>
      </div>
    );
  }

  const { event, profile, team, attendance } = passData;
  const isCancelled = passData.status === 'cancelled';
  const isAttended = Boolean(attendance || passData.status === 'attended');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Top Nav & Print Actions */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/student/registrations"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Passes</span>
        </Link>

        <div className="flex items-center space-x-2">
          {!isCancelled && !isAttended && (
            <button
              onClick={() => {
                setEnteredOtp('');
                setOtpError('');
                setOtpSuccess(null);
                setIsOtpModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enter Venue OTP</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Clean Subtle Ticket Card */}
      <div
        id="printable-pass"
        className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl"
      >
        {/* Subtle Top Strip */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              ACE
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-tight">AI Campus Event Assistant</p>
              <p className="text-[10px] text-slate-400">Official Participant Pass</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">Registration Code</span>
            <span className="font-mono text-xs font-bold text-cyan-400">{passData.public_registration_id}</span>
          </div>
        </div>

        {/* Status Banner */}
        {isAttended ? (
          <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-6 py-2 text-xs text-emerald-300 flex items-center justify-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Attendance Status: PRESENT at Venue ({event?.venue})</span>
          </div>
        ) : isCancelled ? (
          <div className="bg-red-950/80 border-b border-red-800/60 px-6 py-2 text-xs text-red-300 text-center font-medium">
            Notice: This Registration Has Been Cancelled
          </div>
        ) : (
          <div className="bg-slate-800/40 border-b border-slate-800 px-6 py-1.5 text-[11px] text-slate-400 text-center flex items-center justify-center space-x-2">
            <span>Awaiting venue check-in. Use the Venue OTP or scan QR at gate entrance.</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="inline-block px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-medium mb-1.5">
                {event?.category}
              </span>
              <h1 className="text-lg font-bold text-white leading-snug">{event?.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">Organized by {event?.organizer_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formatDate(event?.start_at)} ({formatTime(event?.start_at)})</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Mapped Venue: <strong>{event?.venue}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase text-slate-500">Student Name</span>
                <p className="font-semibold text-white mt-0.5">{profile?.display_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{profile?.department}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500">Roll / ID Number</span>
                <p className="font-mono text-cyan-300 font-semibold mt-0.5">{profile?.student_id || 'Campus Member'}</p>
                <p className="text-[11px] text-slate-400">{profile?.academic_year}</p>
              </div>
            </div>

            {team && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-purple-300">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Squad: <strong>{team.name}</strong></span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Code: {team.team_code}</span>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-950 space-y-2">
            <QRCodeSVG
              value={passData.qr_payload || passData.public_registration_id}
              size={135}
              level="H"
            />
            <div className="text-center">
              <p className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                {passData.public_registration_id}
              </p>
              <p className="text-[9px] text-slate-500">Venue Gate Barcode</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800/80 flex items-center justify-between">
          <span>Vision Builders • HACKSPACE Hackathon Verified</span>
          <span>Registered: {formatDate(passData.registered_at)}</span>
        </div>
      </div>

      {/* Venue OTP Modal */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Enter Venue OTP"
      >
        {otpSuccess ? (
          <div className="py-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Attendance Verified: PRESENT</h3>
            <p className="text-xs text-slate-300">
              Successfully checked in at <strong className="text-white">{otpSuccess.venue}</strong>
            </p>
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleOtpCheckIn} className="space-y-3.5">
            {otpError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {otpError}
              </div>
            )}
            <div className="p-3 rounded-lg bg-slate-950 text-xs space-y-1">
              <p className="font-semibold text-white">{event?.title}</p>
              <p className="text-cyan-400">Venue: {event?.venue}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue 6-Digit Check-in OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 849201"
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {event?.venue_otp && (
                <p className="text-[10px] text-slate-500 mt-1 text-right font-mono">
                  Venue Code: {event.venue_otp}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyingOtp || enteredOtp.length !== 6}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying...' : 'Mark Present'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
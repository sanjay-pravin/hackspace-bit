import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  CameraOff, 
  MapPin, 
  RefreshCw,
  KeyRound,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatDate } from '../utils/formatters';

export default function Attendance() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Camera Scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const qrRegionId = 'qr-reader-region';
  const html5QrCodeRef = useRef(null);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  useEffect(() => {
    async function initData() {
      try {
        const [allEvents, logs] = await Promise.all([
          eventService.getAllAdminEvents(),
          attendanceService.getRecentAttendance(),
        ]);
        setEvents(allEvents);
        if (allEvents.length > 0) setSelectedEventId(allEvents[0].id);
        setRecentLogs(logs);
      } catch (err) {
        console.error('Error initializing attendance portal:', err);
      }
    }
    initData();
  }, []);

  const handleVerify = async (codeOrPayload) => {
    if (!codeOrPayload || !codeOrPayload.trim()) return;
    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await attendanceService.verifyAndCheckIn({
        codeOrPayload: codeOrPayload.trim(),
        eventId: selectedEventId,
        staffUserId: user?.id || 'staff-admin',
      });

      setVerificationResult(result);
      const updatedLogs = await attendanceService.getRecentAttendance(selectedEventId);
      setRecentLogs(updatedLogs);
    } catch (err) {
      setVerificationResult({
        success: false,
        status: 'ERROR',
        message: err.message || 'System verification error',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRegenerateOtp = async () => {
    if (!activeEvent) return;
    try {
      const updated = await eventService.regenerateVenueOtp(activeEvent.id);
      setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    } catch (err) {
      alert('Error updating OTP: ' + err.message);
    }
  };

  const handleCopyOtp = () => {
    if (!activeEvent?.venue_otp) return;
    navigator.clipboard.writeText(activeEvent.venue_otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Camera Scanner
  const startCamera = async () => {
    setCameraError('');
    try {
      setIsCameraActive(true);
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleVerify(decodedText);
          stopCamera();
        },
        () => {}
      );
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      setCameraError('Camera access unavailable or permission denied. Please use manual code lookup.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Venue Gate & Attendance Operations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast venue check-in OTPs, verify attendee passes, and map attendance to event venues.
          </p>
        </div>

        {/* Event selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Venue OTP Broadcast Card */}
      {activeEvent && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Gate Session
              </span>
              <span className="text-xs font-semibold text-white">{activeEvent.title}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assigned Venue: <strong className="text-white">{activeEvent.venue}</strong></span>
            </div>
            <p className="text-[11px] text-slate-500">
              Students and squads entering this OTP will have attendance mapped as <strong>PRESENT</strong> at this venue.
            </p>
          </div>

          {/* OTP Box */}
          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-500 block">Venue Check-in OTP</span>
              <span className="font-mono text-2xl font-black text-emerald-400 tracking-wider">
                {activeEvent.venue_otp || '849201'}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <button
                onClick={handleCopyOtp}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Copy OTP"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRegenerateOtp}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Generate fresh OTP"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Scanner & Manual Entry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: QR Scanner */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Camera QR Scanner</span>
            </h3>
            <p className="text-xs text-slate-400">
              Scan participant pass barcodes presented at the entrance.
            </p>
          </div>

          <div className="relative aspect-video max-h-56 w-full rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
            <div id={qrRegionId} className="w-full h-full" />
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-950/80">
                <QrCode className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400">Camera currently off</p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg">{cameraError}</p>
          )}

          <div>
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera Scanner</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Manual Lookup & Scenario Switcher */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Manual Registration ID Check-in</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(manualCode);
              }}
              className="space-y-2.5"
            >
              <input
                type="text"
                required
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. ACE-2026-X89K2L"
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-50"
              >
                {verifying ? 'Checking database...' : 'Verify Pass'}
              </button>
            </form>

            {/* Quick Demo scenarios */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Quick Demo Pass Codes</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setManualCode('ACE-2026-X89K2L');
                    handleVerify('ACE-2026-X89K2L');
                  }}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                >
                  ACE-2026-X89K2L (Alex / Neural Knights)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualCode('ACE-2026-C44T9Q');
                    handleVerify('ACE-2026-C44T9Q');
                  }}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ACE-2026-C44T9Q
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500">
            Signed in as Staff: {user?.display_name}
          </div>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationResult && (
        <div className="animate-in fade-in duration-200">
          {verificationResult.status === 'VERIFIED' && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ATTENDANCE RECORDED: PRESENT AT {verificationResult.participant?.venue}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500">Student:</span>
                  <p className="font-semibold text-white">{verificationResult.participant?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Pass Code:</span>
                  <p className="font-mono text-cyan-300 font-semibold">{verificationResult.participant?.registrationId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Squad:</span>
                  <p className="font-semibold text-purple-300">{verificationResult.participant?.teamName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Time:</span>
                  <p>{formatTime(verificationResult.record?.checked_in_at)}</p>
                </div>
              </div>
            </div>
          )}

          {verificationResult.status === 'ALREADY_CHECKED_IN' && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{verificationResult.message}</span>
            </div>
          )}

          {(verificationResult.status === 'CANCELLED' || verificationResult.status === 'NOT_FOUND') && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{verificationResult.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Attendance Gate Log */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Live Gate Attendance Records</h3>
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Pass ID</th>
                <th className="py-2.5 px-3">Attendee</th>
                <th className="py-2.5 px-3">Mapped Venue</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono font-bold text-cyan-400">{log.registrationId}</td>
                  <td className="py-2 px-3 font-medium text-white">{log.studentName}</td>
                  <td className="py-2 px-3 text-slate-300">{log.venue}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                      {log.verification_method === 'venue_otp' ? 'Venue OTP' : 'QR Scan'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-emerald-400 font-semibold text-[11px]">PRESENT</span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{formatTime(log.checked_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
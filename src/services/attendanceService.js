import { localDb } from './supabase';
import { parseQrPayload } from '../utils/qr';
import { notificationService } from './notificationService';

export const attendanceService = {
  // Method 1: Venue OTP Check-in (Used by attendees at the venue)
  async verifyVenueOtp({ registrationId, otp, userId }) {
    if (!registrationId || !otp) {
      return { success: false, status: 'INVALID', message: 'Registration ID and Venue OTP are required.' };
    }

    const cleanOtp = otp.toString().trim();
    const registrations = localDb.getRegistrations();
    const regIdx = registrations.findIndex(
      r => r.id === registrationId || r.public_registration_id === registrationId
    );

    if (regIdx === -1) {
      return { success: false, status: 'NOT_FOUND', message: 'Registration not found in database.' };
    }

    const reg = registrations[regIdx];

    // Check if cancelled
    if (reg.status === 'cancelled') {
      return {
        success: false,
        status: 'CANCELLED',
        message: 'Cannot record attendance. This registration was cancelled.',
      };
    }

    // Check if already checked in
    const attendanceRecords = localDb.getAttendance();
    const existing = attendanceRecords.find(a => a.registration_id === reg.id);
    if (existing) {
      const timeStr = new Date(existing.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        success: false,
        status: 'ALREADY_CHECKED_IN',
        message: `Already marked PRESENT at "${existing.venue_name || 'Event Venue'}" at ${timeStr}.`,
        checkedInAt: existing.checked_in_at,
        venue: existing.venue_name,
      };
    }

    // Find the event
    const events = localDb.getEvents();
    const event = events.find(e => e.id === reg.event_id);
    if (!event) {
      return { success: false, status: 'ERROR', message: 'Associated event could not be located.' };
    }

    // Verify OTP matches the event venue OTP
    const expectedOtp = event.venue_otp || '849201';
    if (cleanOtp !== expectedOtp.trim()) {
      return {
        success: false,
        status: 'INVALID_OTP',
        message: `Incorrect Venue OTP. Please check the 6-digit code displayed at "${event.venue}".`,
      };
    }

    // Check-in succeeds! Map attendance to the event venue
    const team = reg.team_id ? localDb.getTeams().find(t => t.id === reg.team_id) : null;
    const student = localDb.getProfiles().find(p => p.id === reg.user_id) || {};

    const newAttendance = {
      id: `att-${Date.now()}`,
      registration_id: reg.id,
      event_id: reg.event_id,
      venue_name: event.venue,
      checked_in_at: new Date().toISOString(),
      checked_in_by: userId || reg.user_id,
      verification_method: 'venue_otp',
      team_id: reg.team_id || null,
      team_name: team ? team.name : null,
      is_demonstration: false,
    };

    attendanceRecords.unshift(newAttendance);
    localDb.saveAttendance(attendanceRecords);

    // Update registration status to attended
    registrations[regIdx].status = 'attended';
    localDb.saveRegistrations(registrations);

    // Notify student
    await notificationService.createNotification({
      userId: reg.user_id,
      title: 'Attendance Confirmed: PRESENT',
      message: `Your attendance has been verified and recorded at venue: "${event.venue}" via Venue OTP.`,
      notificationType: 'general',
      relatedEventId: event.id,
    });

    return {
      success: true,
      status: 'VERIFIED',
      message: `Marked PRESENT at ${event.venue}`,
      venue: event.venue,
      teamName: team ? team.name : null,
      isTeam: Boolean(team),
      record: newAttendance,
      participant: {
        registrationId: reg.public_registration_id,
        name: student.display_name,
        eventTitle: event.title,
        venue: event.venue,
        teamName: team ? team.name : 'Individual',
        timestamp: newAttendance.checked_in_at,
        verificationMethod: 'Venue OTP',
      }
    };
  },

  // Method 2: Gate QR Scanner & Manual Lookup (Used by Gate Staff)
  async verifyAndCheckIn({ codeOrPayload, eventId, staffUserId }) {
    if (!codeOrPayload) {
      return { success: false, status: 'INVALID', message: 'No registration ID or QR code provided.' };
    }

    const parsed = parseQrPayload(codeOrPayload);
    const regIdToFind = parsed.registrationId;

    const registrations = localDb.getRegistrations();
    const regIdx = registrations.findIndex(
      r => r.public_registration_id === regIdToFind || r.id === regIdToFind
    );

    if (regIdx === -1) {
      return {
        success: false,
        status: 'NOT_FOUND',
        message: `Registration ID "${regIdToFind}" was not found in the database.`,
      };
    }

    const reg = registrations[regIdx];

    // Verify Event Match
    if (eventId && eventId !== 'All' && reg.event_id !== eventId) {
      const regEvent = localDb.getEvents().find(e => e.id === reg.event_id);
      return {
        success: false,
        status: 'WRONG_EVENT',
        message: `This pass is registered for "${regEvent?.title || 'Another Event'}", not the selected event.`,
      };
    }

    if (reg.status === 'cancelled') {
      return {
        success: false,
        status: 'CANCELLED',
        message: `Registration ${reg.public_registration_id} was cancelled by the student or administrator.`,
      };
    }

    const attendanceRecords = localDb.getAttendance();
    const existingCheckin = attendanceRecords.find(a => a.registration_id === reg.id);
    if (existingCheckin) {
      const checkedInTime = new Date(existingCheckin.checked_in_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        success: false,
        status: 'ALREADY_CHECKED_IN',
        message: `Participant was ALREADY marked Present at ${checkedInTime} at ${existingCheckin.venue_name || 'Venue'}.`,
        checkedInAt: existingCheckin.checked_in_at,
        registration: reg,
      };
    }

    const student = localDb.getProfiles().find(p => p.id === reg.user_id) || {};
    const event = localDb.getEvents().find(e => e.id === reg.event_id) || {};
    const team = reg.team_id ? localDb.getTeams().find(t => t.id === reg.team_id) : null;

    const newAttendance = {
      id: `att-${Date.now()}`,
      registration_id: reg.id,
      event_id: reg.event_id,
      venue_name: event.venue || 'Campus Venue',
      checked_in_at: new Date().toISOString(),
      checked_in_by: staffUserId || 'staff-admin',
      verification_method: codeOrPayload.startsWith('ACE-VERIFY') ? 'qr_scanner' : 'manual_code',
      team_id: reg.team_id || null,
      team_name: team ? team.name : null,
      is_demonstration: false,
    };

    attendanceRecords.unshift(newAttendance);
    localDb.saveAttendance(attendanceRecords);

    registrations[regIdx].status = 'attended';
    localDb.saveRegistrations(registrations);

    return {
      success: true,
      status: 'VERIFIED',
      message: `Verified and Marked PRESENT at ${event.venue || 'Venue'}`,
      record: newAttendance,
      participant: {
        registrationId: reg.public_registration_id,
        name: student.display_name,
        email: student.email,
        studentId: student.student_id,
        department: student.department,
        teamName: team ? team.name : 'Individual',
        eventTitle: event.title,
        venue: event.venue,
        timestamp: newAttendance.checked_in_at,
        verificationMethod: newAttendance.verification_method,
      }
    };
  },

  async getRecentAttendance(eventId = null) {
    let records = localDb.getAttendance();
    if (eventId && eventId !== 'All') {
      records = records.filter(a => a.event_id === eventId);
    }
    const registrations = localDb.getRegistrations();
    const profiles = localDb.getProfiles();
    const events = localDb.getEvents();

    return records.map(att => {
      const reg = registrations.find(r => r.id === att.registration_id) || {};
      const student = profiles.find(p => p.id === reg.user_id) || {};
      const event = events.find(e => e.id === att.event_id) || {};

      return {
        ...att,
        registrationId: reg.public_registration_id,
        studentName: student.display_name || 'Anonymous',
        studentEmail: student.email,
        department: student.department,
        eventTitle: event.title,
        venue: att.venue_name || event.venue,
      };
    }).sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at));
  }
};
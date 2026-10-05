import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { generateRegistrationId } from '../utils/formatters';
import { createQrPayload } from '../utils/qr';
import { notificationService } from './notificationService';
import { pcdpService } from './pcdpService';

export const registrationService = {
  async registerForEvent({ eventId, userId, teamId = null, registrationType = 'individual' }) {
    if (!eventId || !userId) {
      throw new Error('Event ID and User ID are required for registration.');
    }

    // 1. Get Event and verify availability
    let event = null;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error || !data) throw new Error('Event not found.');
      event = data;
    } else {
      event = localDb.getEvents().find(e => e.id === eventId);
    }
    if (!event) throw new Error('Event not found.');

    // Check event status
    if (event.status !== 'published') {
      throw new Error(`This event is currently ${event.status} and cannot accept registrations.`);
    }

    // Check deadline
    if (new Date(event.registration_deadline) < new Date()) {
      throw new Error('Registration deadline has passed.');
    }

    // Check capacity
    if (event.registered_count >= event.capacity) {
      throw new Error('Event has reached maximum capacity.');
    }

    // Check duplicate registration
    let existingReg = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .maybeSingle();
      existingReg = data;
    } else {
      existingReg = localDb.getRegistrations().find(
        r => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed'
      );
    }

    if (existingReg) {
      throw new Error('You are already registered for this event.');
    }

    // Check PCDP Skill Eligibility criteria
    if (event.eligibility_type === 'pcdp_skill') {
      let userProfile = null;
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        userProfile = data;
      } else {
        userProfile = localDb.getProfiles().find(p => p.id === userId);
      }

      const eligibility = pcdpService.checkEventEligibility(event, userProfile?.email || userId);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason || ('Ineligible: Requires ' + event.required_skill + ' Level ' + event.required_skill_level + ' on PCDP Portal.'));
      }
    }

    // Generate public ID and QR payload
    const publicRegistrationId = generateRegistrationId();
    const qrPayload = createQrPayload(publicRegistrationId, eventId, userId);

    const newRegistration = {
      id: `reg-${Date.now()}`,
      public_registration_id: publicRegistrationId,
      event_id: eventId,
      user_id: userId,
      team_id: teamId,
      registration_type: registrationType,
      status: 'confirmed',
      qr_payload: qrPayload,
      registered_at: new Date().toISOString(),
      cancelled_at: null,
      is_demonstration: false,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('registrations').insert(newRegistration).select().single();
      if (error) throw error;
      // Increment capacity
      await supabase.from('events').update({ registered_count: event.registered_count + 1 }).eq('id', eventId);
      return data;
    }

    // Local DB save
    const registrations = localDb.getRegistrations();
    registrations.unshift(newRegistration);
    localDb.saveRegistrations(registrations);

    // Update event registered_count
    const events = localDb.getEvents();
    const evtIdx = events.findIndex(e => e.id === eventId);
    if (evtIdx !== -1) {
      events[evtIdx].registered_count += 1;
      localDb.saveEvents(events);
    }

    // Dispatch automatic in-app notification
    await notificationService.createNotification({
      userId,
      title: 'Registration Confirmed!',
      message: `You have successfully secured a spot for "${event.title}". Access your digital participant pass anytime from your dashboard.`,
      notificationType: 'registration',
      relatedEventId: eventId,
    });

    return newRegistration;
  },

  async cancelRegistration(registrationId, userId) {
    let reg = null;
    const registrations = localDb.getRegistrations();
    const idx = registrations.findIndex(r => r.id === registrationId);
    if (idx === -1) throw new Error('Registration not found.');
    reg = registrations[idx];

    if (reg.user_id !== userId) {
      throw new Error('Unauthorized to cancel this registration.');
    }
    if (reg.status === 'cancelled') {
      throw new Error('This registration is already cancelled.');
    }

    reg.status = 'cancelled';
    reg.cancelled_at = new Date().toISOString();
    localDb.saveRegistrations(registrations);

    // Decrement capacity
    const events = localDb.getEvents();
    const evtIdx = events.findIndex(e => e.id === reg.event_id);
    if (evtIdx !== -1 && events[evtIdx].registered_count > 0) {
      events[evtIdx].registered_count -= 1;
      localDb.saveEvents(events);
    }

    await notificationService.createNotification({
      userId,
      title: 'Registration Cancelled',
      message: 'Your registration has been cancelled. Your slot has been returned to the campus pool.',
      notificationType: 'general',
      relatedEventId: reg.event_id,
    });

    return reg;
  },

  async getUserRegistrations(userId) {
    const registrations = localDb.getRegistrations().filter(r => r.user_id === userId);
    const events = localDb.getEvents();
    const attendance = localDb.getAttendance();

    return registrations.map(reg => {
      const event = events.find(e => e.id === reg.event_id) || {};
      const attended = attendance.some(a => a.registration_id === reg.id);
      return {
        ...reg,
        event,
        hasAttended: attended,
      };
    });
  },

  async getRegistrationById(registrationId) {
    const reg = localDb.getRegistrations().find(
      r => r.id === registrationId || r.public_registration_id === registrationId
    );
    if (!reg) return null;
    const event = localDb.getEvents().find(e => e.id === reg.event_id);
    const profile = localDb.getProfiles().find(p => p.id === reg.user_id);
    const team = reg.team_id ? localDb.getTeams().find(t => t.id === reg.team_id) : null;
    const attendanceRecord = localDb.getAttendance().find(a => a.registration_id === reg.id);

    return {
      ...reg,
      event,
      profile,
      team,
      attendance: attendanceRecord,
    };
  },

  async getAllParticipantsForAdmin({ eventId = 'All', status = 'All', search = '' } = {}) {
    const registrations = localDb.getRegistrations();
    const events = localDb.getEvents();
    const profiles = localDb.getProfiles();
    const attendance = localDb.getAttendance();
    const teams = localDb.getTeams();

    let combined = registrations.map(reg => {
      const event = events.find(e => e.id === reg.event_id) || {};
      const student = profiles.find(p => p.id === reg.user_id) || {};
      const isCheckedIn = attendance.some(a => a.registration_id === reg.id);
      const team = reg.team_id ? teams.find(t => t.id === reg.team_id) : null;

      return {
        id: reg.id,
        public_registration_id: reg.public_registration_id,
        event_id: reg.event_id,
        event_title: event.title || 'Unknown Event',
        student_id: student.student_id || 'N/A',
        student_name: student.display_name || 'Anonymous Student',
        student_email: student.email || 'N/A',
        department: student.department || 'N/A',
        academic_year: student.academic_year || 'N/A',
        team_name: team ? team.name : 'Individual',
        registration_type: reg.registration_type,
        status: reg.status,
        isCheckedIn,
        registered_at: reg.registered_at,
        is_demonstration: reg.is_demonstration || false,
      };
    });

    if (eventId && eventId !== 'All') {
      combined = combined.filter(p => p.event_id === eventId);
    }
    if (status && status !== 'All') {
      if (status === 'attended') {
        combined = combined.filter(p => p.isCheckedIn);
      } else {
        combined = combined.filter(p => p.status === status);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      combined = combined.filter(
        p =>
          p.student_name.toLowerCase().includes(q) ||
          p.public_registration_id.toLowerCase().includes(q) ||
          p.student_email.toLowerCase().includes(q) ||
          p.student_id.toLowerCase().includes(q) ||
          p.event_title.toLowerCase().includes(q)
      );
    }

    return combined;
  }
};
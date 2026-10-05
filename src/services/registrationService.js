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
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (!error && data) event = data;
        else event = localDb.getEvents().find(e => e.id === eventId);
      } catch {
        event = localDb.getEvents().find(e => e.id === eventId);
      }
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

    // Check duplicate registration for THIS exact event
    let existingReg = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .eq('status', 'confirmed')
          .maybeSingle();
        existingReg = data;
      } catch {
        existingReg = localDb.getRegistrations().find(
          r => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed'
        );
      }
    } else {
      existingReg = localDb.getRegistrations().find(
        r => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed'
      );
    }

    if (existingReg) {
      throw new Error('You are already registered for this event.');
    }

    // SCHEDULE CONFLICT CHECK:
    // "if the student registered for one event at the time the other event on the same time should not show it / cannot register"
    const userRegs = await this.getUserRegistrations(userId);
    const confirmedRegs = userRegs.filter(r => r.status === 'confirmed' && r.event_id !== eventId);
    const targetStart = new Date(event.start_at).getTime();
    const targetEnd = new Date(event.end_at).getTime();

    for (const reg of confirmedRegs) {
      const regEvent = reg.event;
      if (!regEvent?.start_at || !regEvent?.end_at) continue;
      const regStart = new Date(regEvent.start_at).getTime();
      const regEnd = new Date(regEvent.end_at).getTime();

      // Time overlap condition
      if (targetStart < regEnd && targetEnd > regStart) {
        throw new Error(
          `Schedule Conflict: You are already registered for "${regEvent.title}" which takes place during this exact time slot. Simultaneous registrations are not permitted.`
        );
      }
    }

    // Check PCDP Skill Eligibility criteria
    if (event.eligibility_type === 'pcdp_skill') {
      let userProfile = null;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
          userProfile = data;
        } catch {
          userProfile = localDb.getProfiles().find(p => p.id === userId);
        }
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
      try {
        const { data, error } = await supabase.from('registrations').insert(newRegistration).select().single();
        if (!error && data) {
          await supabase.from('events').update({ registered_count: event.registered_count + 1 }).eq('id', eventId);
          return data;
        }
      } catch (e) {
        console.warn('Supabase register fallback:', e);
      }
    }

    // Local fallback
    const registrations = localDb.getRegistrations();
    registrations.push(newRegistration);
    localDb.saveRegistrations(registrations);

    // Increment capacity locally
    const events = localDb.getEvents();
    const evtIdx = events.findIndex(e => e.id === eventId);
    if (evtIdx !== -1) {
      events[evtIdx].registered_count += 1;
      localDb.saveEvents(events);
    }

    // Create confirmation notification
    await notificationService.createNotification({
      userId,
      title: 'Registration Confirmed!',
      message: `You are confirmed for ${event.title}. Mark attendance using Venue OTP at ${event.venue}.`,
      notificationType: 'registration',
      relatedEventId: eventId,
    });

    return newRegistration;
  },

  // Once registered, an event CANNOT be cancelled
  async cancelRegistration() {
    throw new Error('Policy Notice: Confirmed event registrations are permanent and cannot be cancelled.');
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
      attendanceRecord,
      hasAttended: Boolean(attendanceRecord),
    };
  },

  async getEventRegistrations(eventId) {
    const registrations = localDb.getRegistrations().filter(r => r.event_id === eventId);
    const profiles = localDb.getProfiles();
    const teams = localDb.getTeams();
    const attendance = localDb.getAttendance();

    return registrations.map(reg => {
      const profile = profiles.find(p => p.id === reg.user_id);
      const team = reg.team_id ? teams.find(t => t.id === reg.team_id) : null;
      const attended = attendance.some(a => a.registration_id === reg.id);
      return {
        ...reg,
        profile,
        team,
        hasAttended: attended,
      };
    });
  }
};

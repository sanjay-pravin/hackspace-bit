import { localDb } from './supabase';
import { notificationService } from './notificationService';
import { pcdpService } from './pcdpService';
import { generateRegistrationId } from '../utils/formatters';

export const teamService = {
  async createTeam({ name, eventId, leaderId }) {
    if (!name || !eventId || !leaderId) {
      throw new Error('Team name, event, and leader are required.');
    }

    // Verify event exists and allows teams
    const allEvents = localDb.getEvents();
    const event = allEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found.');
    if (event.maximum_team_size <= 1) {
      throw new Error('This event only permits individual registrations.');
    }

    // Check if leader is already in a team for this event
    const members = localDb.getTeamMembers();
    const teams = localDb.getTeams();
    const alreadyInTeam = members.find(
      m => m.user_id === leaderId && m.membership_status === 'accepted' && teams.some(t => t.id === m.team_id && t.event_id === eventId)
    );
    if (alreadyInTeam) {
      throw new Error('You are already leading or participating in a squad for this event.');
    }

    // Generate clean unique team code (e.g. NK-7782)
    const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'SQ';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${randNum}`;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      team_code: code,
      event_id: eventId,
      leader_id: leaderId,
      created_at: new Date().toISOString(),
      is_demonstration: false,
    };

    teams.push(newTeam);
    localDb.saveTeams(teams);

    // Add leader as accepted member
    const newMember = {
      id: `tm-${Date.now()}`,
      team_id: newTeam.id,
      user_id: leaderId,
      membership_status: 'accepted',
      role: 'leader',
      created_at: new Date().toISOString(),
    };
    members.push(newMember);
    localDb.saveTeamMembers(members);

    // Ensure leader is registered for this event
    const registrations = localDb.getRegistrations();
    let reg = registrations.find(r => r.event_id === eventId && r.user_id === leaderId);
    if (reg) {
      reg.team_id = newTeam.id;
      reg.registration_type = 'team';
      reg.status = 'confirmed';
    } else {
      const publicId = generateRegistrationId();
      const newReg = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        public_registration_id: publicId,
        event_id: eventId,
        user_id: leaderId,
        team_id: newTeam.id,
        registration_type: 'team',
        status: 'confirmed',
        qr_payload: `ACE-VERIFY:${publicId}:${eventId}:${leaderId}`,
        registered_at: new Date().toISOString(),
        cancelled_at: null,
        is_demonstration: false,
      };
      registrations.push(newReg);
      event.registered_count = (event.registered_count || 0) + 1;
      localDb.saveEvents(allEvents);
    }
    localDb.saveRegistrations(registrations);

    return newTeam;
  },

  async joinTeamByCode(teamCode, userId) {
    if (!teamCode || !userId) {
      throw new Error('Please enter a team invitation code.');
    }

    const cleanCode = teamCode.trim().toUpperCase();
    const teams = localDb.getTeams();
    const team = teams.find(t => (t.team_code || '').trim().toUpperCase() === cleanCode);
    if (!team) {
      throw new Error(`Invalid invitation code "${cleanCode}". Please check the code with your team captain.`);
    }

    const allEvents = localDb.getEvents();
    const event = allEvents.find(e => e.id === team.event_id);
    if (!event) throw new Error('Associated event was not found.');

    if (new Date(event.registration_deadline) < new Date()) {
      throw new Error('Registration deadline for this event has passed.');
    }

    const members = localDb.getTeamMembers();
    const currentMembers = members.filter(m => m.team_id === team.id && m.membership_status === 'accepted');

    const maxSize = event.maximum_team_size || 4;
    if (currentMembers.length >= maxSize) {
      throw new Error(`Squad "${team.name}" is already full! Maximum squad size for this event is ${maxSize} members.`);
    }

    const alreadyInThisTeam = members.find(m => m.team_id === team.id && m.user_id === userId);
    if (alreadyInThisTeam && alreadyInThisTeam.membership_status === 'accepted') {
      throw new Error(`You are already an active member of squad "${team.name}".`);
    }

    // Check if user is in another team for this event
    const inAnotherTeam = members.find(
      m => m.user_id === userId && m.membership_status === 'accepted' && teams.some(t => t.id === m.team_id && t.event_id === team.event_id && t.id !== team.id)
    );
    if (inAnotherTeam) {
      throw new Error('You are already registered with another squad for this event. Simultaneous squad registrations for the same event are not permitted.');
    }

    // Check schedule conflicts
    const userRegs = localDb.getRegistrations().filter(r => r.user_id === userId && r.status === 'confirmed');
    const targetStart = new Date(event.start_at).getTime();
    const targetEnd = new Date(event.end_at).getTime();
    for (const reg of userRegs) {
      if (reg.event_id === event.id) continue;
      const confEvt = allEvents.find(e => e.id === reg.event_id);
      if (confEvt) {
        const confStart = new Date(confEvt.start_at).getTime();
        const confEnd = new Date(confEvt.end_at).getTime();
        if (targetStart < confEnd && targetEnd > confStart) {
          throw new Error(`Schedule Conflict: You are already registered for "${confEvt.title}" during this exact time slot.`);
        }
      }
    }

    // Check PCDP Skill Eligibility if required
    const userProfile = localDb.getProfiles().find(p => p.id === userId);
    if (event.eligibility_type === 'pcdp_skill') {
      const elig = pcdpService.checkEventEligibility(event, userProfile);
      if (!elig.eligible) {
        throw new Error(`PCDP Prerequisite Not Met: This event requires ${event.required_skill} Level ${event.required_skill_level}. Please clear the skill assessment at ps.bitsathy.ac.in.`);
      }
    }

    // Add or update team membership
    if (alreadyInThisTeam) {
      alreadyInThisTeam.membership_status = 'accepted';
    } else {
      const newMember = {
        id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        team_id: team.id,
        user_id: userId,
        membership_status: 'accepted',
        role: 'member',
        created_at: new Date().toISOString(),
      };
      members.push(newMember);
    }
    localDb.saveTeamMembers(members);

    // Register user for the event in registrations table
    const registrations = localDb.getRegistrations();
    let reg = registrations.find(r => r.event_id === team.event_id && r.user_id === userId);
    if (reg) {
      reg.team_id = team.id;
      reg.registration_type = 'team';
      reg.status = 'confirmed';
    } else {
      const publicId = generateRegistrationId();
      const newReg = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        public_registration_id: publicId,
        event_id: team.event_id,
        user_id: userId,
        team_id: team.id,
        registration_type: 'team',
        status: 'confirmed',
        qr_payload: `ACE-VERIFY:${publicId}:${team.event_id}:${userId}`,
        registered_at: new Date().toISOString(),
        cancelled_at: null,
        is_demonstration: false,
      };
      registrations.push(newReg);
      event.registered_count = (event.registered_count || 0) + 1;
      localDb.saveEvents(allEvents);
    }
    localDb.saveRegistrations(registrations);

    // Notify team leader
    await notificationService.createNotification({
      userId: team.leader_id,
      title: 'New Member Joined Your Squad',
      message: `${userProfile?.display_name || 'A student'} joined "${team.name}" using team code ${cleanCode}.`,
      notificationType: 'team_invite',
      relatedEventId: team.event_id,
    });

    return { team, event };
  },

  async getUserTeams(userId) {
    const members = localDb.getTeamMembers().filter(m => m.user_id === userId && m.membership_status === 'accepted');
    const teams = localDb.getTeams();
    const events = localDb.getEvents();
    const profiles = localDb.getProfiles();
    const allMembers = localDb.getTeamMembers();

    return members.map(m => {
      const team = teams.find(t => t.id === m.team_id) || {};
      const event = events.find(e => e.id === team.event_id) || {};
      const roster = allMembers
        .filter(mem => mem.team_id === team.id && mem.membership_status === 'accepted')
        .map(mem => {
          const profile = profiles.find(p => p.id === mem.user_id) || {};
          return {
            ...mem,
            profile,
          };
        });

      return {
        ...team,
        userRole: m.role,
        event,
        members: roster,
      };
    });
  }
};

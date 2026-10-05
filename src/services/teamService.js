import { localDb } from './supabase';
import { notificationService } from './notificationService';

export const teamService = {
  async createTeam({ name, eventId, leaderId }) {
    if (!name || !eventId || !leaderId) {
      throw new Error('Team name, event, and leader are required.');
    }

    // Verify event exists and allows teams
    const event = localDb.getEvents().find(e => e.id === eventId);
    if (!event) throw new Error('Event not found.');
    if (event.maximum_team_size <= 1) {
      throw new Error('This event only permits individual registrations.');
    }

    // Generate unique team code (e.g. TM-4829)
    const code = `${name.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTeam = {
      id: `team-${Date.now()}`,
      name,
      team_code: code,
      event_id: eventId,
      leader_id: leaderId,
      created_at: new Date().toISOString(),
      is_demonstration: false,
    };

    const teams = localDb.getTeams();
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
    const members = localDb.getTeamMembers();
    members.push(newMember);
    localDb.saveTeamMembers(members);

    return newTeam;
  },

  async joinTeamByCode(teamCode, userId) {
    if (!teamCode || !userId) throw new Error('Team code and User ID are required.');

    const teams = localDb.getTeams();
    const team = teams.find(t => t.team_code.toUpperCase() === teamCode.trim().toUpperCase());
    if (!team) throw new Error('Invalid team code. Please check with your team leader.');

    const event = localDb.getEvents().find(e => e.id === team.event_id);
    const members = localDb.getTeamMembers();
    const currentMembers = members.filter(m => m.team_id === team.id && m.membership_status === 'accepted');

    if (currentMembers.length >= event.maximum_team_size) {
      throw new Error(`Team is full! Maximum size for this event is ${event.maximum_team_size} members.`);
    }

    const alreadyJoined = members.find(m => m.team_id === team.id && m.user_id === userId);
    if (alreadyJoined) {
      if (alreadyJoined.membership_status === 'accepted') {
        throw new Error('You are already an active member of this team.');
      }
      alreadyJoined.membership_status = 'accepted';
      localDb.saveTeamMembers(members);
      return team;
    }

    const newMember = {
      id: `tm-${Date.now()}`,
      team_id: team.id,
      user_id: userId,
      membership_status: 'accepted',
      role: 'member',
      created_at: new Date().toISOString(),
    };
    members.push(newMember);
    localDb.saveTeamMembers(members);

    // Notify team leader
    const student = localDb.getProfiles().find(p => p.id === userId);
    await notificationService.createNotification({
      userId: team.leader_id,
      title: 'New Member Joined Your Team',
      message: `${student?.display_name || 'A student'} has joined your team "${team.name}".`,
      notificationType: 'team_invite',
      relatedEventId: team.event_id,
    });

    return team;
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
        .filter(mem => mem.team_id === team.id)
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
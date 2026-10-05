import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_PROFILES,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_TEAMS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
} from './seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Persistent Local Database Fallback for Demonstration & Offline Development
const STORAGE_KEYS = {
  PROFILES: 'ace_profiles',
  EVENTS: 'ace_events',
  REGISTRATIONS: 'ace_registrations',
  TEAMS: 'ace_teams',
  TEAM_MEMBERS: 'ace_team_members',
  ATTENDANCE: 'ace_attendance',
  NOTIFICATIONS: 'ace_notifications',
  CURRENT_USER: 'ace_current_user',
};

function initCollection(key, initialData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Local storage read error for ${key}:`, e);
    return initialData;
  }
}

// In-memory synced local repository
export const localDb = {
  getProfiles() {
    return initCollection(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },
  saveProfiles(data) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data));
  },

  getEvents() {
    return initCollection(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },
  saveEvents(data) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data));
  },

  getRegistrations() {
    return initCollection(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  },
  saveRegistrations(data) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(data));
  },

  getTeams() {
    return initCollection(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  },
  saveTeams(data) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data));
  },

  getTeamMembers() {
    return initCollection(STORAGE_KEYS.TEAM_MEMBERS, INITIAL_TEAM_MEMBERS);
  },
  saveTeamMembers(data) {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(data));
  },

  getAttendance() {
    return initCollection(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },
  saveAttendance(data) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
  },

  getNotifications() {
    return initCollection(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications(data) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!raw) {
        // Default to demo student for immediate evaluation convenience
        const defaultUser = INITIAL_PROFILES[0];
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
        return defaultUser;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_PROFILES[0];
    }
  },
  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  resetToDemoSeed() {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(INITIAL_TEAM_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_PROFILES[0]));
    return true;
  }
};
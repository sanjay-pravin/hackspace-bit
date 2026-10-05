import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { INITIAL_PROFILES } from './seedData';
import { pcdpService } from './pcdpService';

// Standard & Google Email Validator
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const re = /^[^s@]+@[^s@]+.[^s@]+$/;
  return re.test(trimmed);
}

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile || { id: user.id, email: user.email, role: 'student', display_name: user.email };
    }
    return localDb.getCurrentUser();
  },

  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g. yourname@gmail.com).');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) throw error;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return profile;
    }

    // Special match for Sanjay Pravin R (BIT Sathy)
    if (cleanEmail === 'sanjaypravinr.cs25@bitsathy.ac.in') {
      const sanjayUser = {
        id: 'user-student-sanjay',
        email: cleanEmail,
        display_name: 'SANJAYPRAVIN R',
        role: 'student',
        department: 'Computer Science and Engineering',
        academic_year: '4th Year (2021-2025)',
        student_id: '7376211CS142',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        interests: ['Systems Programming', 'Hackathons', 'C Programming'],
        is_demonstration: false,
        auth_provider: 'pcdp_portal',
      };
      const profiles = localDb.getProfiles();
      if (!profiles.find(p => p.email.toLowerCase() === cleanEmail)) {
        profiles.push(sanjayUser);
        localDb.saveProfiles(profiles);
      }
      localDb.setCurrentUser(sanjayUser);
      return sanjayUser;
    }

    // Local DB matching
    const profiles = localDb.getProfiles();
    const found = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (!found) {
      const isStaffEmail = cleanEmail.includes('admin') || cleanEmail.includes('staff') || cleanEmail.includes('faculty');
      const role = isStaffEmail ? 'admin' : 'student';

      const newUser = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        display_name: cleanEmail.split('@')[0].replace('.', ' '),
        role,
        department: isStaffEmail ? 'Student Affairs & Faculty' : 'Computer Science',
        academic_year: isStaffEmail ? 'Faculty Lead' : '1st Year',
        student_id: isStaffEmail ? ('FAC-' + Date.now().toString().slice(-4)) : ('ID-' + Date.now().toString().slice(-4)),
        avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + cleanEmail,
        interests: ['Campus Events'],
        is_demonstration: false,
      };
      profiles.push(newUser);
      localDb.saveProfiles(profiles);
      localDb.setCurrentUser(newUser);
      return newUser;
    }
    localDb.setCurrentUser(found);
    return found;
  },

  async signInWithPcdp({ email, password }) {
    const verifiedProfile = await pcdpService.verifyPcdpCredentials({ email, password });
    const cleanEmail = email.trim().toLowerCase();
    const profiles = localDb.getProfiles();
    let found = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (!found) {
      found = {
        id: 'pcdp-' + Date.now(),
        email: cleanEmail,
        display_name: verifiedProfile.name || cleanEmail.split('@')[0].toUpperCase(),
        role: 'student',
        department: verifiedProfile.department || 'Computer Science and Engineering',
        academic_year: '4th Year (2021-2025)',
        student_id: verifiedProfile.roll_no || '7376211CS142',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        interests: ['PCDP Certified', 'C Programming', 'Hackathons'],
        is_demonstration: false,
        auth_provider: 'pcdp_portal',
      };
      profiles.push(found);
      localDb.saveProfiles(profiles);
    }
    localDb.setCurrentUser(found);
    return found;
  },

  async signInWithGoogle(customGoogleEmail = null) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return data;
    }

    const targetEmail = customGoogleEmail
      ? customGoogleEmail.trim().toLowerCase()
      : 'sanjaypravinr.cs25@bitsathy.ac.in';

    if (targetEmail === 'sanjaypravinr.cs25@bitsathy.ac.in') {
      const sanjayUser = {
        id: 'user-student-sanjay',
        email: targetEmail,
        display_name: 'SANJAYPREVIN R',
        role: 'student',
        department: 'Computer Science and Engineering',
        academic_year: '4th Year (2021-2025)',
        student_id: '7376211CS142',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        interests: ['Systems Programming', 'Hackathons'],
        is_demonstration: false,
        auth_provider: 'google_bitsathy',
      };
      const profiles = localDb.getProfiles();
      if (!profiles.find(p => p.email.toLowerCase() === targetEmail)) {
        profiles.push(sanjayUser);
        localDb.saveProfiles(profiles);
      }
      localDb.setCurrentUser(sanjayUser);
      return sanjayUser;
    }

    const profiles = localDb.getProfiles();
    let found = profiles.find(p => p.email.toLowerCase() === targetEmail);

    if (!found) {
      const isStaff = targetEmail.includes('admin') || targetEmail.includes('staff');
      found = {
        id: 'google-user-' + Date.now(),
        email: targetEmail,
        display_name: targetEmail.split('@*')[0].replace(/[._]/g, ' '),
        role: isStaff ? 'admin' : 'student',
        department: 'Computer Science & Engineering',
        academic_year: '3rd Year',
        student_id: 'G-' + Date.now().toString().slice(-4),
        avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + targetEmail,
        interests: ['Hackathons', 'Tech Workshops'],
        is_demonstration: false,
        auth_provider: 'google',
      };
      profiles.push(found);
      localDb.saveProfiles(profiles);
    }

    localDb.setCurrentUser(found);
    return found;
  },

  async signUp({ email, password, display_name, department, academic_year, student_id }) {
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g. yourname@gmail.com).');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { display_name, department, academic_year, student_id }
        }
      });
      if (error) throw error;
      const profile = {
        id: data.user.id,
        email: cleanEmail,
        display_name,
        role: 'student',
        department,
        academic_year,
        student_id,
        avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + display_name,
        interests: [],
      };
      await supabase.from('profiles').insert(profile);
      return profile;
    }

    const profiles = localDb.getProfiles();
    const existing = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newStudent = {
      id: 'user-' + Date.now(),
      email: cleanEmail,
      display_name,
      role: 'student',
      department: department || 'Computer Science',
      academic_year: academic_year || '1st Year',
      student_id: student_id || ('STU-' + Date.now().toString().slice(-4)),
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + display_name,
      interests: [],
      is_demonstration: false,
    };

    profiles.push(newStudent);
    localDb.saveProfiles(profiles);
    localDb.setCurrentUser(newStudent);
    return newStudent;
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localDb.setCurrentUser(null);
  },

  async updateProfile(userId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const profiles = localDb.getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates };
      localDb.saveProfiles(profiles);
      localDb.setCurrentUser(profiles[idx]);
      return profiles[idx];
    }
    return null;
  }
};

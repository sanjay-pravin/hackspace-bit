import { supabase, isSupabaseConfigured, localDb } from './supabase';

export const eventService = {
  async getEvents({ search = '', category = 'All', format = 'All', availability = 'All', sortBy = 'upcoming' } = {}) {
    let events = [];

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('events').select('*');
      if (category && category !== 'All') query = query.eq('category', category);
      if (format && format !== 'All') query = query.eq('event_format', format);
      const { data, error } = await query;
      if (error) throw error;
      events = data || [];
    } else {
      events = [...localDb.getEvents()];
    }

    // Filter published events for public views
    events = events.filter(e => e.status === 'published' || e.status === 'cancelled');

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer_name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      events = events.filter(e => e.category === category);
    }

    // Format filter
    if (format && format !== 'All') {
      events = events.filter(e => e.event_format === format);
    }

    // Availability filter
    if (availability && availability !== 'All') {
      const now = new Date();
      if (availability === 'Open') {
        events = events.filter(e => e.registered_count < e.capacity && new Date(e.registration_deadline) > now && e.status === 'published');
      } else if (availability === 'Closing Soon') {
        events = events.filter(e => {
          const diffHours = (new Date(e.registration_deadline) - now) / (1000 * 3600);
          return diffHours > 0 && diffHours <= 48 && e.registered_count < e.capacity;
        });
      } else if (availability === 'Full') {
        events = events.filter(e => e.registered_count >= e.capacity);
      }
    }

    // Sorting
    events.sort((a, b) => {
      if (sortBy === 'upcoming') {
        return new Date(a.start_at) - new Date(b.start_at);
      }
      if (sortBy === 'deadline') {
        return new Date(a.registration_deadline) - new Date(b.registration_deadline);
      }
      if (sortBy === 'capacity') {
        return b.capacity - a.capacity;
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return events;
  },

  async getAllAdminEvents() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [...localDb.getEvents()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  async getFeaturedEvents() {
    const all = await this.getEvents();
    return all.filter(e => e.is_featured || e.registered_count > 30).slice(0, 3);
  },

  async getEventBySlug(slug) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    }
    return localDb.getEvents().find(e => e.slug === slug) || null;
  },

  async getEventById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    return localDb.getEvents().find(e => e.id === id) || null;
  },

  async createEvent(eventData) {
    const slug = eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const venueOtp = eventData.venue_otp || Math.floor(100000 + Math.random() * 900000).toString();
    const newEvent = {
      id: `evt-${Date.now()}`,
      slug,
      ...eventData,
      venue_otp: venueOtp,
      registered_count: 0,
      status: eventData.status || 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demonstration: false,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').insert(newEvent).select().single();
      if (error) throw error;
      return data;
    }

    const events = localDb.getEvents();
    events.unshift(newEvent);
    localDb.saveEvents(events);
    return newEvent;
  },

  async updateEvent(id, updates) {
    updates.updated_at = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }

    const events = localDb.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    events[idx] = { ...events[idx], ...updates };
    localDb.saveEvents(events);
    return events[idx];
  },

  async regenerateVenueOtp(id) {
    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.updateEvent(id, { venue_otp: freshOtp });
  },

  async cancelEvent(id) {
    return this.updateEvent(id, { status: 'cancelled' });
  },

  async getLiveStats() {
    const events = localDb.getEvents();
    const registrations = localDb.getRegistrations();
    const attendance = localDb.getAttendance();

    const now = new Date();
    const published = events.filter(e => e.status === 'published');
    const upcoming = published.filter(e => new Date(e.start_at) > now);
    const completed = events.filter(e => e.status === 'completed' || new Date(e.end_at) < now);
    const confirmedRegs = registrations.filter(r => r.status === 'confirmed');

    // Aggregate category distribution
    const categoryCounts = {};
    events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    return {
      totalEvents: events.length,
      publishedEvents: published.length,
      upcomingEvents: upcoming.length,
      completedEvents: completed.length,
      totalRegistrations: confirmedRegs.length,
      attendanceCount: attendance.length,
      attendanceRate: confirmedRegs.length > 0 ? Math.round((attendance.length / confirmedRegs.length) * 100) : 0,
      categoryDistribution,
    };
  }
};
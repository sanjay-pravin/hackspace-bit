import { supabase, isSupabaseConfigured, localDb } from './supabase';

export const eventService = {
  async getEvents({ search = '', category = 'All', format = 'All', availability = 'All', sortBy = 'upcoming', userId = null } = {}) {
    let events = [];

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('events').select('*');
        if (category && category !== 'All') query = query.eq('category', category);
        if (format && format !== 'All') query = query.eq('event_format', format);
        const { data, error } = await query;
        if (!error && data) {
          events = data;
        } else {
          events = [...localDb.getEvents()];
        }
      } catch (err) {
        console.warn('Supabase event query fallback:', err);
        events = [...localDb.getEvents()];
      }
    } else {
      events = [...localDb.getEvents()];
    }

    // Filter published events for public views
    events = events.filter(e => e.status === 'published' || e.status === 'cancelled');

    // TIME CONFLICT FILTER:
    // If the student is registered for an event at that time, other events on the same time should not show.
    if (userId) {
      try {
        const userRegs = localDb.getRegistrations().filter(r => r.user_id === userId && r.status === 'confirmed');
        const allEvents = localDb.getEvents();
        const myRegisteredEvents = userRegs
          .map(r => allEvents.find(e => e.id === r.event_id))
          .filter(Boolean);

        if (myRegisteredEvents.length > 0) {
          events = events.filter(evt => {
            // Keep the event if the user is already registered for it (so they can see their registration status)
            const isMyEvent = myRegisteredEvents.some(me => me.id === evt.id);
            if (isMyEvent) return true;

            const evtStart = new Date(evt.start_at).getTime();
            const evtEnd = new Date(evt.end_at).getTime();

            // Check if this event overlaps with ANY event the student is confirmed for
            const hasConflict = myRegisteredEvents.some(me => {
              const meStart = new Date(me.start_at).getTime();
              const meEnd = new Date(me.end_at).getTime();
              // Overlaps if event A starts before event B ends, and event A ends after event B starts
              return evtStart < meEnd && evtEnd > meStart;
            });

            // If it overlaps with an existing registered event, hide it from the student!
            return !hasConflict;
          });
        }
      } catch (e) {
        console.warn('Time conflict filter warning:', e);
      }
    }

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

  async getFeaturedEvents(userId = null) {
    const all = await this.getEvents({ userId });
    return all.filter(e => e.is_featured && e.status === 'published').slice(0, 2);
  },

  async getEventBySlug(slug) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getEventBySlug fallback:', e);
      }
    }
    const events = localDb.getEvents();
    return events.find(e => e.slug === slug) || null;
  },

  async getEventById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getEventById fallback:', e);
      }
    }
    const events = localDb.getEvents();
    return events.find(e => e.id === id) || null;
  },

  checkEventTimeConflict(eventId, userId) {
    if (!userId || !eventId) return { hasConflict: false };
    const userRegs = localDb.getRegistrations().filter(r => r.user_id === userId && r.status === 'confirmed');
    const allEvents = localDb.getEvents();
    const targetEvent = allEvents.find(e => e.id === eventId);
    if (!targetEvent) return { hasConflict: false };

    // If user is already registered for THIS event, no schedule conflict with itself
    const alreadyRegisteredForThis = userRegs.some(r => r.event_id === eventId);
    if (alreadyRegisteredForThis) return { hasConflict: false };

    const myRegisteredEvents = userRegs
      .map(r => allEvents.find(e => e.id === r.event_id))
      .filter(Boolean);

    const targetStart = new Date(targetEvent.start_at).getTime();
    const targetEnd = new Date(targetEvent.end_at).getTime();

    for (const me of myRegisteredEvents) {
      const meStart = new Date(me.start_at).getTime();
      const meEnd = new Date(me.end_at).getTime();
      if (targetStart < meEnd && targetEnd > meStart) {
        return {
          hasConflict: true,
          conflictingEvent: me,
        };
      }
    }
    return { hasConflict: false };
  },

  async createEvent(eventData) {
    const slug = eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newEvent = {
      id: `evt-${Date.now()}`,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      registered_count: 0,
      venue_otp: Math.floor(100000 + Math.random() * 900000).toString(),
      status: eventData.status || 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...eventData,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').insert(newEvent).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createEvent fallback:', e);
      }
    }

    const events = localDb.getEvents();
    events.unshift(newEvent);
    localDb.saveEvents(events);
    return newEvent;
  },

  async updateEvent(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateEvent fallback:', e);
      }
    }

    const events = localDb.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...updates, updated_at: new Date().toISOString() };
      localDb.saveEvents(events);
      return events[idx];
    }
    throw new Error('Event not found.');
  },

  async cancelEvent(id) {
    return this.updateEvent(id, { status: 'cancelled' });
  },

  async regenerateVenueOtp(id) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.updateEvent(id, { venue_otp: newOtp });
  },

  async getAllAdminEvents() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getAllAdminEvents fallback:', e);
      }
    }
    return localDb.getEvents();
  },

  async getLiveStats() {
    const events = localDb.getEvents();
    const registrations = localDb.getRegistrations();
    const attendance = localDb.getAttendance();
    const teams = localDb.getTeams();

    const now = new Date();
    const upcoming = events.filter(e => new Date(e.start_at) > now && e.status === 'published');
    const totalRegs = registrations.filter(r => r.status === 'confirmed').length;
    const totalAttended = attendance.length;

    const rate = totalRegs > 0 ? Math.round((totalAttended / totalRegs) * 100) : 0;

    const catMap = {};
    events.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(catMap).map(k => ({
      name: k,
      count: catMap[k],
    }));

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming.length,
      totalRegistrations: totalRegs,
      attendanceCount: totalAttended,
      attendanceRate: rate,
      activeTeams: teams.length,
      attendedTotal: totalAttended,
      categoryDistribution,
    };
  }
};

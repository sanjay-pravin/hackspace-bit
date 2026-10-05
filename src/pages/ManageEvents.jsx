import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Edit3, 
  Ban, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Users, 
  AlertCircle,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { formatDate, formatTime, getCategoryBadgeClass } from '../utils/formatters';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';

const CATEGORIES = [
  'Hackathon',
  'Technical Workshop',
  'Coding Competition',
  'Seminar',
  'Cultural Event',
  'Sports Event',
  'Innovation Challenge',
];

const PRESET_POSTERS = [
  { label: 'Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Workshop', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Coding', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Seminar', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cultural', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
];

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon',
    poster_url: PRESET_POSTERS[0].url,
    organizer_name: 'Campus Event Council',
    venue: '',
    event_format: 'in-person',
    start_at: '',
    end_at: '',
    registration_deadline: '',
    capacity: 100,
    minimum_team_size: 1,
    maximum_team_size: 1,
    eligibility_rules: 'All enrolled undergraduate & postgraduate students.',
    event_rules: 'Bring valid college ID. Pre-registration required.',
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllAdminEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    const now = new Date();
    const start = new Date(now.getTime() + 7 * 86400000);
    const end = new Date(now.getTime() + 8 * 86400000);
    const deadline = new Date(now.getTime() + 5 * 86400000);

    setFormData({
      title: '',
      description: '',
      category: 'Hackathon',
      poster_url: PRESET_POSTERS[0].url,
      organizer_name: 'Campus Innovation Council',
      venue: 'Tech Hall 101',
      event_format: 'in-person',
      start_at: start.toISOString().slice(0, 16),
      end_at: end.toISOString().slice(0, 16),
      registration_deadline: deadline.toISOString().slice(0, 16),
      capacity: 120,
      eligibility_type: "fcfs",
      required_skill: "C Programming",
      required_skill_level: 2,
      minimum_team_size: 1,
      maximum_team_size: 4,
      eligibility_rules: 'Open to all registered university students with active badge.',
      event_rules: 'Code of conduct applies. Attendance verified via QR scan at check-in.',
      status: 'published',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      poster_url: event.poster_url,
      organizer_name: event.organizer_name,
      venue: event.venue,
      event_format: event.event_format,
      start_at: new Date(event.start_at).toISOString().slice(0, 16),
      end_at: new Date(event.end_at).toISOString().slice(0, 16),
      registration_deadline: new Date(event.registration_deadline).toISOString().slice(0, 16),
      capacity: event.capacity,
      eligibility_type: event.eligibility_type || "fcfs",
      required_skill: event.required_skill || "C Programming",
      required_skill_level: event.required_skill_level || 2,
      minimum_team_size: event.minimum_team_size,
      maximum_team_size: event.maximum_team_size,
      eligibility_rules: event.eligibility_rules || '',
      event_rules: event.event_rules || '',
      status: event.status,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        capacity: parseInt(formData.capacity, 10),
        minimum_team_size: parseInt(formData.minimum_team_size, 10),
        maximum_team_size: parseInt(formData.maximum_team_size, 10),
        eligibility_type: formData.eligibility_type,
        required_skill: formData.eligibility_type === "pcdp_skill" ? formData.required_skill : null,
        required_skill_level: formData.eligibility_type === "pcdp_skill" ? parseInt(formData.required_skill_level, 10) : null,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
      } else {
        await eventService.createEvent(payload);
      }

      setIsModalOpen(false);
      await loadEvents();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (event) => {
    const nextStatus = event.status === 'published' ? 'draft' : 'published';
    await eventService.updateEvent(event.id, { status: nextStatus });
    await loadEvents();
  };

  const handleCancelEvent = async (event) => {
    if (confirm(`Are you sure you want to cancel "${event.title}"? Students will see the cancellation on their passes.`)) {
      await eventService.cancelEvent(event.id);
      await loadEvents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Campus Events</h1>
          <p className="text-xs text-slate-400">
            Publish events, adjust seat capacity, edit rules, or cancel sessions with live notifications.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Table / Card List */}
      {loading ? (
        <LoadingState message="Loading event portfolio..." />
      ) : (
        <div className="space-y-4">
          {events.map((evt) => {
            const isCancelled = evt.status === 'cancelled';
            const isDraft = evt.status === 'draft';

            return (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={evt.poster_url}
                    alt={evt.title}
                    className="w-20 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border ${getCategoryBadgeClass(evt.category)}`}>
                        {evt.category}
                      </span>
                      {evt.eligibility_type === 'pcdp_skill' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          PCDP: {evt.required_skill} L{evt.required_skill_level}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          FCFS Open
                        </span>
                      )}
                      {isCancelled ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          Cancelled
                        </span>
                      ) : isDraft ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                    <p className="text-xs text-slate-400">
                      {formatDate(evt.start_at)} • {evt.venue} • Capacity: <strong className="text-white">{evt.registered_count} / {evt.capacity}</strong>
                    </p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(evt)}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
                  >
                    {evt.status === 'published' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelEvent(evt)}
                      className="p-2 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/40 transition flex items-center space-x-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Event</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Campus Event' : 'Create New Campus Event'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI Innovation Summit 2026"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Format *</label>
              <select
                value={formData.event_format}
                onChange={(e) => setFormData({ ...formData, event_format: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of tracks, prizes, and keynote sessions..."
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer Council *</label>
              <input
                type="text"
                required
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venue / Online Link *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Auditorium Hall B"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seat Capacity *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Team Size</label>
              <input
                type="number"
                min="1"
                required
                value={formData.minimum_team_size}
                onChange={(e) => setFormData({ ...formData, minimum_team_size: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Team Size</label>
              <input
                type="number"
                min="1"
                required
                value={formData.maximum_team_size}
                onChange={(e) => setFormData({ ...formData, maximum_team_size: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Eligibility Criteria (FCFS vs PCDP) */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-200">
                Registration Eligibility Criteria
              </label>
              <span className="text-[10px] text-purple-400 font-mono">PCDP / PS Portal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={'flex items-start p-2.5 rounded-lg border cursor-pointer transition ' + (
                  formData.eligibility_type === 'fcfs'
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                )}
              >
                <input
                  type="radio"
                  name="eligibility_type"
                  value="fcfs"
                  checked={formData.eligibility_type === 'fcfs'}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      eligibility_type: 'fcfs',
                      eligibility_rules: 'First-Come-First-Served open entry based on available seat capacity.',
                    })
                  }
                  className="mt-0.5 mr-2"
                />
                <div>
                  <div className="font-semibold text-emerald-400">First-Come-First-Served (FCFS)</div>
                  <div className="text-[10px] text-slate-400">Open entry for all students until seats fill up.</div>
                </div>
              </label>

              <label
                className={'flex items-start p-2.5 rounded-lg border cursor-pointer transition ' + (
                  formData.eligibility_type === 'pcdp_skill'
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                )}
              >
                <input
                  type="radio"
                  name="eligibility_type"
                  value="pcdp_skill"
                  checked={formData.eligibility_type === 'pcdp_skill'}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      eligibility_type: 'pcdp_skill',
                      eligibility_rules: 'Requires completed ' + (formData.required_skill || 'C Programming') + ' Level ' + (formData.required_skill_level || 2) + ' on the BIT Sathy PCDP Portal.',
                    })
                  }
                  className="mt-0.5 mr-2"
                />
                <div>
                  <div className="font-semibold text-purple-300">PCDP Skill Prerequisite</div>
                  <div className="text-[10px] text-slate-400">Verify slot tests on ps.bitsathy.ac.in.</div>
                </div>
              </label>
            </div>

            {formData.eligibility_type === 'pcdp_skill' && (
              <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Required Competency Skill
                  </label>
                  <select
                    value={formData.required_skill}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        required_skill: e.target.value,
                        eligibility_rules: 'Requires completed ' + e.target.value + ' Level ' + (formData.required_skill_level || 2) + ' on the PCDP Portal.',
                      })
                    }
                    className="w-full py-2 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="C Programming">C Programming</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Required Minimum Slot Level
                  </label>
                  <select
                    value={formData.required_skill_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        required_skill_level: parseInt(e.target.value, 10),
                        eligibility_rules: 'Requires completed ' + formData.required_skill + ' Level ' + e.target.value + ' on the PCDP Portal.',
                      })
                    }
                    className="w-full py-2 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value={1}>Level 1 (Foundation Slot)</option>
                    <option value={2}>Level 2 (Intermediate Slot)</option>
                    <option value={3}>Level 3 (Advanced Master Slot)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 text-[10px] text-purple-300/80 bg-purple-900/20 p-2 rounded border border-purple-800/40">
                  ⚡ When students register, the platform checks their verified slot assessment levels on <strong>ps.bitsathy.ac.in</strong>. Students without <strong>{formData.required_skill} Level {formData.required_skill_level}</strong> will be blocked from registering.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Image URL</label>
            <input
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {PRESET_POSTERS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, poster_url: p.url })}
                  className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                >
                  Preset: {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving Event...' : editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
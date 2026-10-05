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
  AlertCircle
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
    eligibility_type: 'fcfs',
    required_skill: 'C Programming',
    required_skill_level: 2,
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
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 3600 * 1000);

    const toLocalISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    setFormData({
      title: '',
      description: '',
      category: 'Hackathon',
      poster_url: PRESET_POSTERS[0].url,
      organizer_name: 'Campus Event Council',
      venue: '',
      event_format: 'in-person',
      start_at: toLocalISO(tomorrow),
      end_at: toLocalISO(dayAfter),
      registration_deadline: toLocalISO(now),
      capacity: 100,
      minimum_team_size: 1,
      maximum_team_size: 1,
      eligibility_type: 'fcfs',
      required_skill: 'C Programming',
      required_skill_level: 2,
      eligibility_rules: 'First-Come-First-Served open entry based on available seat capacity.',
      event_rules: 'Bring valid college ID. Pre-registration required.',
      status: 'published',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    const toLocalISO = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      poster_url: evt.poster_url,
      organizer_name: evt.organizer_name,
      venue: evt.venue,
      event_format: evt.event_format,
      start_at: toLocalISO(evt.start_at),
      end_at: toLocalISO(evt.end_at),
      registration_deadline: toLocalISO(evt.registration_deadline),
      capacity: evt.capacity,
      minimum_team_size: evt.minimum_team_size,
      maximum_team_size: evt.maximum_team_size,
      eligibility_type: evt.eligibility_type || 'fcfs',
      required_skill: evt.required_skill || 'C Programming',
      required_skill_level: evt.required_skill_level || 2,
      eligibility_rules: evt.eligibility_rules || '',
      event_rules: evt.event_rules || '',
      status: evt.status,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (new Date(formData.end_at) <= new Date(formData.start_at)) {
        throw new Error('End date must be strictly after the start date.');
      }

      if (formData.maximum_team_size < formData.minimum_team_size) {
        throw new Error('Maximum team size cannot be less than minimum team size.');
      }

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
      } else {
        await eventService.createEvent(formData);
      }

      setIsModalOpen(false);
      await loadEvents();
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (evt) => {
    const nextStatus = evt.status === 'published' ? 'draft' : 'published';
    try {
      await eventService.updateEvent(evt.id, { status: nextStatus });
      await loadEvents();
    } catch (err) {
      alert('Failed to update event status');
    }
  };

  const handleCancelEvent = async (evt) => {
    if (!window.confirm(`Are you sure you want to cancel "${evt.title}"? Registered students will be notified.`)) {
      return;
    }
    try {
      await eventService.cancelEvent(evt.id);
      await loadEvents();
    } catch (err) {
      alert('Failed to cancel event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Campus Events</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new events, configure PCDP eligibility criteria or FCFS, and manage attendee capacity.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition flex items-center space-x-1.5"
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
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={evt.poster_url}
                    alt={evt.title}
                    className="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border ${getCategoryBadgeClass(evt.category)}`}>
                        {evt.category}
                      </span>
                      {evt.eligibility_type === 'pcdp_skill' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          PCDP: {evt.required_skill} L{evt.required_skill_level}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          FCFS Open
                        </span>
                      )}
                      {isCancelled ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                          Cancelled
                        </span>
                      ) : isDraft ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Published
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-xs text-slate-500">
                      {formatDate(evt.start_at)} • {evt.venue} • Capacity: <strong className="text-slate-800">{evt.registered_count} / {evt.capacity}</strong>
                    </p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(evt)}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center space-x-1"
                  >
                    {evt.status === 'published' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelEvent(evt)}
                      className="p-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition flex items-center space-x-1"
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
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-slate-800">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI Innovation Summit 2026"
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format *</label>
              <select
                value={formData.event_format}
                onChange={(e) => setFormData({ ...formData, event_format: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of tracks, prizes, and keynote sessions..."
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer Council *</label>
              <input
                type="text"
                required
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Online Link *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Auditorium Hall B"
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full py-2 px-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seat Capacity *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Team Size</label>
              <input
                type="number"
                min="1"
                required
                value={formData.minimum_team_size}
                onChange={(e) => setFormData({ ...formData, minimum_team_size: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Team Size</label>
              <input
                type="number"
                min="1"
                required
                value={formData.maximum_team_size}
                onChange={(e) => setFormData({ ...formData, maximum_team_size: e.target.value })}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Eligibility Criteria (FCFS vs PCDP) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                Registration Eligibility Criteria
              </label>
              <span className="text-[10px] text-purple-700 font-mono">PCDP / PS Portal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={'flex items-start p-2.5 rounded-lg border cursor-pointer transition ' + (
                  formData.eligibility_type === 'fcfs'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  <div className="font-semibold text-emerald-800">First-Come-First-Served (FCFS)</div>
                  <div className="text-[10px] text-slate-500">Open entry for all students until seats fill up.</div>
                </div>
              </label>

              <label
                className={'flex items-start p-2.5 rounded-lg border cursor-pointer transition ' + (
                  formData.eligibility_type === 'pcdp_skill'
                    ? 'bg-purple-50 border-purple-400 text-purple-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  <div className="font-semibold text-purple-800">PCDP Skill Prerequisite</div>
                  <div className="text-[10px] text-slate-500">Verify slot tests on ps.bitsathy.ac.in.</div>
                </div>
              </label>
            </div>

            {formData.eligibility_type === 'pcdp_skill' && (
              <div className="p-3 rounded-lg bg-white border border-purple-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="C Programming">C Programming</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value={1}>Level 1 (Foundation Slot)</option>
                    <option value={2}>Level 2 (Intermediate Slot)</option>
                    <option value={3}>Level 3 (Advanced Master Slot)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 text-[10px] text-purple-800 bg-purple-50 p-2 rounded border border-purple-200">
                  ⚡ When students register, the platform checks their verified slot assessment levels on <strong>ps.bitsathy.ac.in</strong>. Students without <strong>{formData.required_skill} Level {formData.required_skill_level}</strong> will be blocked from registering.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Poster Image URL</label>
            <input
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {PRESET_POSTERS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, poster_url: p.url })}
                  className="px-2 py-1 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 border border-slate-200"
                >
                  Preset: {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Saving Event...' : editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Technical Workshop',
  'Coding Competition',
  'Seminar',
  'Cultural Event',
  'Sports Event',
  'Innovation Challenge',
];

const FORMATS = ['All', 'in-person', 'virtual', 'hybrid'];
const AVAILABILITIES = ['All', 'Open', 'Closing Soon', 'Full'];
const SORT_OPTIONS = [
  { label: 'Upcoming Soonest', value: 'upcoming' },
  { label: 'Registration Deadline', value: 'deadline' },
  { label: 'Largest Capacity', value: 'capacity' },
  { label: 'Event Name (A-Z)', value: 'name' },
];

export default function FilterPanel({
  selectedCategory,
  onSelectCategory,
  selectedFormat,
  onSelectFormat,
  selectedAvailability,
  onSelectAvailability,
  sortBy,
  onSortBy,
  onReset,
}) {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Format, Availability & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Format */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Format</label>
          <select
            value={selectedFormat}
            onChange={(e) => onSelectFormat(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f === 'All' ? 'All Formats' : f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Availability</label>
          <select
            value={selectedAvailability}
            onChange={(e) => onSelectAvailability(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {AVAILABILITIES.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Slots' : a}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortBy(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
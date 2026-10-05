import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate, formatTime, getCategoryBadgeClass } from '../utils/formatters';

export default function EventCard({ event }) {
  const percentFull = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));
  const remainingSlots = Math.max(0, event.capacity - (event.registered_count || 0));
  const isFull = remainingSlots === 0;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex flex-col justify-between overflow-hidden shadow-sm">
      <div>
        {/* Subtle Poster Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover transition duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getCategoryBadgeClass(event.category)}`}>
              {event.category}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-900/80 text-slate-300 uppercase">
              {event.event_format}
            </span>
          </div>

          {event.is_demonstration && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-950/80 rounded">
                Demo
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2.5">
          <p className="text-[11px] text-slate-400 truncate">By {event.organizer_name}</p>

          <Link to={`/events/${event.slug}`}>
            <h3 className="text-sm font-bold text-white hover:text-cyan-400 transition line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Time & Venue */}
          <div className="space-y-1 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(event.start_at)} ({formatTime(event.start_at)})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-slate-300">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area: Capacity & Action */}
      <div className="p-4 pt-0 space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1 text-slate-400">
            <span>Capacity: <strong className="text-slate-200">{event.registered_count} / {event.capacity}</strong></span>
            <span className={isFull ? 'text-red-400 font-semibold' : 'text-slate-300'}>
              {isFull ? 'Full' : `${remainingSlots} left`}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        <Link
          to={`/events/${event.slug}`}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
        >
          <span>View Details & Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
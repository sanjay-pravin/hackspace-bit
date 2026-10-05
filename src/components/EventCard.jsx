import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate, formatTime, getCategoryBadgeClass } from '../utils/formatters';

export default function EventCard({ event }) {
  const percentFull = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));
  const remainingSlots = Math.max(0, event.capacity - (event.registered_count || 0));
  const isFull = remainingSlots === 0;

  return (
    <div className="rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden shadow-sm">
      <div>
        {/* Poster Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover transition duration-300"
            loading="lazy"
          />
          
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded shadow-sm ${getCategoryBadgeClass(event.category)}`}>
              {event.category}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-slate-700 shadow-sm uppercase">
              {event.event_format}
            </span>
          </div>

          {event.is_demonstration && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-600 bg-white/90 rounded shadow-sm">
                Demo
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2.5">
          <p className="text-[11px] text-slate-500 truncate">By {event.organizer_name}</p>

          <Link to={`/events/${event.slug}`}>
            <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Time & Venue */}
          <div className="space-y-1 pt-2 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(event.start_at)} ({formatTime(event.start_at)})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate text-slate-700">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area: Capacity & Action */}
      <div className="p-4 pt-0 space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
            <span>Capacity: <strong className="text-slate-800">{event.registered_count} / {event.capacity}</strong></span>
            <span className={isFull ? 'text-red-600 font-semibold' : 'text-slate-600'}>
              {isFull ? 'Full' : `${remainingSlots} left`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        <Link
          to={`/events/${event.slug}`}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition border border-slate-200 hover:border-blue-200"
        >
          <span>View Details & Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

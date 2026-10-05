import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 transition cursor-pointer hover:bg-slate-800/50 ${
                    !n.is_read ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  {n.related_event_id && (
                    <div className="mt-2 flex items-center space-x-1 text-[11px] text-cyan-400 font-medium">
                      <Link
                        to={`/student/registrations`}
                        onClick={() => setIsOpen(false)}
                        className="hover:underline flex items-center space-x-1"
                      >
                        <span>View in registrations</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800 text-center bg-slate-950/50">
            <Link
              to="/student/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200 block py-1"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
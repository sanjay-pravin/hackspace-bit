import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  Search, 
  Users, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  Code, 
  Laptop, 
  Palette, 
  Award,
  KeyRound,
  MapPin
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import LoadingState from '../components/LoadingState';

const CATEGORIES = [
  { name: 'Hackathons', icon: Code, desc: '36-hour sprint challenges and hardware builds' },
  { name: 'Technical Workshops', icon: Laptop, desc: 'Hands-on developer bootcamps & cloud labs' },
  { name: 'Coding Competitions', icon: Trophy, desc: 'Algorithm battles & competitive programming' },
  { name: 'Seminars', icon: Award, desc: 'Distinguished faculty & industry keynotes' },
  { name: 'Cultural Events', icon: Palette, desc: 'Music, drama, dance & festivals' },
  { name: 'Sports Events', icon: Flame, desc: 'Intra-college tournaments & meets' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featured, allEvents, liveStats] = await Promise.all([
          eventService.getFeaturedEvents(),
          eventService.getEvents({ sortBy: 'upcoming' }),
          eventService.getLiveStats(),
        ]);
        setFeaturedEvents(featured);
        setUpcomingEvents(allEvents.slice(0, 4));
        setStats(liveStats);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 bg-gradient-to-b from-blue-50/50 to-transparent">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Vision Builders • HACKSPACE Hackathon</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Every Campus Event. <br />
              <span className="text-blue-600">One Connected Campus.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Discover hackathons, technical workshops, and campus activities. Register individually or as a squad, then mark attendance Present using Venue OTP codes.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto flex items-center p-1.5 rounded-xl bg-white border border-slate-300 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hackathons, workshops, or organizers..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition"
            >
              Search
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {!user && (
              <Link
                to="/signup"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition"
              >
                <span>Student Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      {stats && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{stats.totalEvents}</p>
              <p className="text-xs text-slate-500 mt-1">Campus Events</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{stats.totalRegistrations}</p>
              <p className="text-xs text-slate-500 mt-1">Registrations</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600">{stats.activeTeams}</p>
              <p className="text-xs text-slate-500 mt-1">Active Squads</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.attendedTotal}</p>
              <p className="text-xs text-slate-500 mt-1">Verified Attendances</p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Featured Highlights</h2>
              <p className="text-xs text-slate-500">Flagship hackathons and premier campus gatherings</p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Browse by Category</h2>
          <p className="text-xs text-slate-500">Explore technical, competitive, and cultural opportunities</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
            <p className="text-xs text-slate-500">Upcoming sessions opening for registration</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>See full calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading events..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">How Attendance Works</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Simple 3-step process designed for fast, seamless participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              <h4 className="text-xs font-bold text-slate-900">Discover & Register</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Check skill prerequisites or FCFS criteria and register in 1-click.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              <h4 className="text-xs font-bold text-slate-900">Arrive at Venue</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Arrive at the event hall or lab indicated on your registration.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              <h4 className="text-xs font-bold text-slate-900">Enter Venue OTP</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Organizers display the live venue code — enter it to mark attendance Present instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

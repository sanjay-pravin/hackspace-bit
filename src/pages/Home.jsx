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
      {/* Subtle Hero */}
      <section className="relative pt-16 pb-10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Vision Builders • HACKSPACE Hackathon</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Every Campus Event. <br />
              <span className="text-cyan-400">One Connected Campus.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Discover hackathons, technical workshops, and campus activities. Register individually or as a squad, then mark attendance Present using Venue OTP codes.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-slate-700 transition">
            <div className="pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hackathons, workshops, or organizers..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-950 transition flex items-center space-x-1.5"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {user ? (
              <Link
                to="/student/registrations"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
              >
                View My Registrations
              </Link>
            ) : (
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
              >
                Create Student Account
              </Link>
            )}
          </div>

          {/* Telemetry banner */}
          {stats && (
            <div className="pt-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="p-2">
                  <p className="text-xl font-bold text-white">{stats.totalEvents}</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Campus Events</p>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <p className="text-xl font-bold text-indigo-400">{stats.totalRegistrations}</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Registrations</p>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <p className="text-xl font-bold text-cyan-400">{stats.attendanceCount}</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Checked In</p>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <p className="text-xl font-bold text-emerald-400">{stats.attendanceRate}%</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Turnout</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Featured Campus Events</h2>
            <p className="text-xs text-slate-400">Highlighted hackathons and masterclasses</p>
          </div>
          <Link to="/events" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading events..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white">Event Categories</h2>
          <p className="text-xs text-slate-400">Filter through department and club offerings</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name === 'Hackathons' ? 'Hackathon' : cat.name.replace(/s$/, ''))}`}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2 text-center"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white">{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
            <p className="text-xs text-slate-400">Reserve your spot before deadlines close</p>
          </div>
          <Link to="/events" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
            <span>Explore full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {upcomingEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </section>

      {/* How Venue OTP Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">How Attendance Works at the Venue</h2>
            <p className="text-xs text-slate-400">Simple three-step check-in without paper lists or delays.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-bold">01</span>
              <h3 className="text-xs font-bold text-white">Register Solo or Squad</h3>
              <p className="text-xs text-slate-400">
                Register individually or create a squad with an invitation code. Seat capacity updates instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-indigo-400 font-bold">02</span>
              <h3 className="text-xs font-bold text-white">Arrive at Event Venue</h3>
              <p className="text-xs text-slate-400">
                Head to the assigned campus hall or lab. Organizers display the active 6-digit Venue OTP at the entrance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold">03</span>
              <h3 className="text-xs font-bold text-white">Enter OTP & Mark Present</h3>
              <p className="text-xs text-slate-400">
                Type the Venue OTP into your registrations page to record attendance as Present mapped to the venue.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
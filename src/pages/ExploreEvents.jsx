import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Calendar, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function ExploreEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [format, setFormat] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('upcoming');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const results = await eventService.getEvents({
          search,
          category,
          format,
          availability,
          sortBy,
          userId: user?.id || null,
        });
        setEvents(results);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [search, category, format, availability, sortBy, user?.id]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setFormat('All');
    setAvailability('All');
    setSortBy('upcoming');
    setSearchParams({});
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Campus Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Browse upcoming hackathons, competitive challenges, and workshops. Real-time capacity tracked directly against the database.
        </p>
        {user && (
          <div className="inline-flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Time-conflict shield active: Overlapping events for your registered slots are filtered out automatically.</span>
          </div>
        )}
      </div>

      {/* Search and Toggle Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setVisibleCount(6);
            }}
            placeholder="Search by event title, organizer, topic, or venue..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          selectedCategory={category}
          onSelectCategory={(cat) => {
            setCategory(cat);
            setVisibleCount(6);
          }}
          selectedFormat={format}
          onSelectFormat={(f) => {
            setFormat(f);
            setVisibleCount(6);
          }}
          selectedAvailability={availability}
          onSelectAvailability={(a) => {
            setAvailability(a);
            setVisibleCount(6);
          }}
          sortBy={sortBy}
          onSortBy={(s) => setSortBy(s)}
          onReset={handleResetFilters}
        />
      )}

      {/* Active Filter Indicators */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
        <div>
          Showing <span className="font-semibold text-slate-800">{visibleEvents.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{events.length}</span> events
        </div>
        {(category !== 'All' || format !== 'All' || availability !== 'All' || search) && (
          <button
            onClick={handleResetFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingState message="Filtering campus events..." />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No campus events found"
          message="Try changing your search term, category filters, or availability selection."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {visibleCount < events.length && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition"
              >
                Load More Events ({events.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

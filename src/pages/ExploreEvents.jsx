import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Calendar, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function ExploreEvents() {
  const [searchParams, setSearchParams] = useSearchParams();

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
        });
        setEvents(results);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [search, category, format, availability, sortBy]);

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
        <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Campus Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Campus Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Browse upcoming hackathons, competitive challenges, and workshops. Real-time capacity tracked directly against the database.
        </p>
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
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
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
          onSortBy={(s) => {
            setSortBy(s);
            setVisibleCount(6);
          }}
          onReset={handleResetFilters}
        />
      )}

      {/* Result Metrics */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
        <span>
          Showing <strong className="text-white">{events.length}</strong> matching event{events.length === 1 ? '' : 's'}
        </span>
        {category !== 'All' && (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-medium">
            Category: {category}
          </span>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingState message="Querying active campus database..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="Try broadening your category filter or search keywords."
          action={
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < events.length && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition shadow-md"
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
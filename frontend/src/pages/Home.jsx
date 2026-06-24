import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [error, setError] = useState('');

  const categories = ['All', 'Music', 'Tech', 'Sports', 'Arts', 'Food', 'Other'];

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/events?timeframe=${timeframe}`;
      if (category !== 'All') {
        url += `&category=${category}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to retrieve events');
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, timeframe]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="container">
      {/* Immersive Header Banner */}
      <div className="explore-header">
        <h1 className="explore-title">
          Discover Exceptional <span>Events</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '1rem' }}>
          Book tickets for live music festivals, conferences, local charity games, and digital art expos in seconds.
        </p>

        {/* Search and Filters bar */}
        <form onSubmit={handleSearchSubmit} className="search-filter-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by event title, venue, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '1.25rem' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Category selection & Timeframe selection */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="role-tabs" style={{ margin: 0, width: '220px' }}>
          <div 
            className={`role-tab-btn ${timeframe === 'upcoming' ? 'active' : ''}`}
            onClick={() => setTimeframe('upcoming')}
            style={{ padding: '0.4rem' }}
          >
            Upcoming
          </div>
          <div 
            className={`role-tab-btn ${timeframe === 'past' ? 'active' : ''}`}
            onClick={() => setTimeframe('past')}
            style={{ padding: '0.4rem' }}
          >
            Past
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-wrapper">
          <div className="spinner"></div>
          <p>Finding awesome events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state glass-card">
          <h3>No events found</h3>
          <p>Try adjustments to your search queries or category filters.</p>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

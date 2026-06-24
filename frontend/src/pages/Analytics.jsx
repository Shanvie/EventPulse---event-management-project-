import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#fbbf24', '#ec4899', '#9ca3af'];

const Analytics = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'organizer') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve analytics metrics');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="container loading-spinner-wrapper">
        <div className="spinner"></div>
        <p>Analyzing event data...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container empty-state glass-card" style={{ marginTop: '3rem' }}>
        <h3>Analytics Unavailable</h3>
        <p>{error || 'Unable to load organizer data'}</p>
        <button onClick={fetchAnalytics} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Organizer Dashboard</h2>

      {/* Numeric Stats Grid */}
      <div className="analytics-grid">
        <div className="glass-card stat-card">
          <span className="stat-title">Events Hosted</span>
          <span className="stat-value purple">{stats.totalEvents}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-title">Tickets Booked</span>
          <span className="stat-value cyan">{stats.totalTicketsSold}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-title">Estimated Revenue</span>
          <span className="stat-value green">${stats.totalRevenue}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-title">Attendee Check-In Rate</span>
          <span className="stat-value" style={{ color: '#ffffff' }}>{stats.checkInRate}%</span>
        </div>
      </div>

      {stats.totalTicketsSold === 0 ? (
        <div className="glass-card empty-state">
          <h3>No sales data to display yet</h3>
          <p>Once attendees start booking tickets for your events, analytics charts will populate here.</p>
        </div>
      ) : (
        <>
          {/* Charts section */}
          <div className="charts-grid">
            <div className="glass-card chart-wrapper">
              <h3 className="chart-title">Ticket Sales by Event</h3>
              <div style={{ flex: 1, minHeight: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.eventBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="title" stroke="#9ca3af" tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(16, 20, 38, 0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}
                      labelStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="ticketsSold" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card chart-wrapper">
              <h3 className="chart-title">Category Breakdown</h3>
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(16, 20, 38, 0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
                  {stats.salesByCategory.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span style={{ color: 'var(--text-muted)' }}>{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Event Breakdown Table */}
          <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Hosted Events Summary</h3>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Capacity</th>
                    <th>Sold</th>
                    <th>Check-Ins</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.eventBreakdown.map((event) => (
                    <tr key={event._id}>
                      <td style={{ fontWeight: 600 }}>{event.title}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>{event.capacity}</td>
                      <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{event.ticketsSold}</td>
                      <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{event.checkedInCount}</td>
                      <td style={{ fontWeight: 600 }}>${event.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings List */}
          {stats.recentBookings.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Ticket Bookings</h3>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Attendee</th>
                      <th>Event</th>
                      <th>Tickets</th>
                      <th>Total Paid</th>
                      <th>Check-in Status</th>
                      <th>Booked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.userName}</td>
                        <td style={{ fontWeight: 500 }}>{booking.eventTitle}</td>
                        <td>{booking.ticketCount}</td>
                        <td>${booking.totalPaid}</td>
                        <td>
                          <span className={`ticket-status-badge ${booking.checkedIn ? 'status-checked' : 'status-active'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                            {booking.checkedIn ? 'Checked In' : 'Active'}
                          </span>
                        </td>
                        <td>{new Date(booking.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;

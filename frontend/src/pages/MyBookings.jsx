import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve bookings');
      }
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleOpenTicket = (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const handleCloseTicket = () => {
    setSelectedBooking(null);
    setShowTicketModal(false);
  };

  if (loading) {
    return (
      <div className="container loading-spinner-wrapper">
        <div className="spinner"></div>
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Bookings</h2>

      {error && (
        <div className="alert-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state glass-card">
          <h3>No tickets booked yet</h3>
          <p>Explore our current catalog to book your first event!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Events</Link>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => {
            const event = booking.event;
            if (!event) return null;

            const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div key={booking._id} className="glass-card booking-card">
                <div>
                  <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
                    alt={event.title} 
                    className="booking-img" 
                  />
                </div>
                <div className="booking-details">
                  <h3>{event.title}</h3>
                  <div className="booking-detail-row">
                    <span>📅 {formattedDate}</span>
                    <span>📍 {event.venue ? event.venue.split(',')[0] : 'Remote'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      Tickets: <strong style={{ color: 'var(--secondary)' }}>{booking.ticketCount}</strong>
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      Paid: <strong style={{ color: '#ffffff' }}>${booking.totalPaid}</strong>
                    </span>
                  </div>
                </div>
                <div className="booking-actions">
                  <span className={`ticket-status-badge ${booking.checkedIn ? 'status-checked' : 'status-active'}`}>
                    {booking.checkedIn ? 'Checked In' : 'Active Ticket'}
                  </span>
                  <button onClick={() => handleOpenTicket(booking)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    View Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      {showTicketModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseTicket}>
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Entry Ticket</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Show this QR code at the gate</p>
            
            <div className="qr-container">
              <img 
                src={selectedBooking.qrCode} 
                alt="Ticket QR Code" 
                className="qr-code-img" 
              />
            </div>

            <div>
              <div className="booking-code-text">
                {selectedBooking.bookingCode}
              </div>
            </div>

            <div style={{ textAlign: 'left', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{selectedBooking.event.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                📅 {new Date(selectedBooking.event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                📍 {selectedBooking.event.venue}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quantity</span>
                  <p style={{ fontWeight: 'bold' }}>{selectedBooking.ticketCount} Person(s)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
                  <p style={{ fontWeight: 'bold', color: selectedBooking.checkedIn ? 'var(--accent-green)' : 'var(--secondary)' }}>
                    {selectedBooking.checkedIn ? 'CHECKED IN' : 'READY'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

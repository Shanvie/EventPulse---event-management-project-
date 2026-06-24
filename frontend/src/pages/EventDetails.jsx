import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';

const EventDetails = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [ticketCount, setTicketCount] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        throw new Error('Event not found');
      }
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleIncrement = () => {
    if (ticketCount < (event.capacity - event.ticketsSold)) {
      setTicketCount(ticketCount + 1);
    }
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handlePaymentSubmit = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: event._id,
          ticketCount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to book tickets');
      }

      setPaymentSuccess(true);
      
      // Delay before redirecting to allow success animation
      setTimeout(() => {
        setShowCheckout(false);
        navigate('/my-bookings');
      }, 2500);

    } catch (err) {
      alert(err.message || 'Error occurred during booking');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container loading-spinner-wrapper">
        <div className="spinner"></div>
        <p>Loading event information...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container empty-state glass-card" style={{ marginTop: '3rem' }}>
        <h3>Error loading details</h3>
        <p>{error || 'Event was not found'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Explore</Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const availableTickets = event.capacity - event.ticketsSold;
  const isSoldOut = availableTickets <= 0;
  const totalAmount = event.price * ticketCount;

  return (
    <div className="container">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
        ← Back to Events
      </Link>

      <div className="detail-layout">
        {/* Left Side - Details */}
        <div>
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
            alt={event.title} 
            className="detail-img" 
          />
          <div className="detail-body">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{event.description}</p>
            
            <div className="detail-meta-grid">
              <div className="meta-item">
                <h4>Date & Time</h4>
                <p>{formattedDate}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{event.time}</p>
              </div>
              <div className="meta-item">
                <h4>Venue</h4>
                <p>{event.venue}</p>
              </div>
              <div className="meta-item">
                <h4>Category</h4>
                <p>{event.category}</p>
              </div>
              <div className="meta-item">
                <h4>Organizer</h4>
                <p>{event.organizer ? event.organizer.name : 'Unknown Organizer'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Ticket Selection Sidebar */}
        <div>
          <div className="glass-card ticket-picker-card">
            <h3>Book Tickets</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ticket Price</span>
              <span className="event-price" style={{ fontSize: '1.5rem' }}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Availability</span>
              <span style={{ fontWeight: 600, color: isSoldOut ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {isSoldOut ? 'Sold Out' : `${availableTickets} tickets left`}
              </span>
            </div>

            {!isSoldOut && (
              <>
                {/* Counter */}
                <div className="ticket-counter-wrapper">
                  <span style={{ fontWeight: 600 }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={handleDecrement} 
                      className="counter-btn"
                      disabled={ticketCount <= 1}
                    >
                      -
                    </button>
                    <span className="counter-value">{ticketCount}</span>
                    <button 
                      onClick={handleIncrement} 
                      className="counter-btn"
                      disabled={ticketCount >= availableTickets}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="checkout-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${totalAmount}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax & Fees</span>
                    <span>$0.00</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: '2rem' }}>
              {!user ? (
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Login to Book
                </Link>
              ) : user.role === 'organizer' ? (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  Organizers Cannot Book
                </button>
              ) : isSoldOut ? (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  Sold Out
                </button>
              ) : (
                <button onClick={() => setShowCheckout(true)} className="btn btn-primary" style={{ width: '100%' }}>
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Overlay Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }}>
            <button 
              className="modal-close" 
              onClick={() => !paymentLoading && setShowCheckout(false)}
              disabled={paymentLoading}
            >
              &times;
            </button>

            {paymentSuccess ? (
              <div className="success-checkmark-overlay">
                <div className="checkmark-circle">
                  <span className="checkmark-icon">✓</span>
                </div>
                <h2>Payment Successful!</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Generating tickets and QR codes...
                </p>
              </div>
            ) : (
              <PaymentForm 
                totalAmount={totalAmount} 
                onSubmit={handlePaymentSubmit} 
                loading={paymentLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;

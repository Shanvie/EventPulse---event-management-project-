import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const { _id, title, date, venue, category, price, capacity, ticketsSold, imageUrl } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getBadgeClass = (cat) => {
    if (!cat) return 'badge-other';
    switch (cat.toLowerCase()) {
      case 'tech': return 'badge-tech';
      case 'music': return 'badge-music';
      case 'sports': return 'badge-sports';
      case 'arts': return 'badge-arts';
      case 'food': return 'badge-food';
      default: return 'badge-other';
    }
  };

  const isSoldOut = ticketsSold >= capacity;

  return (
    <div className="glass-card glass-card-hover event-card">
      <img 
        src={imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
        alt={title} 
        className="event-card-img" 
      />
      <div className="event-card-body">
        <span className={`event-badge ${getBadgeClass(category)}`}>{category}</span>
        <h3 className="event-title">{title}</h3>
        <p className="event-desc-preview">{event.description}</p>
        
        <div className="event-card-footer">
          <div className="event-meta-info">
            <span>📅 {formattedDate}</span>
            <span>📍 {venue ? venue.split(',')[0] : 'Remote'}</span>
            <span style={{ marginTop: '0.25rem' }}>👥 {ticketsSold}/{capacity} Booked</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span className={`event-price ${price === 0 ? 'free' : ''}`}>
              {price === 0 ? 'Free' : `$${price}`}
            </span>
            <Link 
              to={`/event/${_id}`} 
              className="btn btn-primary" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              {isSoldOut ? 'Sold Out' : 'Details'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

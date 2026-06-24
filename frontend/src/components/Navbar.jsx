import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          Event<span>Pulse</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Explore</Link>
          
          {user && user.role === 'attendee' && (
            <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>My Bookings</Link>
          )}

          {user && user.role === 'organizer' && (
            <>
              <Link to="/create-event" className={`nav-link ${isActive('/create-event')}`}>Create Event</Link>
              <Link to="/checkin" className={`nav-link ${isActive('/checkin')}`}>Check-In</Link>
              <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
            </>
          )}

          {user ? (
            <div className="nav-user">
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-user" style={{ borderLeft: 'none', paddingLeft: 0 }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import CreateEvent from './pages/CreateEvent';
import CheckIn from './pages/CheckIn';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
        <footer style={{ 
          textAlign: 'center', 
          padding: '2rem 0', 
          borderTop: '1px solid var(--border)', 
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          backgroundColor: 'rgba(4, 5, 10, 0.4)'
        }}>
          <p>© 2026 EventPulse. All rights reserved. Created as an Event Management System.</p>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;

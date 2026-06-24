import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CheckIn = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string }
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'organizer') {
      navigate('/');
    }
  }, [user, navigate]);

  const verifyTicket = async (code) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/bookings/verify/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setFeedback({
          success: true,
          message: `${data.message} - Attendee: ${data.booking.user.name} (Event: ${data.booking.event.title})`
        });
      } else {
        setFeedback({
          success: false,
          message: data.message || 'Verification failed.'
        });
      }
    } catch (err) {
      setFeedback({
        success: false,
        message: 'Network error verifying ticket.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only launch scanner on mount if organizer
    if (user && user.role === 'organizer') {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);
      setScannerInstance(scanner);

      function onScanSuccess(result) {
        scanner.clear().catch(e => console.error(e));
        setScanResult(result);
        verifyTicket(result);
      }

      function onScanError(err) {
        // Quietly ignore scan errors
      }

      return () => {
        scanner.clear().catch(error => {
          console.log("Scanner cleared during unmount");
        });
      };
    }
  }, [user]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      verifyTicket(manualCode.trim().toUpperCase());
    }
  };

  const handleResetScanner = () => {
    setScanResult('');
    setFeedback(null);
    
    // Rerender scanner
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });
    
    scanner.render(
      (result) => {
        scanner.clear().catch(e => console.error(e));
        setScanResult(result);
        verifyTicket(result);
      },
      () => {}
    );
    setScannerInstance(scanner);
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Check-In Portal</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
          Scan attendee tickets or enter their unique booking reference.
        </p>

        {/* Feedback box */}
        {feedback && (
          <div className={`scanner-feedback ${feedback.success ? 'feedback-success' : 'feedback-error'}`}>
            <span>{feedback.success ? '✅' : '❌'}</span>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action reset button if ticket checked */}
        {feedback && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button onClick={handleResetScanner} className="btn btn-primary">
              Scan Next Ticket
            </button>
          </div>
        )}

        {/* Scanner reader container */}
        <div style={{ display: scanResult ? 'none' : 'block' }}>
          <div className="scanner-box">
            <div className="scanner-laser"></div>
            <div id="reader" style={{ border: 'none', width: '100%' }}></div>
          </div>
        </div>

        {/* Manual Check-in */}
        <div className="manual-checkin-wrapper">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Manual Check-In</h3>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. EVM-K5J8L4P2"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              disabled={loading}
              style={{ flex: 1, textTransform: 'uppercase' }}
              required
            />
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Verifying...' : 'Check In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;

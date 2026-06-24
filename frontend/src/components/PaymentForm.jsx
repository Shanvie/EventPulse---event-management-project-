import React, { useState } from 'react';

const PaymentForm = ({ totalAmount, onSubmit, loading }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handleCvvFocus = () => {
    setIsFlipped(true);
  };

  const handleCvvBlur = () => {
    setIsFlipped(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setValidationError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardHolder.trim()) {
      setValidationError('Please enter the cardholder name.');
      return;
    }
    if (expiry.length !== 5) {
      setValidationError('Please enter expiry date in MM/YY format.');
      return;
    }
    const [month, year] = expiry.split('/');
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) {
      setValidationError('Please enter a valid month (01-12).');
      return;
    }
    if (cvv.length !== 3) {
      setValidationError('Please enter a valid 3-digit CVV.');
      return;
    }

    onSubmit();
  };

  return (
    <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Secure Checkout</h3>
      
      {/* Visual Credit Card */}
      <div className="credit-card-wrapper">
        <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of Card */}
          <div className="card-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-chip"></div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px', opacity: 0.8 }}>VISA</span>
            </div>
            
            <div className="card-number">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            
            <div className="card-holder-exp">
              <div>
                <div className="card-label">Card Holder</div>
                <div className="card-value">{cardHolder || 'FULL NAME'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="card-label">Expires</div>
                <div className="card-value">{expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div className="card-back">
            <div className="card-strip"></div>
            <div className="card-signature-wrapper">
              <div className="card-signature-bar"></div>
              <div className="card-cvv-box">{cvv || '•••'}</div>
            </div>
            <div style={{ padding: '0 1.5rem', marginTop: '1rem', textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5 }}>SECURE MOCK TRANSACTION</span>
            </div>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="alert-banner error" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <span>⚠️ {validationError}</span>
        </div>
      )}

      {/* Payment Form Fields */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cardNum">Card Number</label>
          <input
            id="cardNum"
            type="text"
            className="form-control"
            placeholder="4111 2222 3333 4444"
            value={cardNumber}
            onChange={handleCardNumberChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardName">Cardholder Name</label>
          <input
            id="cardName"
            type="text"
            className="form-control"
            placeholder="Sarah Jenkins"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="cardExpiry">Expiration Date</label>
            <input
              id="cardExpiry"
              type="text"
              className="form-control"
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiryChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardCvv">CVV</label>
            <input
              id="cardCvv"
              type="password"
              className="form-control"
              placeholder="123"
              value={cvv}
              onChange={handleCvvChange}
              onFocus={handleCvvFocus}
              onBlur={handleCvvBlur}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="checkout-summary" style={{ marginBottom: '1.5rem' }}>
          <div className="summary-row total">
            <span>Total amount:</span>
            <span>${totalAmount}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderTopColor: 'white' }}></div>
              Processing Transaction...
            </>
          ) : (
            `Pay $${totalAmount} USD`
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;

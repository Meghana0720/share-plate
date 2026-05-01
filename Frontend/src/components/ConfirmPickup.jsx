import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ConfirmPickup.css';

const ConfirmPickup = () => {
  const [uniqueCode, setUniqueCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (!uniqueCode.trim()) {
      setMessage('❌ Please enter a valid pickup code');
      setIsSuccess(false);
      return;
    }

    if (uniqueCode.trim().length < 6) {
      setMessage('❌ Please enter a complete pickup code');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('/api/donations/confirm-pickup', null, {
        params: { uniqueCode: uniqueCode.trim().toUpperCase() }
      });
      
      if (response.status === 200) {
        setMessage('✅ Pickup Confirmed — Thank you for helping reduce food waste! Your collection has been recorded.');
        setIsSuccess(true);
        setUniqueCode('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setMessage('❌ Invalid Code! Please check the code with the donor and try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <div className="confirm-pickup">
      <div className="pickup-header">
        <h2>✅ Confirm Food Pickup</h2>
        <p>Enter the unique code provided by the donor to confirm collection</p>
      </div>
      
      <div className="pickup-container">
        <div className="pickup-guide">
          <h3>How to Confirm Pickup</h3>
          <div className="guide-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Get Unique Code</h4>
                <p>Receive the unique pickup code from the donor after they accept your request</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Enter Code</h4>
                <p>Type the code exactly as provided by the donor</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Confirm Pickup</h4>
                <p>Click confirm to complete the pickup process</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Completion</h4>
                <p>The donation will be removed from the system automatically</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="pickup-form">
          <div className="form-group">
            <label htmlFor="uniqueCode">
              <span className="label-icon">🔑</span>
              Enter Unique Pickup Code
            </label>
            <input
              type="text"
              id="uniqueCode"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              placeholder="e.g., FDX927 or DONA1B2C3"
              required
              className="code-input"
              disabled={isSubmitting}
            />
            <div className="input-hint">
              Code should start with FDX or DON followed by numbers/letters
            </div>
          </div>
          
          <button 
            type="submit" 
            className="confirm-btn"
            disabled={isSubmitting || !uniqueCode.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Confirming...
              </>
            ) : (
              <>
                <span className="button-icon">✅</span>
                Confirm Pickup
              </>
            )}
          </button>
        </form>

        {message && (
          <div 
            className={`message ${isSuccess ? 'success' : 'error'} ${message ? 'show' : ''}`}
            onClick={clearMessage}
          >
            <div className="message-icon">
              {isSuccess ? '🎉' : '⚠️'}
            </div>
            <div className="message-content">
              {message}
            </div>
            <button className="message-close" onClick={clearMessage}>
              ×
            </button>
          </div>
        )}

        <div className="support-info">
          <div className="support-card">
            <div className="support-icon">💡</div>
            <div className="support-content">
              <h4>Need Help?</h4>
              <p>If you're having trouble with the pickup code, please contact the donor directly using the contact information they provided.</p>
              <ul>
                <li>Double-check the code for typos</li>
                <li>Ensure the code is entered in uppercase</li>
                <li>Contact the donor if the code doesn't work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPickup;
import React, { useState, useEffect } from 'react';
import { requestAPI } from '../service/api';
import '../styles/AcceptedList.css';

const AcceptedList = () => {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDonorName = localStorage.getItem('donorName');
    if (savedDonorName) {
      setDonorName(savedDonorName);
      fetchAcceptedRequests(savedDonorName);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAcceptedRequests = async (name) => {
    try {
      // CHANGED: Using requestAPI.getAcceptedByDonor instead of axios.get
      const response = await requestAPI.getAcceptedByDonor(name);
      setAcceptedRequests(response.data);
    } catch (error) {
      console.error('Error fetching accepted requests:', error);
      alert('Error fetching accepted requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Unique code copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy code. Please copy manually.');
    });
  };

  const getTimeRemaining = (requestedAt) => {
    const requested = new Date(requestedAt);
    const now = new Date();
    const sevenHours = 7 * 60 * 60 * 1000;
    const timePassed = now - requested;
    const timeRemaining = sevenHours - timePassed;
    
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="accepted-list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading accepted donations...</p>
        </div>
      </div>
    );
  }

  if (!donorName) {
    return (
      <div className="accepted-list">
        <div className="no-donor">
          <div className="no-donor-icon">👤</div>
          <h3>Donor Information Required</h3>
          <p>Please add a food donation first to see accepted requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accepted-list">
      <div className="accepted-header">
        <div className="header-content">
          <h2>✅ Accepted Donations</h2>
          <p>Track your accepted food donations and share pickup codes</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{acceptedRequests.length}</span>
            <span className="stat-label">Total Accepted</span>
          </div>
        </div>
      </div>

      {acceptedRequests.length === 0 ? (
        <div className="no-accepted">
          <div className="no-accepted-icon">📋</div>
          <h3>No Accepted Donations Yet</h3>
          <p>When you accept receiver requests, they'll appear here with unique pickup codes.</p>
          <div className="action-tips">
            <div className="tip">
              <span className="tip-icon">💡</span>
              <span>Go to the "Requested" tab to accept pending requests</span>
            </div>
            <div className="tip">
              <span className="tip-icon">💡</span>
              <span>Share the unique code with receivers for pickup</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="accepted-container">
          <div className="accepted-grid">
            {acceptedRequests.map(request => (
              <div key={request.id} className="accepted-card">
                <div className="card-header">
                  <div className="food-info">
                    <h3 className="food-name">{request.foodName}</h3>
                    <span className="status-badge">
                      <span className="badge-icon">✅</span>
                      Accepted
                    </span>
                  </div>
                  <div className="time-info">
                    <span className="time-remaining">
                      {getTimeRemaining(request.requestedAt)}
                    </span>
                    <span className="requested-time">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="receiver-info">
                  <div className="info-item">
                    <span className="info-label">Receiver:</span>
                    <span className="info-value">{request.receiverName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purpose:</span>
                    <span className="info-value purpose">{request.purpose}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Contact:</span>
                    <span className="info-value contact">{request.receiverContact}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Accepted:</span>
                    <span className="info-value">
                      {new Date(request.requestedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="unique-code-section">
                  <div className="code-header">
                    <span className="code-title">Pickup Code</span>
                    <button 
                      className="copy-button"
                      onClick={() => copyToClipboard(request.uniqueCode)}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="code-display">
                    <span className="code-value">{request.uniqueCode}</span>
                  </div>
                  <p className="code-instruction">
                    Share this code with the receiver. They need to enter it in the 
                    "Confirm Pickup" section to complete the collection.
                  </p>
                </div>

                <div className="pickup-instructions">
                  <h4>Pickup Instructions:</h4>
                  <ol>
                    <li>Share the unique code with the receiver</li>
                    <li>Receiver enters code in their dashboard</li>
                    <li>Donation marked as collected automatically</li>
                    <li>Record removed from system after confirmation</li>
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedList;
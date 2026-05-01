import React, { useState, useEffect } from 'react';
import { requestAPI } from '../service/api';
import '../styles/RequestedList.css';

const RequestedList = () => {
  const [requests, setRequests] = useState([]);
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const savedDonorName = localStorage.getItem('donorName');
    if (savedDonorName) {
      setDonorName(savedDonorName);
      fetchRequests(savedDonorName);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRequests = async (name) => {
    try {
      setRefreshing(true);
      // CHANGED: Using requestAPI.getByDonor instead of axios.get
      const response = await requestAPI.getByDonor(name);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Error fetching requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this request?')) {
      return;
    }

    try {
      // CHANGED: Using requestAPI.accept instead of axios.put
      await requestAPI.accept(requestId);
      fetchRequests(donorName);
      alert('Request accepted successfully! A unique code has been generated.');
    } catch (error) {
      alert('Error accepting request. Please try again.');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      // CHANGED: Using requestAPI.reject instead of axios.delete
      await requestAPI.reject(requestId);
      fetchRequests(donorName);
      alert('Request rejected successfully.');
    } catch (error) {
      alert('Error rejecting request. Please try again.');
    }
  };

  const refreshRequests = () => {
    if (donorName) {
      fetchRequests(donorName);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="requested-list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!donorName) {
    return (
      <div className="requested-list">
        <div className="no-donor">
          <div className="no-donor-icon">👤</div>
          <h3>Donor Information Required</h3>
          <p>Please add a food donation first to see receiver requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requested-list">
      <div className="requests-header">
        <div className="header-content">
          <h2> Receiver Requests</h2>
          <p>Manage requests for your food donations</p>
        </div>
        <button 
          className="refresh-button"
          onClick={refreshRequests}
          disabled={refreshing}
        >
          {refreshing ? '🔄' : '🔄'} Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="no-requests">
          <div className="no-requests-icon">📭</div>
          <h3>No Requests Yet</h3>
          <p>When receivers request your food, they'll appear here.</p>
          <div className="no-requests-tips">
            <div className="tip">
              <span className="tip-icon">💡</span>
              <span>Share your donation with local communities</span>
            </div>
            <div className="tip">
              <span className="tip-icon">💡</span>
              <span>Make sure your pincode is correct</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="requests-container">
          <div className="requests-stats">
            <div className="stat">
              <span className="stat-number">{requests.length}</span>
              <span className="stat-label">Total Requests</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {requests.filter(r => r.status === 'PENDING').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {requests.filter(r => r.status === 'ACCEPTED').length}
              </span>
              <span className="stat-label">Accepted</span>
            </div>
          </div>

          <div className="requests-grid">
            {requests.map(request => (
              <div key={request.id} className={`request-card ${request.status.toLowerCase()}`}>
                <div className="card-header">
                  <div className="food-info">
                    <h3 className="food-name">{request.foodName}</h3>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status === 'PENDING' ? '⏳ Pending' : '✅ Accepted'}
                    </span>
                  </div>
                  <span className="request-time">
                    {getTimeAgo(request.requestedAt)}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Receiver:</span>
                    <span className="detail-value">{request.receiverName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Purpose:</span>
                    <span className="detail-value purpose">{request.purpose}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value contact">{request.receiverContact}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value location">Pincode: {request.pincode}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requested:</span>
                    <span className="detail-value">
                      {new Date(request.requestedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="request-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAccept(request.id)}
                    >
                      <span className="btn-icon">✅</span>
                      Accept Request
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(request.id)}
                    >
                      <span className="btn-icon">❌</span>
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'ACCEPTED' && (
                  <div className="accepted-info">
                    <div className="accepted-badge">
                      <span className="badge-icon">🎯</span>
                      <span>Request Accepted</span>
                    </div>
                    <div className="unique-code">
                      <span className="code-label">Unique Code:</span>
                      <span className="code-value">{request.uniqueCode}</span>
                    </div>
                    <p className="accepted-note">
                      Share this code with the receiver for pickup confirmation
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestedList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SearchFood.css';

const SearchFood = () => {
  const [searchData, setSearchData] = useState({
    pincode: '',
    address: '',
    foodType: '',
    foodCategory: '',
    minServings: ''
  });
  
  const [donations, setDonations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestFormData, setRequestFormData] = useState({
    receiverName: '',
    purpose: '',
    receiverContact: ''
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter donations based on active filter
  const getFilteredDonations = () => {
    if (activeFilter === 'ALL') return donations;
    if (activeFilter === 'AVAILABLE') return donations.filter(d => getDonationStatus(d) === 'AVAILABLE');
    if (activeFilter === 'UPCOMING') return donations.filter(d => getDonationStatus(d) === 'UPCOMING');
    if (activeFilter === 'EXPIRED') return donations.filter(d => getDonationStatus(d) === 'EXPIRED');
    return donations;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchData.pincode.trim()) {
      alert('Please enter pincode to search for food donations');
      return;
    }

    if (searchData.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    setActiveFilter('ALL');
    
    try {
      const params = new URLSearchParams();
      params.append('pincode', searchData.pincode.trim());
      
      if (searchData.foodType && searchData.foodType !== '') {
        params.append('foodType', searchData.foodType);
      }
      if (searchData.foodCategory && searchData.foodCategory !== '') {
        params.append('foodCategory', searchData.foodCategory);
      }
      if (searchData.minServings && searchData.minServings > 0) {
        params.append('minServings', searchData.minServings);
      }

      const response = await axios.get(`/api/donations/search?${params}`);
      
      setDonations(response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for donations. Please try again.');
      setDonations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openRequestForm = (donation) => {
    setSelectedDonation(donation);
    setRequestFormData({
      receiverName: '',
      purpose: '',
      receiverContact: ''
    });
    setShowRequestForm(true);
  };

  const closeRequestForm = () => {
    setShowRequestForm(false);
    setSelectedDonation(null);
    setRequestFormData({
      receiverName: '',
      purpose: '',
      receiverContact: ''
    });
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendRequest = async () => {
    if (!selectedDonation) return;

    if (!requestFormData.receiverName.trim()) {
      alert('Please enter your full name');
      return;
    }

    if (!requestFormData.purpose.trim()) {
      alert('Please enter the purpose for requesting this food');
      return;
    }

    if (!requestFormData.receiverContact.trim()) {
      alert('Please enter your contact number');
      return;
    }

    if (requestFormData.receiverContact.length !== 10 || !/^\d+$/.test(requestFormData.receiverContact)) {
      alert('Please enter a valid 10-digit contact number');
      return;
    }

    setIsSubmittingRequest(true);
    
    try {
      await axios.post('/api/donations/request', {
        donationId: selectedDonation.id,
        receiverName: requestFormData.receiverName.trim(),
        purpose: requestFormData.purpose.trim(),
        receiverContact: requestFormData.receiverContact.trim(),
        pincode: searchData.pincode
      });
      
      alert('Request sent successfully! The donor will review your request and contact you if accepted.');
      closeRequestForm();
    } catch (error) {
      console.error('Request error:', error);
      alert('Error sending request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // ========== CORRECT AVAILABILITY CHECK ==========
  const isAvailableNow = (donation) => {
    const now = currentTime;
    const availableFromUTC = new Date(donation.availableFrom);
    const availableUntilUTC = new Date(donation.availableUntil);
    
    // Convert UTC to IST for comparison
    const availableFromIST = new Date(availableFromUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const availableUntilIST = new Date(availableUntilUTC.getTime() + (5.5 * 60 * 60 * 1000));
    
    return now >= availableFromIST && now <= availableUntilIST;
  };

  const getTimeRemaining = (availableUntil) => {
    const untilUTC = new Date(availableUntil);
    const untilIST = new Date(untilUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const now = currentTime;
    const timeRemaining = untilIST - now;
    
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  };

  const clearFilters = () => {
    setSearchData(prev => ({
      ...prev,
      foodType: '',
      foodCategory: '',
      minServings: ''
    }));
  };

  // ========== UPDATED TIME FORMATTING WITH SECONDS ==========
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      // Convert UTC to IST (add 5.5 hours)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      
      const day = istDate.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[istDate.getMonth()];
      const hours = istDate.getHours().toString().padStart(2, '0');
      const minutes = istDate.getMinutes().toString().padStart(2, '0');
      const seconds = istDate.getSeconds().toString().padStart(2, '0');
      
      return `${day} ${month} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  // ========== UPDATED AUTO-EXPIRE DISPLAY WITH SECONDS ==========
  const getTimeUntilExpiry = (autoExpireAt) => {
    if (!autoExpireAt) return null;
    
    const expiryUTC = new Date(autoExpireAt);
    const expiryIST = new Date(expiryUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const now = currentTime;
    const diffMs = expiryIST - now;
    
    if (diffMs <= 0) return { text: '⏰ Expired', class: 'expired' };
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffHours > 0) {
      return { 
        text: `⏳ ${diffHours}h ${diffMinutes}m ${diffSeconds}s left`, 
        class: diffHours <= 2 ? 'warning' : 'normal' 
      };
    } else if (diffMinutes > 0) {
      return { 
        text: `⚠️ ${diffMinutes}m ${diffSeconds}s left`, 
        class: 'urgent' 
      };
    } else {
      return { 
        text: `🔥 ${diffSeconds}s left`, 
        class: 'critical' 
      };
    }
  };

  const getExpiryReason = (donation) => {
    if (!donation.autoExpireAt) return '';
    
    const expiryUTC = new Date(donation.autoExpireAt);
    const foodExpiryUTC = new Date(donation.expiryTime);
    const availableUntilUTC = new Date(donation.availableUntil);
    
    if (foodExpiryUTC.getTime() === expiryUTC.getTime()) {
      return 'Food safety expiry';
    }
    
    const pickupWindowExpiry = new Date(availableUntilUTC.getTime() + (1 * 60 * 60 * 1000));
    if (pickupWindowExpiry.getTime() === expiryUTC.getTime()) {
      return 'Pickup window closed';
    }
    
    const createdAtUTC = new Date(donation.createdAt);
    const maxAge = new Date(createdAtUTC.getTime() + (24 * 60 * 60 * 1000));
    if (maxAge.getTime() === expiryUTC.getTime()) {
      return 'Maximum age (24h)';
    }
    
    if (donation.status === 'ACCEPTED') {
      return 'Pickup completion window';
    }
    
    return 'Auto-expire';
  };

  // Check donation status
  const getDonationStatus = (donation) => {
    const now = currentTime;
    const availableFromUTC = new Date(donation.availableFrom);
    const availableUntilUTC = new Date(donation.availableUntil);
    const expiryUTC = new Date(donation.expiryTime);
    
    // Convert to IST for comparison
    const availableFromIST = new Date(availableFromUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const availableUntilIST = new Date(availableUntilUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const expiryIST = new Date(expiryUTC.getTime() + (5.5 * 60 * 60 * 1000));
    
    if (donation.status !== 'PENDING') {
      return donation.status;
    }
    
    if (expiryIST < now) {
      return 'EXPIRED';
    }
    
    if (now < availableFromIST) {
      return 'UPCOMING';
    }
    
    if (now > availableUntilIST) {
      return 'CLOSED';
    }
    
    return 'AVAILABLE';
  };

  // Get current time display
  const getCurrentTimeDisplay = () => {
    const now = currentTime;
    const day = now.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${hours}:${minutes}:${seconds}`;
  };

  const filteredDonations = getFilteredDonations();

  return (
    <div className="search-food">
      {showRequestForm && selectedDonation && (
        <div className="request-form-modal">
          <div className="modal-overlay" onClick={closeRequestForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>📨 Request Food Donation</h3>
              <button className="modal-close" onClick={closeRequestForm}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="donation-summary">
                <h4>Requesting: {selectedDonation.foodName}</h4>
                <p><strong>Donor:</strong> {selectedDonation.donorName}</p>
                <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
                <p><strong>Location:</strong> {selectedDonation.city}, {selectedDonation.pincode}</p>
                <p><strong>Expires:</strong> {formatDateTime(selectedDonation.expiryTime)}</p>
                {selectedDonation.autoExpireAt && (
                  <p className="auto-expire-modal">
                    <strong>Auto-expires:</strong> {formatDateTime(selectedDonation.autoExpireAt)}
                    <small> ({getExpiryReason(selectedDonation)})</small>
                  </p>
                )}
              </div>
              
              <form className="request-form" onSubmit={(e) => { e.preventDefault(); sendRequest(); }}>
                <div className="form-group">
                  <label htmlFor="receiverName">Your Full Name *</label>
                  <input
                    type="text"
                    id="receiverName"
                    name="receiverName"
                    value={requestFormData.receiverName}
                    onChange={handleRequestFormChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="purpose">Purpose of Request *</label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    value={requestFormData.purpose}
                    onChange={handleRequestFormChange}
                    required
                    placeholder="e.g., For orphanage dinner, Community event, Personal need"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="receiverContact">Contact Number *</label>
                  <input
                    type="tel"
                    id="receiverContact"
                    name="receiverContact"
                    value={requestFormData.receiverContact}
                    onChange={handleRequestFormChange}
                    required
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                  />
                  <small>This will be shared with the donor for coordination</small>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={closeRequestForm}
                    disabled={isSubmittingRequest}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-request-btn"
                    disabled={isSubmittingRequest}
                  >
                    {isSubmittingRequest ? (
                      <>
                        <div className="button-spinner"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="search-header">
        <h2>🔍 Search Food Donations</h2>
        <p>Find available food in your area and help reduce food waste</p>
        <div className="current-time-display">
          <span className="time-icon">⏰</span>
          <span className="time-text">Current Time: {getCurrentTimeDisplay()}</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-basic">
          <div className="form-group">
            <label htmlFor="pincode">📍 Pincode *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={searchData.pincode}
              onChange={handleChange}
              required
              placeholder="Enter 6-digit pincode"
              maxLength="6"
              pattern="[0-9]{6}"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">🏠 Address / Area Name</label>
            <input
              type="text"
              id="address"
              name="address"
              value={searchData.address}
              onChange={handleChange}
              placeholder="Enter your area name (optional)"
            />
          </div>
        </div>

        <div className="filter-section">
          <button 
            type="button" 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="toggle-icon">
              {showFilters ? '▲' : '▼'}
            </span>
            {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>

          {showFilters && (
            <div className="search-filters">
              <div className="filter-group">
                <label htmlFor="foodType">🍴 Food Type</label>
                <select 
                  id="foodType" 
                  name="foodType" 
                  value={searchData.foodType} 
                  onChange={handleChange}
                >
                  <option value="">All Food Types</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="foodCategory">🥗 Food Category</label>
                <select 
                  id="foodCategory" 
                  name="foodCategory" 
                  value={searchData.foodCategory} 
                  onChange={handleChange}
                >
                  <option value="">All Categories</option>
                  <option value="Cooked Food">Cooked Food</option>
                  <option value="Packed Food">Packed Food</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="minServings">💪 Minimum Servings</label>
                <input
                  type="number"
                  id="minServings"
                  name="minServings"
                  value={searchData.minServings}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>

              <button 
                type="button" 
                className="clear-filters"
                onClick={clearFilters}
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="search-actions">
          <button 
            type="submit" 
            className="search-button" 
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="button-spinner"></div>
                Searching...
              </>
            ) : (
              <>
                <span className="button-icon">🔍</span>
                Search Food
              </>
            )}
          </button>
        </div>
      </form>

      <div className="search-results">
        {hasSearched && (
          <div className="results-header">
            <h3>
              {filteredDonations.length > 0 
                ? `🍽️ Found ${filteredDonations.length} Food Donation${filteredDonations.length > 1 ? 's' : ''}`
                : 'No Food Donations Found'
              }
            </h3>
            
            {/* Current Time Display */}
            <div className="time-header">
              <div className="real-time-indicator">
                <span className="live-dot"></span>
                <span className="live-text">LIVE</span>
                <span className="time-stamp">Last updated: {getCurrentTimeDisplay()}</span>
              </div>
            </div>
            
            {/* Status Filter Buttons */}
            <div className="status-filters">
              <button 
                className={`status-filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                <span className="filter-icon">📦</span> All ({donations.length})
              </button>
              <button 
                className={`status-filter-btn ${activeFilter === 'AVAILABLE' ? 'active' : ''}`}
                onClick={() => setActiveFilter('AVAILABLE')}
              >
                <span className="filter-icon">🟢</span> Available ({donations.filter(d => getDonationStatus(d) === 'AVAILABLE').length})
              </button>
              <button 
                className={`status-filter-btn ${activeFilter === 'UPCOMING' ? 'active' : ''}`}
                onClick={() => setActiveFilter('UPCOMING')}
              >
                <span className="filter-icon">🔵</span> Upcoming ({donations.filter(d => getDonationStatus(d) === 'UPCOMING').length})
              </button>
              <button 
                className={`status-filter-btn ${activeFilter === 'EXPIRED' ? 'active' : ''}`}
                onClick={() => setActiveFilter('EXPIRED')}
              >
                <span className="filter-icon">🔴</span> Expired ({donations.filter(d => getDonationStatus(d) === 'EXPIRED').length})
              </button>
            </div>
          </div>
        )}

        {isSearching ? (
          <div className="loading-results">
            <div className="spinner"></div>
            <p>Searching for food donations in your area...</p>
          </div>
        ) : hasSearched && filteredDonations.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h4>No food donations found</h4>
            <p>We couldn't find any food donations matching your criteria.</p>
            <div className="suggestions">
              <p><strong>Suggestions:</strong></p>
              <ul>
                <li>Try a different pincode</li>
                <li>Check if filters are too restrictive</li>
                <li>Try again later - new donations are added regularly</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="donations-grid">
            {filteredDonations.map(donation => {
              const available = isAvailableNow(donation);
              const timeUntilExpiry = getTimeUntilExpiry(donation.autoExpireAt);
              const status = getDonationStatus(donation);
              
              return (
                <div key={donation.id} className="donation-card">
                  <div className="card-header">
                    <h4 className="food-name">
                      <span className="food-emoji">
                        {donation.foodType === 'Veg' ? '🥗' : 
                         donation.foodType === 'Non-Veg' ? '🍗' :
                         donation.foodType === 'Vegan' ? '🌱' :
                         donation.foodType === 'Snacks' ? '🍪' : '🥤'}
                      </span>
                      {donation.foodName}
                    </h4>
                    <div className="availability-info">
                      <span className={`availability-badge ${
                        status === 'AVAILABLE' ? 'available' : 
                        status === 'UPCOMING' ? 'upcoming' : 
                        'expired'
                      }`}>
                        {status === 'AVAILABLE' ? '🟢 Available' : 
                         status === 'UPCOMING' ? '🔵 Upcoming' : 
                         status === 'EXPIRED' ? '🔴 Expired' :
                         status === 'CLOSED' ? '🔴 Closed' : status}
                      </span>
                      {status === 'AVAILABLE' && (
                        <span className="time-remaining">
                          {getTimeRemaining(donation.availableUntil)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {timeUntilExpiry && (
                    <div className="auto-expire-container">
                      <div className={`auto-expire-badge ${timeUntilExpiry.class}`}>
                        {timeUntilExpiry.text}
                      </div>
                      <div className="expiry-reason">
                        <small>Expiry: {getExpiryReason(donation)}</small>
                      </div>
                    </div>
                  )}
                  
                  <div className="card-details">
                    {/* Added icons for all fields */}
                    <div className="detail-item">
                      <span className="detail-label">📦 Quantity:</span>
                      <span className="detail-value">{donation.quantity}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">🍽️ Servings:</span>
                      <span className="detail-value servings">
                        {donation.approxServings} people
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">🍴 Type:</span>
                      <span className={`food-type ${donation.foodType.toLowerCase()}`}>
                        {donation.foodType}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">🥗 Category:</span>
                      <span className="detail-value">{donation.foodCategory}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">🧊 Storage:</span>
                      <span className="detail-value">{donation.storageCondition}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📊 Status:</span>
                      <span className="detail-value status">
                        {status}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">⏰ Food Expiry:</span>
                      <span className="detail-value expiry">
                        {formatDateTime(donation.expiryTime)}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📅 Available From:</span>
                      <span className="detail-value">
                        {formatDateTime(donation.availableFrom)}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📅 Available Until:</span>
                      <span className="detail-value">
                        {formatDateTime(donation.availableUntil)}
                      </span>
                    </div>
                    
                    {donation.autoExpireAt && (
                      <div className="detail-item">
                        <span className="detail-label">🚨 Auto-expires:</span>
                        <span className="detail-value auto-expire">
                          {formatDateTime(donation.autoExpireAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Donor:</span>
                      <span className="detail-value donor">
                        {donation.donorName} ({donation.donorType})
                      </span>
                    </div>
                    
                    {donation.donorEmail && (
                      <div className="detail-item">
                        <span className="detail-label">📧 Email:</span>
                        <span className="detail-value email">
                          {donation.donorEmail}
                        </span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-label">📞 Contact:</span>
                      <span className="detail-value contact">{donation.phoneNumber}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">🏠 Address:</span>
                      <span className="detail-value address">
                        {donation.address}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span className="detail-value location">
                        {donation.city}, {donation.pincode}
                        {donation.landmark && ` (${donation.landmark})`}
                      </span>
                    </div>
                    
                    {donation.specialInstructions && (
                      <div className="detail-item full-width">
                        <span className="detail-label">📝 Notes:</span>
                        <span className="detail-value instructions">
                          {donation.specialInstructions}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className={`request-button ${
                        status === 'AVAILABLE' ? 'available' : 
                        status === 'UPCOMING' ? 'upcoming' : 
                        'expired'
                      }`}
                      onClick={() => openRequestForm(donation)}
                      disabled={status !== 'AVAILABLE'}
                    >
                      {status === 'AVAILABLE' ? (
                        <>
                          <span className="button-icon">📨</span>
                          Send Request
                        </>
                      ) : status === 'UPCOMING' ? (
                        <>
                          <span className="button-icon">⏳</span>
                          Coming Soon
                        </>
                      ) : (
                        <>
                          <span className="button-icon">⏰</span>
                          Not Available
                        </>
                      )}
                    </button>
                    
                    {status === 'AVAILABLE' && (
                      <div className="quick-info">
                        <p>Click to request this food donation</p>
                        {timeUntilExpiry && timeUntilExpiry.class === 'urgent' && (
                          <p className="urgent-warning">⚠️ Expiring soon - request quickly!</p>
                        )}
                        {timeUntilExpiry && timeUntilExpiry.class === 'critical' && (
                          <p className="critical-warning">🔥 Expiring in seconds!</p>
                        )}
                      </div>
                    )}
                    
                    {status === 'UPCOMING' && (
                      <div className="quick-info">
                        <p>Will be available at {formatDateTime(donation.availableFrom)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFood;
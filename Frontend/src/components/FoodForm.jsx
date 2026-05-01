import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FoodForm.css';

const FoodForm = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    expiryTime: '',
    address: '',
    pincode: '',
    phoneNumber: '',
    foodType: 'Veg',
    foodCategory: 'Cooked Food',
    storageCondition: 'Normal',
    approxServings: '',
    landmark: '',
    city: '',
    availableFrom: '',
    availableUntil: '',
    donorName: '',
    donorEmail: '',
    donorType: 'Individual',
    specialInstructions: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoExpireEstimate, setAutoExpireEstimate] = useState('');

  const steps = [
    { number: 1, label: 'Food Info', icon: '📋' },
    { number: 2, label: 'Location', icon: '📍' },
    { number: 3, label: 'Timing', icon: '🕐' },
    { number: 4, label: 'Donor Info', icon: '👤' },
    { number: 5, label: 'Review', icon: '✅' }
  ];

  useEffect(() => {
    const savedDonorName = localStorage.getItem('donorName');
    if (savedDonorName) {
      setFormData(prev => ({ ...prev, donorName: savedDonorName }));
    }
  }, []);

  // Calculate auto-expire estimate when times change (using local times)
  useEffect(() => {
    if (formData.expiryTime && formData.availableFrom && formData.availableUntil) {
      const expiry = new Date(formData.expiryTime);
      const availableUntil = new Date(formData.availableUntil);
      const created = new Date();
      
      // Calculate earliest expiry (using local times)
      const options = [
        expiry, // Food safety expiry
        new Date(availableUntil.getTime() + 1 * 60 * 60 * 1000), // Pickup window closes 1 hour after availableUntil
        new Date(created.getTime() + 24 * 60 * 60 * 1000) // 24 hour maximum listing
      ];
      
      const earliest = options.reduce((a, b) => a < b ? a : b);
      const hours = Math.round((earliest - created) / (1000 * 60 * 60));
      
      // User-friendly messages
      if (earliest.getTime() === expiry.getTime()) {
        setAutoExpireEstimate(`⏰ This listing will expire when the food reaches its safety expiry time`);
      } else if (earliest.getTime() === new Date(availableUntil.getTime() + 1 * 60 * 60 * 1000).getTime()) {
        setAutoExpireEstimate(`📅 This listing will expire 1 hour after the pickup window closes`);
      } else if (hours <= 1) {
        const minutes = Math.round((earliest - created) / (1000 * 60));
        setAutoExpireEstimate(`⚠️ This donation will expire in ${minutes} minutes`);
      } else if (hours <= 6) {
        setAutoExpireEstimate(`⚠️ This donation will expire in ${hours} hours`);
      } else {
        setAutoExpireEstimate(`✅ This donation will be available for approximately ${hours} hours`);
      }
    } else {
      setAutoExpireEstimate('');
    }
  }, [formData.expiryTime, formData.availableFrom, formData.availableUntil]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'foodName':
        if (!value.trim()) error = 'Please enter the food name';
        break;
      case 'quantity':
        if (!value.trim()) error = 'Please enter the quantity (e.g., 2 kg, 5 plates)';
        break;
      case 'expiryTime':
        if (!value) {
          error = 'Please select when the food expires for safety';
        } else {
          const expiryDate = new Date(value);
          const now = new Date();
          
          if (expiryDate < now) {
            error = 'Food expiry time cannot be in the past';
          }
        }
        break;
      case 'address':
        if (!value.trim()) error = 'Please enter the pickup address';
        break;
      case 'pincode':
        if (!value.trim()) error = 'Pincode is required';
        else if (!/^\d{6}$/.test(value)) error = 'Please enter a valid 6-digit pincode';
        break;
      case 'phoneNumber':
        if (!value.trim()) error = 'Phone number is required for coordination';
        else if (!/^\d{10}$/.test(value)) error = 'Please enter a valid 10-digit phone number';
        break;
      case 'approxServings':
        if (!value.trim()) error = 'Please estimate how many people this can serve';
        else if (parseInt(value) < 1) error = 'Must serve at least 1 person';
        break;
      case 'city':
        if (!value.trim()) error = 'Please enter your city name';
        break;
      case 'availableFrom':
        if (!value) error = 'Please select when pickup can start';
        break;
      case 'availableUntil':
        if (!value) error = 'Please select when pickup must end';
        else if (formData.availableFrom && formData.expiryTime) {
          const from = new Date(formData.availableFrom);
          const until = new Date(value);
          const expiry = new Date(formData.expiryTime);
          
          if (until <= from) {
            error = 'Pickup end time must be after start time';
          } else if (until > expiry) {
            error = 'Pickup cannot be scheduled after food expiry time';
          }
        }
        break;
      case 'donorName':
        if (!value.trim()) error = 'Please enter your name or organization';
        break;
      case 'donorEmail':
        if (value && !/^\S+@\S+\.\S+$/.test(value)) error = 'Please enter a valid email address';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = () => {
    if (formData.availableFrom && formData.availableUntil) {
      const from = new Date(formData.availableFrom);
      const until = new Date(formData.availableUntil);
      const duration = (until - from) / (1000 * 60 * 60);
      return `${Math.round(duration)} hours`;
    }
    return '';
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ========== FIXED SUBMIT FUNCTION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: '❌ Please fix all validation errors before submitting.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      localStorage.setItem('donorName', formData.donorName);
      
      // FIXED: Properly convert local IST datetime to UTC
      const convertISTtoUTC = (istDateTime) => {
        if (!istDateTime) return '';
        
        // The datetime-local input gives us a string in local time (IST)
        // We need to convert it to UTC for storage
        const date = new Date(istDateTime);
        
        // Create a UTC date by subtracting the local timezone offset
        // For India (IST), we subtract 5.5 hours
        const utcDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));
        
        return utcDate.toISOString();
      };

      const donationData = {
        ...formData,
        expiryTime: convertISTtoUTC(formData.expiryTime),
        availableFrom: convertISTtoUTC(formData.availableFrom),
        availableUntil: convertISTtoUTC(formData.availableUntil),
        approxServings: parseInt(formData.approxServings) || 1,
        // Remove fields that backend will set
        status: undefined,
        createdAt: undefined,
        autoExpireAt: undefined
      };

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Local Times entered by user:');
      console.log('Expiry (Local):', formData.expiryTime);
      console.log('From (Local):', formData.availableFrom);
      console.log('Until (Local):', formData.availableUntil);
      console.log('\nUTC Times being sent to backend:');
      console.log('Expiry (UTC):', donationData.expiryTime);
      console.log('From (UTC):', donationData.availableFrom);
      console.log('Until (UTC):', donationData.availableUntil);
      console.log('============================');

      const response = await axios.post('/api/donations', donationData);
      
      setSubmitStatus({
        type: 'success',
        message: `Donation Added Successfully!`,
        uniqueId: response.data.uniqueId
      });
      
      // Reset form but keep donor name
      setFormData({
        foodName: '',
        quantity: '',
        expiryTime: '',
        address: '',
        pincode: '',
        phoneNumber: '',
        foodType: 'Veg',
        foodCategory: 'Cooked Food',
        storageCondition: 'Normal',
        approxServings: '',
        landmark: '',
        city: '',
        availableFrom: '',
        availableUntil: '',
        donorName: formData.donorName,
        donorEmail: '',
        donorType: 'Individual',
        specialInstructions: ''
      });
      setErrors({});
      setTouched({});
      setCurrentStep(1);
      setAutoExpireEstimate('');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: '❌ Error adding donation. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format IST time for display
  const formatLocalTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // For debugging: Show what times are being handled
  const showDebugInfo = () => {
    console.log('=== CURRENT FORM TIMES ===');
    console.log('Expiry:', formData.expiryTime, '-> UTC:', new Date(formData.expiryTime).toISOString());
    console.log('From:', formData.availableFrom, '-> UTC:', new Date(formData.availableFrom).toISOString());
    console.log('Until:', formData.availableUntil, '-> UTC:', new Date(formData.availableUntil).toISOString());
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="food-form-container">
      <div className="form-header">
        <h2>Share Your Food, Share Your Love</h2>
        <p>Join the movement to reduce food waste and help those in need</p>
      </div>

      <div className="form-progress">
        <div className="progress-line"></div>
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
        {steps.map((step) => (
          <div 
            key={step.number} 
            className="progress-step"
            onClick={() => {
              setCurrentStep(step.number);
              scrollToSection(`step-${step.number}`);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className={`step-indicator ${
                step.number === currentStep ? 'active' : 
                step.number < currentStep ? 'completed' : ''
              }`}
            >
              {step.number >= currentStep ? step.icon : ''}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {submitStatus && (
        <div className={`submit-status ${submitStatus.type}`}>
          <div className="status-icon">
            {submitStatus.type === 'success' ? '✅' : '❌'}
          </div>
          <div className="status-message">
            {submitStatus.message}
            {submitStatus.uniqueId && (
              <div className="unique-id">
                Donation ID: <strong>{submitStatus.uniqueId}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {autoExpireEstimate && (
        <div className="auto-expire-notice">
          <span className="auto-expire-icon">⏰</span>
          <span>{autoExpireEstimate}</span>
          <div className="auto-expire-explanation">
            <small>Based on earliest of: Food safety expiry, Pickup window +1h, or 24h maximum listing time</small>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="food-form">
        <div id="step-1" className="form-section">
          <div className="section-header">
            <div className="section-icon">📋</div>
            <h3>Food Details</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="foodName">Food Name</label>
              <input
                type="text"
                id="foodName"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="What food are you donating?"
                className={touched.foodName && errors.foodName ? 'error-input' : ''}
              />
              {touched.foodName && errors.foodName && (
                <div className="error-message">{errors.foodName}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., 2 kg, 5 plates, 3 boxes"
                className={touched.quantity && errors.quantity ? 'error-input' : ''}
              />
              {touched.quantity && errors.quantity && (
                <div className="error-message">{errors.quantity}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="expiryTime">Food Safety Expiry</label>
              <input
                type="datetime-local"
                id="expiryTime"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={touched.expiryTime && errors.expiryTime ? 'error-input' : ''}
              />
              {touched.expiryTime && errors.expiryTime ? (
                <div className="error-message">{errors.expiryTime}</div>
              ) : (
                <div className="helper-text">
                  <small>For food safety, donations expire automatically at this time</small>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="foodType">Food Type</label>
              <select
                id="foodType"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Snacks">Snacks</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="foodCategory">Food Category</label>
              <select
                id="foodCategory"
                name="foodCategory"
                value={formData.foodCategory}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="Cooked Food">Cooked Food</option>
                <option value="Packed Food">Packed Food</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="storageCondition">Storage Condition</label>
              <select
                id="storageCondition"
                name="storageCondition"
                value={formData.storageCondition}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="Normal">Room Temperature</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="approxServings">Approx. Servings</label>
              <input
                type="number"
                id="approxServings"
                name="approxServings"
                value={formData.approxServings}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="How many people can this serve?"
                min="1"
                className={touched.approxServings && errors.approxServings ? 'error-input' : ''}
              />
              {touched.approxServings && errors.approxServings && (
                <div className="error-message">{errors.approxServings}</div>
              )}
            </div>
          </div>
        </div>

        <div id="step-2" className="form-section">
          <div className="section-header">
            <div className="section-icon">📍</div>
            <h3>Pickup Location</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter complete address for pickup..."
                rows="3"
                className={touched.address && errors.address ? 'error-input' : ''}
              />
              {touched.address && errors.address && (
                <div className="error-message">{errors.address}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., 500001"
                pattern="[0-9]{6}"
                maxLength="6"
                className={touched.pincode && errors.pincode ? 'error-input' : ''}
              />
              {touched.pincode && errors.pincode && (
                <div className="error-message">{errors.pincode}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="landmark">Landmark (Optional)</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nearby famous location"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City / Area</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Your city name"
                className={touched.city && errors.city ? 'error-input' : ''}
              />
              {touched.city && errors.city && (
                <div className="error-message">{errors.city}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Contact Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                className={touched.phoneNumber && errors.phoneNumber ? 'error-input' : ''}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <div className="error-message">{errors.phoneNumber}</div>
              )}
            </div>
          </div>
        </div>

        <div id="step-3" className="form-section">
          <div className="section-header">
            <div className="section-icon">🕐</div>
            <h3>Pickup Schedule</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="availableFrom">Pickup Start Time</label>
              <input
                type="datetime-local"
                id="availableFrom"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={touched.availableFrom && errors.availableFrom ? 'error-input' : ''}
              />
              {touched.availableFrom && errors.availableFrom && (
                <div className="error-message">{errors.availableFrom}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="availableUntil">Pickup End Time</label>
              <input
                type="datetime-local"
                id="availableUntil"
                name="availableUntil"
                value={formData.availableUntil}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={touched.availableUntil && errors.availableUntil ? 'error-input' : ''}
              />
              {touched.availableUntil && errors.availableUntil ? (
                <div className="error-message">{errors.availableUntil}</div>
              ) : (
                <div className="helper-text">
                  <small>Food will be available for pickup until this time</small>
                </div>
              )}
            </div>
          </div>
          {calculateDuration() && (
            <div className="duration-display">
              <span className="duration-icon">⏱️</span>
              <span>Pickup window: {calculateDuration()}</span>
            </div>
          )}
        </div>

        <div id="step-4" className="form-section">
          <div className="section-header">
            <div className="section-icon">👤</div>
            <h3>About You</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="donorName">Your Name / Organization</label>
              <input
                type="text"
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="How should we address you?"
                className={touched.donorName && errors.donorName ? 'error-input' : ''}
              />
              {touched.donorName && errors.donorName && (
                <div className="error-message">{errors.donorName}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="donorEmail">Email Address (Optional)</label>
              <input
                type="email"
                id="donorEmail"
                name="donorEmail"
                value={formData.donorEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="your@email.com"
                className={touched.donorEmail && errors.donorEmail ? 'error-input' : ''}
              />
              {touched.donorEmail && errors.donorEmail && (
                <div className="error-message">{errors.donorEmail}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="donorType">You are donating as</label>
              <select
                id="donorType"
                name="donorType"
                value={formData.donorType}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="Individual">Individual</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Event">Event</option>
                <option value="NGO">NGO</option>
              </select>
            </div>
          </div>
        </div>

        <div id="step-5" className="form-section">
          <div className="section-header">
            <div className="section-icon">💬</div>
            <h3>Final Details</h3>
          </div>
          <div className="form-group">
            <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Any special instructions, allergies, handling requirements, or additional information..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Creating Your Donation...
              </>
            ) : (
              <>
                Share Your Food & Make a Difference
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm;
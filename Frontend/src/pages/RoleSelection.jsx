import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleDonorClick = () => {
    navigate('/donor');
  };

  const handleReceiverClick = () => {
    navigate('/receiver');
  };

  return (
    <div className="role-selection-container">
      {/* Professional Background */}
      <div className="role-background">
        <div className="gradient-overlay"></div>
        <div className="geometric-pattern"></div>
      </div>

      <div className="role-content">
        <div className="role-header">
          <h1 className="role-title">Choose Your Role</h1>
          <p className="role-subtitle">How would you like to contribute today?</p>
        </div>

        <div className="role-cards-container">
          {/* Donor Card */}
          <div className="role-card donor-card">
            <div className="card-content">
              <div className="card-icon">🎁</div>
              <h3 className="card-title">Donor</h3>
              <p className="card-description">
                Share your extra food and help feed those in need
              </p>
              <ul className="role-features">
                <li>Add food donations easily</li>
                <li>Manage receiver requests</li>
                <li>Track your impact</li>
                <li>Help reduce food waste</li>
              </ul>
              <div 
                className="card-action"
                onClick={handleDonorClick}
              >
                <span className="action-text">Start Donating</span>
                <span className="action-arrow">→</span>
              </div>
            </div>
          </div>

          {/* Receiver Card */}
          <div className="role-card receiver-card">
            <div className="card-content">
              <div className="card-icon">🙋‍♀️</div>
              <h3 className="card-title">Receiver</h3>
              <p className="card-description">
                Find and request available food in your area
              </p>
              <ul className="role-features">
                <li>Search by location</li>
                <li>Filter by preferences</li>
                <li>Easy pickup process</li>
                <li>Support your community</li>
              </ul>
              <div 
                className="card-action"
                onClick={handleReceiverClick}
              >
                <span className="action-text">Find Food</span>
                <span className="action-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
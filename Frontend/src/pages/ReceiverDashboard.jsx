import React, { useState } from 'react';
import SearchFood from '../components/SearchFood';
import ConfirmPickup from '../components/ConfirmPickup';
import '../styles/ReceiverDashboard.css';

const ReceiverDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');

  const tabs = [
    { id: 'search', label: '🔍 Search Food', component: <SearchFood /> },
    { id: 'confirm', label: '✅ Confirm Pickup', component: <ConfirmPickup /> }
  ];

  return (
    <div className="receiver-dashboard">
      {/* Animated Header */}
      <div className="dashboard-header">
        <div className="header-background"></div>
        <div className="header-content">
          <h1 className="dashboard-title">Receiver Dashboard</h1>
          <p className="dashboard-subtitle">
            Find available food donations in your area and help reduce food waste
          </p>
          <div className="header-features">
            <div className="feature">
              <div className="feature-icon">📍</div>
              <div className="feature-text">Search by Location</div>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">Quick & Easy</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🆓</div>
              <div className="feature-text">Completely Free</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation-container">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <div className="tab-indicator"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        <div className="tab-content">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="floating-actions">
        <div className="floating-action-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`floating-action ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <span>{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
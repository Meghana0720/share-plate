import React, { useState } from 'react';
import FoodForm from '../components/FoodForm';
import RequestedList from '../components/RequestedList';
import AcceptedList from '../components/AcceptedList';
import '../styles/DonorDashboard.css';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('form');

  const tabs = [
    { id: 'form', label: 'Food Form', component: <FoodForm /> },
    { id: 'requested', label: 'Requested', component: <RequestedList /> },
    { id: 'accepted', label: 'Accepted', component: <AcceptedList /> }
  ];

  return (
    <div className="donor-dashboard">
      {/* Professional Background */}
      <div className="dashboard-background"></div>
      <div className="gradient-overlay"></div>
      <div className="geometric-pattern"></div>

      {/* Animated Header */}
      <div className="dashboard-header">
        <div className="header-background"></div>
        <div className="header-content">
          <h1 className="dashboard-title">Donor Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your food donations and make a difference in your community
          </p>
          {/* STATS SECTION REMOVED */}
        </div>
      </div>

      {/* Rest of your existing code remains the same */}
      <div className="tab-navigation-container">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              <div className="tab-indicator"></div>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content-container">
        <div className="tab-content">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

      <div className="floating-actions">
        <div className="floating-action-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`floating-action ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
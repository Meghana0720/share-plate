import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Animated Background Elements */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <div className="main-title">
            <span className="title-gradient">Share Plate</span>
            <span className="title-subtitle">Premium Food Sharing Platform</span>
          </div>

          <div className="motivational-text">
            <p className="quote">"Be a reason someone smiles today."</p>
            <p className="quote">"A small act of sharing can make a big difference."</p>
            <p className="quote">"Together, let's end food waste and hunger."</p>
          </div>

          {/* CTA Button */}
          <button 
            className="cta-button"
            onClick={() => navigate('/role')}
          >
            <span>Start Sharing Today</span>
            <span className="button-arrow">➡️</span>
            <div className="button-glow"></div>
          </button>

          {/* Features Grid */}
          <div className="features-grid">
            <div className="feature-card">
              <h3>Quick & Easy</h3>
              <p>Share food in just a few clicks</p>
            </div>
            <div className="feature-card">
              <h3>Reduce Waste</h3>
              <p>Save food from going to waste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
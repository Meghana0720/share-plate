import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role" element={<RoleSelection />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/receiver" element={<ReceiverDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
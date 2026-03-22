import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Target, ArrowLeft, Sparkles, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SelectionScreen.css';

// --- ANIMATION VARIANTS (Faster & Snappier for this screen) ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const SelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL SYSTEM WARNING: Are you SURE you want to permanently terminate your data and profile? This action cannot be reversed.')) {
      try {
        await fetch('http://localhost:5000/api/auth/delete', { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${user?.token}` } 
        });
        logout(); 
        navigate('/');
      } catch (error) {
        alert("System Error: Security handshake failed. Please try again.");
      }
    }
  };

  return (
    <div className="selection-container">
      {/* Shared Aesthetic Background Grid */}
      <div className="cyber-grid"></div>
      <div className="ambient-glow"></div>

      {/* Top Navigation Bar */}
      <motion.div 
        className="top-nav-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="nav-btn nav-back" onClick={() => navigate('/')}>
          <ArrowLeft className="btn-icon" size={16} /> SYSTEM_CORE
        </button>
        
        <div className="nav-actions">
          <button className="nav-btn nav-danger" onClick={handleDeleteAccount}>
            <Trash2 className="btn-icon" size={15} /> TERMINATE_PROFILE
          </button>
          <button className="nav-btn nav-logout" onClick={handleLogout}>
            DISCONNECT <LogOut className="btn-icon" size={15} />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="selection-content"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="selection-header">
          <div className="system-badge mx-auto mb-4">
            <Sparkles className="badge-icon" size={14} /> 
            AGENT: {user?.name?.toUpperCase() || 'UNKNOWN_ID'}
          </div>
          <h1 className="selection-title">
            Initialize <span className="highlight-text animated-gradient">Sequence</span>
          </h1>
          <p className="selection-subtitle">Authenticate connection: Select operational pathway.</p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div variants={fadeUp} className="selection-grid">
          
          {/* PATH CARD 1: PREPARATION */}
          <motion.div 
            whileHover={{ translateY: -12, borderTopColor: '#00f2fe' }} 
            whileTap={{ scale: 0.98 }} 
            className="path-card prep-card premium-border" 
            onClick={() => navigate('/preparation')}
          >
            <div className="card-glow prep-glow"></div>
            
            {/* --- NEW: THE "CYBER NET" ANIMATED HEADER --- */}
            <div className="cyber-header prep-header-bg">
                {/* CSS creates a matrix of glowing dots here */}
                <div className="matrix-layer matrix-dots"></div>
                <div className="matrix-layer matrix-lines"></div>
                {/* The Floating Center Core */}
                <div className="cyber-core prep-core">
                    <BookOpen className="core-icon prep-icon" />
                    <div className="core-pulse prep-pulse"></div>
                </div>
            </div>

            <div className="card-text-content">
              <h2>PREPERATION</h2>
              <p>Master the syllabus mechanics. Initiate diagnostic subroutines and ingest AI-curated video videoTelemetry for precise error correction.</p>
              <motion.div className="path-action action-cyan" initial={{ x: 0 }} whileHover={{ x: 10 }}>
                Enter Syllabus Protocol &rarr;
              </motion.div>
            </div>
          </motion.div>

          {/* PATH CARD 2: PRACTICE */}
          <motion.div 
            whileHover={{ translateY: -12, borderTopColor: '#ec4899' }} 
            whileTap={{ scale: 0.98 }} 
            className="path-card practice-card premium-border" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="card-glow practice-glow"></div>
            
            {/* --- NEW: THE "CYBER NET" ANIMATED HEADER --- */}
            <div className="cyber-header practice-header-bg">
                <div className="matrix-layer matrix-dots"></div>
                <div className="matrix-layer matrix-lines"></div>
                <div className="cyber-core practice-core">
                    <Target className="core-icon practice-icon" />
                    <div className="core-pulse practice-pulse"></div>
                </div>
            </div>

            <div className="card-text-content">
              <h2>PRACTICE</h2>
              <p>Engage in full-length combat mock simulations under real-time exam telemetry. Receive instantaneous AI grading against neural net rubrics.</p>
              <motion.div className="path-action action-pink" initial={{ x: 0 }} whileHover={{ x: 10 }}>
                Enter Combat Arena &rarr;
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectionScreen;

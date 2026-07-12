import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Headphones, BarChart3, Lock } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="home-nav">
        <div className="nav-logo">
          <ShieldCheck size={28} className="brand-logo-icon" />
          <span>CMS Hub</span>
        </div>
        <div className="nav-links">
          <Link to="/about" className="text-link">About</Link>
          <Link to="/contact" className="text-link">Contact</Link>
          <Link to="/login" className="btn-secondary nav-btn">Sign In</Link>
          <Link to="/register" className="btn-primary nav-btn">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="badge-promo">Enterprise Support Solution</span>
          <h1 className="hero-title">
            Resolve Issues with <br />
            <span className="accent-text">Transparency & Speed</span>
          </h1>
          <p className="hero-subtitle">
            A state-of-the-art Complaint Management System designed to bridge the gap between clients, agents, and administrators with real-time tracking, messaging, and analytical insights.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary cta-btn">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary cta-btn">
              Track Complaint Status
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="glass-blob blob-1"></div>
          <div className="glass-blob blob-2"></div>
          <div className="hero-card glass-card">
            <div className="card-header-mock">
              <span className="mock-dot red"></span>
              <span className="mock-dot yellow"></span>
              <span className="mock-dot green"></span>
            </div>
            <div className="card-content-mock">
              <div className="mock-title">Active Complaint Ticket</div>
              <div className="mock-progress">
                <span className="progress-bar-fill" style={{ width: '65%' }}></span>
              </div>
              <div className="mock-stats-row">
                <div className="mock-stat">
                  <span>Status</span>
                  <span className="mock-badge">In Progress</span>
                </div>
                <div className="mock-stat">
                  <span>Priority</span>
                  <span className="mock-badge urgent">High</span>
                </div>
              </div>
              <div className="mock-chat-bubble">
                <span className="bubble-sender">Sarah (Agent)</span>
                <p>Hello David, diagnostics are run. Your issue is assigned!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="features-section">
        <h2 className="section-title">Engineered for Support Excellence</h2>
        <p className="section-subtitle">Everything you need to streamline customer support, optimize responses, and review team performance.</p>
        
        <div className="features-grid">
          <div className="feature-card glass-card">
            <Zap className="feature-icon" size={32} />
            <h3>Real-Time Chat</h3>
            <p>Direct live chat between submitting users and assigned agents with instant notifications and typing indicators.</p>
          </div>

          <div className="feature-card glass-card">
            <Headphones className="feature-icon" size={32} />
            <h3>Role-Based Routing</h3>
            <p>Strict access control ensuring Users, Agents, and Administrators have customized workflows tailored to their scope.</p>
          </div>

          <div className="feature-card glass-card">
            <BarChart3 className="feature-icon" size={32} />
            <h3>Analytics Dashboard</h3>
            <p>Admin dashboards displaying monthly charts, category distributions, agent scorecards, and average resolution times.</p>
          </div>

          <div className="feature-card glass-card">
            <Lock className="feature-icon" size={32} />
            <h3>Secure Verification</h3>
            <p>Secure password hashing, input validations, file uploads, JWT authentication, and token-based email verifications.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2026 CMS Hub Inc. All rights reserved. Designed for pairing development.</p>
      </footer>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Info, CheckCircle, Users, BarChart } from 'lucide-react';
import './Home.css'; // Reuse landing elements

const About = () => {
  return (
    <div className="home-container">
      <header className="home-nav">
        <div className="nav-logo">
          <ShieldCheck size={28} className="brand-logo-icon" />
          <span>CMS Hub</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="text-link">Home</Link>
          <Link to="/contact" className="text-link">Contact</Link>
          <Link to="/login" className="btn-secondary nav-btn">Sign In</Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card-no-hover" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Info size={40} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>About CMS</h1>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            The Complaint Management System (CMS) is a state-of-the-art communication platform built on the MERN stack. Designed to address friction in customer service, it offers high transparency and speed, allowing departments to resolve tickets through structural workflows.
          </p>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2rem 0 1rem 0' }}>Core Workflows</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)', marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>User Submission:</strong> Customers register complaints, supply attachments, and rate the resolution once closed.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)', marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Agent Ownership:</strong> Support agents gain a filtered queue of issues, updating statuses from Assigned to In Progress, and ending at Resolved.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)', marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Real-time Collaboration:</strong> Sockets enable instant chat rooms for each individual complaint to resolve inquiries quickly.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)', marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Analytical Insights:</strong> Admins access monthly trends, category spreads, and agent ranking statistics to inspect metrics.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
              Join CMS Hub Now
            </Link>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 CMS Hub Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;

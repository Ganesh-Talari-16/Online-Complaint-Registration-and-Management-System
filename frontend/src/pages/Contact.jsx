import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been received! Our support team will reach out shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="home-container">
      <ToastContainer position="top-right" theme="dark" />
      <header className="home-nav">
        <div className="nav-logo">
          <ShieldCheck size={28} className="brand-logo-icon" />
          <span>CMS Hub</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="text-link">Home</Link>
          <Link to="/about" className="text-link">About</Link>
          <Link to="/login" className="btn-secondary nav-btn">Sign In</Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Info Card */}
          <div className="glass-card-no-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get in Touch</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Have questions about platform integration, custom roles, or SLAs? Fill out the form and our administrator team will contact you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Mail size={22} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>support@cmshub.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Phone size={22} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>+1 (800) 555-0199</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <MapPin size={22} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Global Headquarters</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>100 Support Pkwy, Tech Valley, CA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send a Message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message</label>
                <textarea
                  rows={4}
                  required
                  className="input-field"
                  style={{ resize: 'none' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 CMS Hub Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;

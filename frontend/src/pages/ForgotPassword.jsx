import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Mail, ArrowLeft, Send } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Password reset link sent to email!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      padding: '2rem',
      position: 'relative'
    }}>
      <ToastContainer theme="dark" position="top-right" />
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#6366f1', marginBottom: '1rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            We'll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              ✓ Reset Link Sent
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              Please check your email inbox at <strong>{email}</strong> for instructions on completing password reset.
            </p>
            <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <ArrowLeft size={18} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '0.85rem' }}>
              <Send size={18} /> {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, UserPlus, User, Mail, Lock, Phone, HelpCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { name, email, password, phone, role } = formData;
    const result = await register(name, email, password, phone, role);
    setSubmitting(false);

    if (result.success) {
      toast.success('Registered successfully! A verification email has been sent.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      toast.error(result.error);
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ToastContainer theme="dark" position="top-right" />
      
      {/* Background decoration */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(120px)', borderRadius: '50%', top: '5%', right: '10%', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'rgba(192, 132, 252, 0.12)', filter: 'blur(120px)', borderRadius: '50%', bottom: '5%', left: '10%', zIndex: 1 }}></div>

      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', zIndex: 2, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyText: 'center', width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#6366f1', marginBottom: '1rem', justifyContent: 'center' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Join CMS Hub to handle inquiries</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="David Client"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="+1 555 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Account Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label className="glass-card-no-hover" style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderRadius: '8px',
                border: formData.role === 'USER' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                background: formData.role === 'USER' ? 'var(--primary-glow)' : 'transparent'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={formData.role === 'USER'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Client User</span>
              </label>

              <label className="glass-card-no-hover" style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderRadius: '8px',
                border: formData.role === 'AGENT' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                background: formData.role === 'AGENT' ? 'var(--primary-glow)' : 'transparent'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="AGENT"
                  checked={formData.role === 'AGENT'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Support Agent</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            <UserPlus size={18} /> {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

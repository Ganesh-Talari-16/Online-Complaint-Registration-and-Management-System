import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message);
          
          // If user object is stored, update their verified state in cache
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.isVerified = true;
            localStorage.setItem('user', JSON.stringify(parsed));
            setUser(parsed);
          }
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verify();
  }, [token, setUser]);

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
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#6366f1', marginBottom: '1rem', justifyContent: 'center' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Email Verification</h2>
        </div>

        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0' }}>
            <Loader2 size={40} className="spinner" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Verifying your email address, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Verification Successful!</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              {message}
            </p>
            <Link to="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              Proceed to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <XCircle size={48} />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Verification Failed</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              {message}
            </p>
            <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              Back to Sign In
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;

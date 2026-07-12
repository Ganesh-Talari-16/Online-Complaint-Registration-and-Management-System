import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, FileText, CheckCircle, Clock, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setStats(res.data.data.stats);
          setRecent(res.data.data.recent);
        }
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Assigned': return 'badge-assigned';
      case 'In Progress': return 'badge-inprogress';
      case 'Resolved': return 'badge-resolved';
      case 'Closed': return 'badge-closed';
      case 'Reopened': return 'badge-reopened';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
          <div style={{ color: '#6366f1', fontWeight: 'bold' }}>Loading Metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="Client Dashboard" />
        <main className="dashboard-content">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Welcome Back, {user?.name}</h1>
              <p>Submit and monitor support complaints</p>
            </div>
            <Link to="/create-complaint" className="btn-primary">
              <Plus size={18} /> File Complaint
            </Link>
          </div>

          {/* Verification Warning */}
          {!user?.isVerified && (
            <div className="glass-card-no-hover" style={{ borderLeft: '4px solid var(--warning)', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(245, 158, 11, 0.05)' }}>
              <AlertCircle style={{ color: 'var(--warning)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>Verify Your Email Address</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                  Please check your inbox. Verifying your account unlocks full resolution capabilities and chat history.
                </p>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="dashboard-grid">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Filed</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.total}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
                  <FileText size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.pending}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '8px' }}>
                  <Clock size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.inProgress}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)', borderRadius: '8px' }}>
                  <Clock size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Resolved / Closed</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.resolved}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}>
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Complaints Table */}
          <div className="glass-card-no-hover" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Activity</h3>
            {recent.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No complaints recorded yet. Click "File Complaint" above to submit one.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Complaint Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Agent</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((complaint) => (
                      <tr key={complaint._id}>
                        <td style={{ fontWeight: 600 }}>{complaint.title}</td>
                        <td>{complaint.category}</td>
                        <td>
                          <span className={`priority-tag priority-${complaint.priority.toLowerCase()}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          {complaint.assignedAgentId ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img
                                src={complaint.assignedAgentId.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40'}
                                alt="agent avatar"
                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                              />
                              <span>{complaint.assignedAgentId.name}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Assigned</span>
                          )}
                        </td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/complaints/${complaint._id}`} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
                            View <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;

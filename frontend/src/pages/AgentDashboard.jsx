import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, Award, CheckCircle2, Hourglass, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ assigned: 0, resolved: 0, averageResolutionTime: 0, performanceScore: 5.0 });
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
        toast.error('Failed to load agent dashboard statistics');
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

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
          <div style={{ color: '#6366f1', fontWeight: 'bold' }}>Loading Agent Queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="Agent Support Queue" />
        <main className="dashboard-content">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Welcome Back, {user?.name}</h1>
              <p>Resolve client inquiries and check performance scorecards</p>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="dashboard-grid">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Cases</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.assigned}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
                  <ClipboardList size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Resolved Total</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.resolved}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Resolution Time</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{formatTime(stats.averageResolutionTime)}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)', borderRadius: '8px' }}>
                  <Hourglass size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Performance Rating</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.performanceScore.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 5.0</span></h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '8px' }}>
                  <Award size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Assigned complaints queue */}
          <div className="glass-card-no-hover" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Active Support Tickets</h3>
            {recent.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active complaints assigned to you right now. Great job!
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Complaint Title</th>
                      <th>Client Submitter</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((complaint) => (
                      <tr key={complaint._id}>
                        <td style={{ fontWeight: 600 }}>{complaint.title}</td>
                        <td>{complaint.userId?.name || 'Unknown Client'}</td>
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
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/complaints/${complaint._id}`} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
                            Manage & Chat <ExternalLink size={14} />
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

export default AgentDashboard;

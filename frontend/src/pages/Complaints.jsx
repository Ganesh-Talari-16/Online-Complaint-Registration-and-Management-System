import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      toast.error('Failed to load complaints queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters.status, filters.category, filters.priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', priority: '', search: '' });
  };

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

  const getPageTitle = () => {
    if (user?.role === 'AGENT') return 'My Assigned Support Cases';
    if (user?.role === 'ADMIN') return 'Global Complaint Records';
    return 'My Filed Complaints';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title={getPageTitle()} />
        <main className="dashboard-content">
          
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>{getPageTitle()}</h1>
              <p>Search, filter, and track complaint statuses</p>
            </div>
            {user?.role === 'USER' && (
              <Link to="/create-complaint" className="btn-primary">
                File a Complaint
              </Link>
            )}
          </div>

          {/* Filters Panel */}
          <div className="glass-card-no-hover" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search by title or description..."
                    style={{ paddingLeft: '40px' }}
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  Search
                </button>
                <button type="button" onClick={clearFilters} className="btn-secondary" style={{ padding: '0.5rem' }} title="Reset Filters">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>Filter Status</label>
                  <select
                    className="input-field"
                    style={{ background: '#0b0f19' }}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>Filter Category</label>
                  <select
                    className="input-field"
                    style={{ background: '#0b0f19' }}
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Account Issues">Account Issues</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>Filter Priority</label>
                  <select
                    className="input-field"
                    style={{ background: '#0b0f19' }}
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

            </form>
          </div>

          {/* List display */}
          <div className="glass-card-no-hover">
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                Fetching queues...
              </div>
            ) : complaints.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No complaints match the specified search and filter criteria.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      {user?.role !== 'USER' && <th>Client</th>}
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint._id}>
                        <td style={{ fontWeight: 600 }}>{complaint.title}</td>
                        {user?.role !== 'USER' && (
                          <td>{complaint.userId?.name || 'Deleted Client'}</td>
                        )}
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
                            View details <Eye size={14} />
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

export default Complaints;

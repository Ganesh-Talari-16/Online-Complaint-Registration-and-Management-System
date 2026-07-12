import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Shield, Trash2, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const UserManagement = () => {
  const { user: currentLoggedInUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to load user directories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const nextRole = currentRole === 'USER' ? 'AGENT' : 'USER';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      const res = await api.put(`/auth/users/${userId}/role`, { role: nextRole });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentLoggedInUser._id) {
      return toast.error('You cannot delete your own logged-in account.');
    }
    if (!window.confirm('Are you sure you want to delete this user account permanently? All related profiles will be deleted.')) return;

    try {
      const res = await api.delete(`/auth/users/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="Client Directory" />
        <ToastContainer theme="dark" position="top-right" />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>User Accounts Management</h1>
              <p>Promote accounts to support agents or delete registrations</p>
            </div>
          </div>

          <div className="glass-card-no-hover">
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                Fetching user index...
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No registered accounts in the system.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Profile Picture</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Verified Status</th>
                      <th>Registration Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40'}
                            alt="Avatar"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{u.name} {u._id === currentLoggedInUser._id && '(You)'}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'AGENT' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            color: u.role === 'ADMIN' ? 'var(--danger)' : u.role === 'AGENT' ? 'var(--info)' : 'var(--text-primary)'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.isVerified ? (
                            <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <CheckCircle size={14} /> Verified
                            </span>
                          ) : (
                            <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <XCircle size={14} /> Unverified
                            </span>
                          )}
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'ADMIN' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleRoleChange(u._id, u.role)}
                                className="btn-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                                title="Toggle Role"
                              >
                                <ArrowUpDown size={14} /> Swap Role
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="btn-secondary"
                                style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
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

export default UserManagement;

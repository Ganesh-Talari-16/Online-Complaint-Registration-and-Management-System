import React, { useEffect, useState } from 'react';
import api from '../api';
import { Award, Briefcase, RefreshCw, Star } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newSpecialization, setNewSpecialization] = useState('');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agents');
      if (res.data.success) {
        setAgents(res.data.agents);
      }
    } catch (err) {
      toast.error('Failed to retrieve agent records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleUpdateSpecializationSubmit = async (e, agentUserId) => {
    e.preventDefault();
    if (!newSpecialization) return;
    try {
      const res = await api.put(`/agents/${agentUserId}`, { specialization: newSpecialization });
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedAgent(null);
        fetchAgents();
      }
    } catch (err) {
      toast.error('Failed to change agent specialization');
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="Agent Directory" />
        <ToastContainer theme="dark" position="top-right" />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Agent Roster Management</h1>
              <p>Re-assign agent specialties and monitor resolution performance</p>
            </div>
            <button onClick={fetchAgents} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="glass-card-no-hover">
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                Fetching agent records...
              </div>
            ) : agents.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No registered agents in the roster. You can promote users in the User Manager tab.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Active Cases</th>
                      <th>Resolved Cases</th>
                      <th>Avg Close Time</th>
                      <th>Client Rating</th>
                      <th>Specialization Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent._id}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img
                              src={agent.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40'}
                              alt="avatar"
                              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                            />
                            <span>{agent.userId?.name || 'Deleted Agent'}</span>
                          </div>
                        </td>
                        <td>{agent.userId?.email}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1'
                          }}>
                            <Briefcase size={12} /> {agent.specialization}
                          </span>
                        </td>
                        <td>{agent.activeComplaints}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{agent.resolvedComplaints}</td>
                        <td>{formatTime(agent.averageResolutionTime)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: 700 }}>
                            <Star size={14} fill="var(--warning)" /> {agent.performanceScore.toFixed(1)}
                          </div>
                        </td>
                        <td>
                          {selectedAgent === agent._id ? (
                            <form onSubmit={(e) => handleUpdateSpecializationSubmit(e, agent.userId?._id)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select
                                className="input-field"
                                style={{ background: '#0b0f19', padding: '0.35rem', fontSize: '0.8rem', width: '130px' }}
                                value={newSpecialization}
                                onChange={(e) => setNewSpecialization(e.target.value)}
                              >
                                <option value="">-- Specialization --</option>
                                <option value="Billing">Billing</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Account Issues">Account Issues</option>
                                <option value="Customer Service">Customer Service</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Other">Other</option>
                              </select>
                              <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                                Save
                              </button>
                              <button type="button" onClick={() => setSelectedAgent(null)} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAgent(agent._id);
                                setNewSpecialization(agent.specialization);
                              }}
                              className="btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Edit Specialty
                            </button>
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

export default AgentManagement;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Users, UserSquare2, FileWarning, Clock, Award, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalAgents: 0,
      totalComplaints: 0,
      statusCounts: { pending: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 },
      avgResolutionTime: 0,
    },
    categoryBreakdown: [],
    monthlyTrends: [],
    agentRankings: [],
  });

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load administrator metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

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
          <div style={{ color: '#6366f1', fontWeight: 'bold' }}>Loading Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="System Control Hub" />
        <main className="dashboard-content">
          
          <div className="page-header">
            <div>
              <h1>System Overview</h1>
              <p>Monitor metrics, workloads, and team performance</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/complaints" className="btn-secondary">
                Inspect Tickets
              </Link>
              <Link to="/admin/analytics" className="btn-primary">
                <Activity size={18} /> Full Reports
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="dashboard-grid">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Registered Clients</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{data.stats.totalUsers}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
                  <Users size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Agents</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{data.stats.totalAgents}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)', borderRadius: '8px' }}>
                  <UserSquare2 size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Tickets</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{data.stats.totalComplaints}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px' }}>
                  <FileWarning size={20} />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Close Time</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{formatTime(data.stats.avgResolutionTime)}</h2>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}>
                  <Clock size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Status Summary Panel */}
          <div className="glass-card-no-hover" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Status Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.pending}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Pending</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--info)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.assigned}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Assigned</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.inProgress}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>In Progress</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.resolved}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Resolved</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--neutral)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.closed}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Closed</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.5rem' }}>{data.stats.statusCounts.reopened}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Reopened</div>
              </div>
            </div>
          </div>

          {/* Aggregations Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Monthly Trends */}
            <div className="glass-card-no-hover" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Ticket Creation & Resolution Trends</h3>
              <div style={{ flex: 1, minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrends}>
                    <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="complaints" name="New Tickets" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="glass-card-no-hover" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tickets by Incident Category</h3>
              <div style={{ flex: 1, minHeight: '250px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="category"
                      >
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  {data.categoryBreakdown.map((item, index) => (
                    <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span style={{ fontWeight: 500 }}>{item.category}:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count}</span>
                    </div>
                  ))}
                  {data.categoryBreakdown.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No category data</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Rankings leaderboard */}
          <div className="glass-card-no-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Top Performing Agents</h3>
              <Link to="/admin/agents" style={{ fontSize: '0.85rem', color: '#6366f1', display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: 600 }}>
                Manage Agents <ChevronRight size={16} />
              </Link>
            </div>
            {data.agentRankings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active agent statistics available.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Specialization</th>
                      <th>Active Cases</th>
                      <th>Resolved Total</th>
                      <th>Avg Close Time</th>
                      <th>Rating Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agentRankings.map((agent) => (
                      <tr key={agent._id}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={agent.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40'}
                              alt="agent"
                              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                            />
                            <span>{agent.userId?.name || 'Deleted Agent'}</span>
                          </div>
                        </td>
                        <td>{agent.specialization}</td>
                        <td>{agent.activeComplaints}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{agent.resolvedComplaints}</td>
                        <td>{formatTime(agent.averageResolutionTime)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: 700 }}>
                            <Award size={16} />
                            <span>{agent.performanceScore.toFixed(1)} / 5.0</span>
                          </div>
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

export default AdminDashboard;

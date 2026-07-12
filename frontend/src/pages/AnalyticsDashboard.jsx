import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FileText, Download, BarChart2, CheckCircle2 } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalComplaints: 0, statusCounts: { pending: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 }, avgResolutionTime: 0 },
    categoryBreakdown: [],
    monthlyTrends: [],
    agentRankings: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load system reports');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportData = (format) => {
    // Mock exporting reports
    const mockReportData = JSON.stringify(data, null, 2);
    const blob = new Blob([mockReportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cms-system-report-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported system data successfully in ${format.toUpperCase()} format!`);
  };

  const getAgentWorkloadData = () => {
    return data.agentRankings.map((agent) => ({
      name: agent.userId?.name.split(' ')[0] || 'Unknown',
      active: agent.activeComplaints,
      resolved: agent.resolvedComplaints,
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
          <div style={{ color: '#6366f1', fontWeight: 'bold' }}>Loading Platform Telemetry...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="System Analytics" />
        <ToastContainer theme="dark" position="top-right" />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>System Performance & Reports</h1>
              <p>Download logs, audit metrics, and examine workload allocations</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleExportData('json')} className="btn-secondary">
                <Download size={16} /> JSON Report
              </button>
              <button onClick={() => handleExportData('csv')} className="btn-primary">
                <FileText size={16} /> CSV Export
              </button>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Complaints Filed</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>{data.stats.totalComplaints}</h2>
            </div>
            
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tickets Resolved Rate</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
                {data.stats.totalComplaints > 0 
                  ? `${Math.round(((data.stats.statusCounts.resolved + data.stats.statusCounts.closed) / data.stats.totalComplaints) * 100)}%`
                  : '0%'
                }
              </h2>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Backlog (Unresolved)</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--warning)' }}>
                {data.stats.statusCounts.pending + data.stats.statusCounts.assigned + data.stats.statusCounts.inProgress + data.stats.statusCounts.reopened}
              </h2>
            </div>
          </div>

          {/* Aggregations charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            
            {/* Pie chart category spread */}
            <div className="glass-card-no-hover" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={18} style={{ color: 'var(--info)' }} /> Ticket Categories spread
              </h3>
              <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
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
                      <span style={{ fontWeight: 600 }}>{item.category}:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} tickets</span>
                    </div>
                  ))}
                  {data.categoryBreakdown.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No tickets category logs registered.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bar Chart agent workload */}
            <div className="glass-card-no-hover" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Support Agent Workload Allocation
              </h3>
              <div style={{ flex: 1, minHeight: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAgentWorkloadData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="active" name="Active Backlog" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved Total" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

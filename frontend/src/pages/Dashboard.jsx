import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
        color: '#6366f1',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        <div>Loading Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'AGENT':
      return <AgentDashboard />;
    case 'USER':
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;

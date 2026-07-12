import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  LogOut,
  Users,
  Shield,
  FileText,
  PieChart,
  MessageSquare,
  Activity,
  Heart
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="cms-sidebar">
      <div className="sidebar-brand">
        <Shield size={28} className="brand-icon" />
        <span className="brand-name">CMS Portal</span>
      </div>

      <div className="sidebar-profile">
        <div className="avatar-wrapper">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
            alt="Profile Avatar"
            className="profile-avatar"
          />
          {user.isVerified && <span className="verified-dot" title="Verified Account">✓</span>}
        </div>
        <div className="profile-info">
          <h4 className="profile-name">{user.name}</h4>
          <span className="profile-role">{user.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Submitter User Navigation */}
        {user.role === 'USER' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/create-complaint" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <PlusCircle size={20} />
              <span>File Complaint</span>
            </NavLink>
            <NavLink to="/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} />
              <span>My History</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} />
              <span>Live Chat</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          </>
        )}

        {/* Agent Navigation */}
        {user.role === 'AGENT' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Assigned Cases</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} />
              <span>Live Chat</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={20} />
              <span>Profile & Performance</span>
            </NavLink>
          </>
        )}

        {/* Admin Navigation */}
        {user.role === 'ADMIN' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Complaints</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>User Manager</span>
            </NavLink>
            <NavLink to="/admin/agents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={20} />
              <span>Agent Manager</span>
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <PieChart size={20} />
              <span>System Analytics</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogoutClick} className="logout-btn">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

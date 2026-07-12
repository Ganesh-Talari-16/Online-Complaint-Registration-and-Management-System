import React, { useContext, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, ShieldAlert, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ title }) => {
  const { notifications, clearNotifications } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_COMPLAINT':
        return <ShieldAlert size={18} className="notif-icon complaint" />;
      case 'STATUS_UPDATE':
        return <CheckCircle2 size={18} className="notif-icon status" />;
      case 'ASSIGNMENT':
        return <UserCheck size={18} className="notif-icon assign" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={18} className="notif-icon message" />;
      default:
        return <Bell size={18} className="notif-icon default" />;
    }
  };

  return (
    <header className="cms-navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{title || 'Dashboard'}</h2>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div className="notification-bell-container">
          <button className="bell-btn" onClick={toggleDropdown}>
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="bell-badge">{notifications.length}</span>
            )}
          </button>

          {dropdownOpen && (
            <div className="notification-dropdown glass-card-no-hover">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button className="clear-btn" onClick={clearNotifications}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <div className="empty-notif">No new notifications</div>
                ) : (
                  notifications.map((notif, index) => (
                    <div key={index} className="notif-item">
                      {getNotificationIcon(notif.type)}
                      <div className="notif-content">
                        <span className="notif-title">{notif.title}</span>
                        <p className="notif-msg">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Quick Info */}
        <div className="navbar-user">
          <span className="welcome-text">Hi, {user?.name.split(' ')[0]}</span>
          <div className="online-indicator" title="Online Status"></div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

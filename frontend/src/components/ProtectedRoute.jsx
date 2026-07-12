import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

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
        <div className="loader">Loading Session...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if their role isn't permitted
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

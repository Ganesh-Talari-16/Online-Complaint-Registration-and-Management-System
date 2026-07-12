import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Register user ID with Socket server
    newSocket.emit('register_user', user._id);

    // Standard notification event handlers
    newSocket.on('new_inapp_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      // Show toaster alert
      toast.info(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    // Admin-specific alerts (e.g. new complaint filed)
    if (user.role === 'ADMIN') {
      newSocket.on('admin_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast.success(`[Admin Alert] ${notification.message}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      });
    }

    // Get list of active online users
    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Helper methods to wrap socket emits
  const joinComplaintRoom = (complaintId) => {
    if (socket) socket.emit('join_complaint', { complaintId });
  };

  const leaveComplaintRoom = (complaintId) => {
    if (socket) socket.emit('leave_complaint', { complaintId });
  };

  const sendChatMessage = (complaintId, message) => {
    if (socket && user) {
      socket.emit('send_message', {
        complaintId,
        senderId: user._id,
        senderRole: user.role === 'AGENT' ? 'AGENT' : 'USER',
        message,
      });
    }
  };

  const startTyping = (complaintId) => {
    if (socket && user) {
      socket.emit('typing', { complaintId, senderName: user.name });
    }
  };

  const stopTyping = (complaintId) => {
    if (socket && user) {
      socket.emit('stop_typing', { complaintId, senderName: user.name });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        onlineUsers,
        joinComplaintRoom,
        leaveComplaintRoom,
        sendChatMessage,
        startTyping,
        stopTyping,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

const socketIO = require('socket.io');
const ChatMessage = require('../models/ChatMessage');
const Complaint = require('../models/Complaint');

// Map to store online users: userId -> socketId
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user socket
    socket.on('register_user', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} registered on socket ${socket.id}`);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // Join room for a specific complaint chat
    socket.on('join_complaint', ({ complaintId }) => {
      if (complaintId) {
        socket.join(`complaint_${complaintId}`);
        console.log(`Socket ${socket.id} joined complaint room: complaint_${complaintId}`);
      }
    });

    // Leave room
    socket.on('leave_complaint', ({ complaintId }) => {
      if (complaintId) {
        socket.leave(`complaint_${complaintId}`);
        console.log(`Socket ${socket.id} left complaint room: complaint_${complaintId}`);
      }
    });

    // Typing indicators
    socket.on('typing', ({ complaintId, senderName }) => {
      socket.to(`complaint_${complaintId}`).emit('user_typing', { senderName });
    });

    socket.on('stop_typing', ({ complaintId, senderName }) => {
      socket.to(`complaint_${complaintId}`).emit('user_stop_typing', { senderName });
    });

    // New Message event
    socket.on('send_message', async ({ complaintId, senderId, senderRole, message }) => {
      try {
        // Double check permissions or format
        const chatMsg = await ChatMessage.create({
          complaintId,
          senderId,
          senderRole,
          message,
        });

        // Populate sender info for frontend rendering
        const populatedMsg = await chatMsg.populate('senderId', 'name avatar role');

        // Broadcast to complaint room
        io.to(`complaint_${complaintId}`).emit('receive_message', populatedMsg);

        // Also trigger an in-app notification to the counterpart if they aren't in the room
        const complaint = await Complaint.findById(complaintId);
        if (complaint) {
          const recipientId = senderRole === 'USER' ? complaint.assignedAgentId : complaint.userId;
          if (recipientId) {
            const recipientSocketId = onlineUsers.get(recipientId.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('new_inapp_notification', {
                type: 'NEW_MESSAGE',
                title: 'New Message',
                message: `New message on complaint "${complaint.title}": ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
                complaintId,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error saving socket message:', err.message);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });
  });

  // Attach io to global process or object so we can use it in controllers
  global.io = io;
  global.onlineUsers = onlineUsers;

  return io;
};

// Helper function to send real-time notification to a specific user
const sendNotification = (userId, notificationData) => {
  if (global.io && userId) {
    const socketId = onlineUsers.get(userId.toString());
    if (socketId) {
      global.io.to(socketId).emit('new_inapp_notification', notificationData);
      return true;
    }
  }
  return false;
};

// Helper to broadcast notification to all admins
const notifyAdmins = (notificationData) => {
  if (global.io) {
    global.io.emit('admin_notification', notificationData);
  }
};

module.exports = {
  initSocket,
  sendNotification,
  notifyAdmins,
};

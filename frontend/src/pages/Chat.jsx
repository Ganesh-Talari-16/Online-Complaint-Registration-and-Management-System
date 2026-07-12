import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ExternalLink, 
  AlertCircle, 
  MessageCircle, 
  Calendar 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './Chat.css';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const {
    socket,
    onlineUsers,
    joinComplaintRoom,
    leaveComplaintRoom,
    sendChatMessage,
    startTyping,
    stopTyping,
  } = useContext(SocketContext);

  const [searchParams] = useSearchParams();
  const initialComplaintId = searchParams.get('complaintId');

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  // 1. Fetch complaints list
  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        // Filter out complaints that do not have an assigned agent if role is USER
        const chatCapableComplaints = res.data.complaints.filter((complaint) => {
          if (user.role === 'USER') {
            return complaint.assignedAgentId !== null;
          }
          return true; // Agents already have assignedAgentId = themselves
        });
        setComplaints(chatCapableComplaints);

        // Auto-select a complaint
        if (chatCapableComplaints.length > 0) {
          let selected = chatCapableComplaints[0];
          if (initialComplaintId) {
            const found = chatCapableComplaints.find(c => c._id === initialComplaintId);
            if (found) selected = found;
          }
          setSelectedComplaint(selected);
        }
      }
    } catch (err) {
      toast.error('Failed to load active chats.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [initialComplaintId]);

  // 2. Handle room transitions and chat history loading when selected complaint changes
  useEffect(() => {
    if (!selectedComplaint) return;

    const loadChatAndJoin = async () => {
      setChatLoading(true);
      // Join Room
      joinComplaintRoom(selectedComplaint._id);
      
      // Load history
      try {
        const res = await api.get(`/chat/${selectedComplaint._id}`);
        if (res.data.success) {
          setChatMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setChatLoading(false);
      }

      // Mark messages as read
      try {
        await api.put(`/chat/${selectedComplaint._id}/read`);
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    };

    loadChatAndJoin();

    return () => {
      leaveComplaintRoom(selectedComplaint._id);
      setChatMessages([]);
      setTypingUser('');
    };
  }, [selectedComplaint]);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingUser]);

  // 4. Socket listener for real-time messages & typing notifications
  useEffect(() => {
    if (!socket || !selectedComplaint) return;

    socket.on('receive_message', (msg) => {
      if (msg.complaintId === selectedComplaint._id) {
        setChatMessages((prev) => [...prev, msg]);
        // Auto mark read if actively in the room
        api.put(`/chat/${selectedComplaint._id}/read`).catch(() => {});
      }
    });

    socket.on('user_typing', ({ senderName }) => {
      setTypingUser(senderName);
    });

    socket.on('user_stop_typing', () => {
      setTypingUser('');
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, selectedComplaint]);

  // 5. Actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedComplaint) return;

    sendChatMessage(selectedComplaint._id, messageText);
    setMessageText('');
    stopTyping(selectedComplaint._id);
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (selectedComplaint) {
      startTyping(selectedComplaint._id);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedComplaint._id);
      }, 1500);
    }
  };

  // Get counterpart info helper
  const getCounterpartInfo = (complaint) => {
    if (!complaint) return { name: 'Support', avatar: '', isOnline: false };
    if (user.role === 'USER') {
      const agent = complaint.assignedAgentId;
      const isOnline = agent ? onlineUsers.includes(agent._id) : false;
      return {
        name: agent?.name || 'Assigned Agent',
        avatar: agent?.avatar,
        role: 'Support Agent',
        isOnline
      };
    } else {
      const client = complaint.userId;
      const isOnline = client ? onlineUsers.includes(client._id) : false;
      return {
        name: client?.name || 'Client Submitter',
        avatar: client?.avatar,
        role: 'Client',
        isOnline
      };
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Assigned': return 'badge-assigned';
      case 'In Progress': return 'badge-inprogress';
      case 'Resolved': return 'badge-resolved';
      case 'Closed': return 'badge-closed';
      case 'Reopened': return 'badge-reopened';
      default: return '';
    }
  };

  // Filter complaints by search query
  const filteredComplaints = complaints.filter(complaint => 
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getCounterpartInfo(complaint).name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Navbar title="Live Chat Support" />
        <ToastContainer theme="dark" position="top-right" />

        <div className="chat-container">
          <div className="chat-split-layout">
            
            {/* Left Panel: Conversations List */}
            <div className="chat-threads-panel">
              <div className="chat-threads-header">
                <h3>
                  <MessageSquare size={18} />
                  <span>Support Inquiries</span>
                </h3>
                <div className="search-thread-wrapper">
                  <Search size={14} className="search-thread-icon" />
                  <input
                    type="text"
                    className="search-thread-input"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="chat-threads-list">
                {loading ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                    Loading conversations...
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                    No active chats found.
                  </div>
                ) : (
                  filteredComplaints.map((complaint) => {
                    const active = selectedComplaint?._id === complaint._id;
                    const cp = getCounterpartInfo(complaint);
                    return (
                      <button
                        key={complaint._id}
                        className={`thread-card ${active ? 'active' : ''}`}
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <div className="thread-avatar-wrapper">
                          <img
                            src={cp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                            alt={cp.name}
                            className="thread-avatar"
                          />
                          <span className={`online-dot ${cp.isOnline ? '' : 'offline'}`} />
                        </div>
                        <div className="thread-info">
                          <div className="thread-header-row">
                            <span className="thread-name">{cp.name}</span>
                            <span className="thread-time">
                              {new Date(complaint.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="thread-complaint-title">{complaint.title}</span>
                          <div className="thread-meta-row">
                            <span className="thread-category-badge">{complaint.category}</span>
                            <span className={`badge ${getStatusBadgeClass(complaint.status)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                              {complaint.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Selected Chat Conversation */}
            <div className="chat-window-panel">
              {selectedComplaint ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-window-header">
                    <div className="chat-header-profile">
                      <div className="thread-avatar-wrapper">
                        <img
                          src={getCounterpartInfo(selectedComplaint).avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                          alt={getCounterpartInfo(selectedComplaint).name}
                          className="thread-avatar"
                        />
                        <span className={`online-dot ${getCounterpartInfo(selectedComplaint).isOnline ? '' : 'offline'}`} />
                      </div>
                      <div className="chat-header-info">
                        <span className="chat-header-name">{getCounterpartInfo(selectedComplaint).name}</span>
                        <span className={`chat-header-status ${getCounterpartInfo(selectedComplaint).isOnline ? 'online' : ''}`}>
                          {getCounterpartInfo(selectedComplaint).isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <div className="chat-header-complaint-info">
                      <Link to={`/complaints/${selectedComplaint._id}`} className="chat-header-complaint-link">
                        <span>Ticket: {selectedComplaint.title}</span>
                        <ExternalLink size={14} />
                      </Link>
                      <span className={`badge ${getStatusBadgeClass(selectedComplaint.status)} chat-header-complaint-status`} style={{ marginTop: '0.2rem' }}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                  </div>

                  {/* Messages Window */}
                  <div className="chat-window-messages">
                    {chatLoading ? (
                      <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Loading message logs...
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No messages in this chat. Type a message below to start communicating.
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isOwn = msg.senderId?._id 
                          ? msg.senderId._id === user._id 
                          : msg.senderId === user._id;

                        return (
                          <div key={msg._id} className={`chat-message-group ${isOwn ? 'own' : 'other'}`}>
                            <div className="chat-bubble">
                              {msg.message}
                            </div>
                            <div className="chat-msg-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isOwn && msg.isRead && (
                                <span className="chat-read-receipt">✓ Read</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing Indicator */}
                    {typingUser && (
                      <div className="typing-indicator-wrapper chat-typing-row">
                        <span className="typing-indicator-dot"></span>
                        <span className="typing-indicator-dot"></span>
                        <span className="typing-indicator-dot"></span>
                        <span className="typing-text">{typingUser} is typing...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="chat-window-input-form">
                    <input
                      type="text"
                      className="chat-input-textarea"
                      placeholder="Type message here..."
                      value={messageText}
                      onChange={handleInputChange}
                      disabled={['Closed', 'Resolved'].includes(selectedComplaint.status)}
                    />
                    <button 
                      type="submit" 
                      className="chat-send-btn" 
                      disabled={!messageText.trim() || ['Closed', 'Resolved'].includes(selectedComplaint.status)}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="chat-empty-state">
                  <div className="chat-empty-state-icon">
                    <MessageCircle size={28} />
                  </div>
                  <h4>No Active Conversation Selected</h4>
                  <p>
                    {user.role === 'USER' 
                      ? 'Once an administrator assigns an agent to your filed complaints, you will be able to start chatting here.'
                      : 'You do not have any assigned cases with chat history. Select a complaint from your dashboard to begin.'
                    }
                  </p>
                  {user.role === 'USER' && (
                    <Link to="/create-complaint" className="btn-primary chat-empty-state-btn" style={{ textDecoration: 'none' }}>
                      File a New Complaint
                    </Link>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

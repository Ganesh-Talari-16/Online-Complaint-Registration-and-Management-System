import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { ArrowLeft, User, Calendar, Paperclip, Send, AlertCircle, Award, Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './ComplaintDetails.css';

const ComplaintDetails = () => {
  const { id: complaintId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    joinComplaintRoom,
    leaveComplaintRoom,
    sendChatMessage,
    startTyping,
    stopTyping,
    socket,
  } = useContext(SocketContext);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]); // for admin assignment
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Feedback form states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  // 1. Fetch Complaint details and Chat messages
  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${complaintId}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setResolutionInput(res.data.complaint.resolutionSummary || '');
      }
    } catch (err) {
      toast.error('Failed to load complaint details');
      navigate('/dashboard');
    }
  };

  const fetchChatLogs = async () => {
    try {
      const res = await api.get(`/chat/${complaintId}`);
      if (res.data.success) {
        setChatMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await api.get(`/feedback/complaint/${complaintId}`);
      if (res.data.success && res.data.feedback) {
        setFeedback(res.data.feedback);
      }
    } catch (err) {
      console.error('Failed to load feedback details');
    }
  };

  const fetchAgentsList = async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const res = await api.get('/agents');
      if (res.data.success) {
        setAgents(res.data.agents);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchComplaintDetails();
      await fetchChatLogs();
      await fetchFeedback();
      await fetchAgentsList();
      setLoading(false);
    };
    initData();

    // Join Socket Room
    joinComplaintRoom(complaintId);

    // Mark existing messages as read
    api.put(`/chat/${complaintId}/read`).catch(() => {});

    return () => {
      leaveComplaintRoom(complaintId);
    };
  }, [complaintId]);

  // 2. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 3. Socket event bindings for message retrieval & typing indicators
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      if (msg.complaintId === complaintId) {
        setChatMessages((prev) => [...prev, msg]);
        // Auto mark read if actively in the room
        api.put(`/chat/${complaintId}/read`).catch(() => {});
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
  }, [socket, complaintId]);

  // Chat actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendChatMessage(complaintId, messageText);
    setMessageText('');
    stopTyping(complaintId);
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    startTyping(complaintId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(complaintId);
    }, 1500);
  };

  // Status transitions
  const handleStatusChange = async (newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Resolved') {
        if (!resolutionInput.trim()) {
          return toast.warning('Please describe the resolution details first.');
        }
        payload.resolutionSummary = resolutionInput;
      }

      const res = await api.put(`/complaints/${complaintId}/status`, payload);
      if (res.data.success) {
        toast.success(`Complaint status changed to ${newStatus}`);
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Admin assignment
  const handleAssignAgent = async (agentId) => {
    if (!agentId) return;
    try {
      const res = await api.put(`/complaints/${complaintId}/assign`, { agentId });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign agent.');
    }
  };

  // Feedback Submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/feedback', { complaintId, rating, comments });
      if (res.data.success) {
        toast.success('Thank you for your feedback!');
        setShowFeedbackForm(false);
        fetchFeedback();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
          <div style={{ color: '#6366f1', fontWeight: 'bold' }}>Loading Ticket Info...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Navbar title="Complaint Inspector" />
        <ToastContainer theme="dark" position="top-right" />
        
        <div className="detail-container">
          {/* Back link */}
          <div className="detail-header">
            <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                {complaint.status}
              </span>
              <span className={`priority-tag priority-${complaint.priority.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
            </div>
          </div>

          <div className="detail-split-layout">
            {/* Left Panel: Complaint Details */}
            <div className="detail-info-panel glass-card-no-hover">
              <div className="detail-meta">
                <span className="detail-category">{complaint.category}</span>
                <span className="detail-date"><Calendar size={12} /> {new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              <h2 className="detail-title">{complaint.title}</h2>
              
              <div className="detail-description">
                <p>{complaint.description}</p>
              </div>

              {/* Attachments Section */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="detail-attachments">
                  <h4>Attachments</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {complaint.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={`${BACKEND_URL}${file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="attachment-link-card"
                      >
                        <Paperclip size={14} />
                        <span>File {idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Summary */}
              {complaint.resolutionSummary && (
                <div className="resolution-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                    <CheckCircle2 size={18} />
                    <strong>Resolution Summary</strong>
                  </div>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {complaint.resolutionSummary}
                  </p>
                  {complaint.resolvedAt && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                      Resolved at: {new Date(complaint.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Feedback Display */}
              {feedback && (
                <div className="feedback-card" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.03)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={16} fill="var(--warning)" /> Client Feedback
                    </strong>
                    <div style={{ display: 'flex', gap: '0.15rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < feedback.rating ? 'var(--warning)' : 'none'}
                          stroke="var(--warning)"
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    "{feedback.comments || 'No comments left'}"
                  </p>
                </div>
              )}

              {/* Operator Actions based on Roles */}
              <div className="operator-actions">
                {/* 1. AGENT ACTIONS */}
                {user?.role === 'AGENT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4>Workflow Control</h4>
                    {complaint.status === 'Assigned' && (
                      <button onClick={() => handleStatusChange('In Progress')} className="btn-primary">
                        Set In Progress
                      </button>
                    )}
                    {['Assigned', 'In Progress', 'Reopened'].includes(complaint.status) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <textarea
                          placeholder="Describe the solution before closing..."
                          className="input-field"
                          rows={3}
                          value={resolutionInput}
                          onChange={(e) => setResolutionInput(e.target.value)}
                        />
                        <button onClick={() => handleStatusChange('Resolved')} className="btn-primary" style={{ background: 'var(--success)' }}>
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. USER ACTIONS */}
                {user?.role === 'USER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['Pending', 'Assigned', 'In Progress', 'Reopened', 'Resolved'].includes(complaint.status) && (
                      <button onClick={() => handleStatusChange('Closed')} className="btn-secondary" style={{ color: 'var(--neutral)' }}>
                        Close Complaint Ticket
                      </button>
                    )}
                    {complaint.status === 'Resolved' && !feedback && !showFeedbackForm && (
                      <button onClick={() => setShowFeedbackForm(true)} className="btn-primary" style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--warning)' }}>
                        Provide Feedback
                      </button>
                    )}
                    {['Resolved', 'Closed'].includes(complaint.status) && (
                      <button onClick={() => handleStatusChange('Reopened')} className="btn-primary" style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
                        Reopen Complaint Ticket
                      </button>
                    )}

                    {/* Feedback Form */}
                    {showFeedbackForm && (
                      <form onSubmit={handleFeedbackSubmit} className="feedback-form" style={{ marginTop: '1rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Submit Resolution Rating</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              <Star
                                size={24}
                                fill={star <= rating ? 'var(--warning)' : 'none'}
                                stroke="var(--warning)"
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Tell us what you think of the service..."
                          className="input-field"
                          rows={3}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            Submit
                          </button>
                          <button type="button" onClick={() => setShowFeedbackForm(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 3. ADMIN ACTIONS */}
                {user?.role === 'ADMIN' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4>Administrator Control</h4>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Assign Agent</label>
                      <select
                        className="input-field"
                        style={{ background: '#0f172a' }}
                        value={complaint.assignedAgentId?._id || ''}
                        onChange={(e) => handleAssignAgent(e.target.value)}
                      >
                        <option value="">-- Select Agent to Assign --</option>
                        {agents.map((agent) => (
                          <option key={agent.userId?._id} value={agent.userId?._id}>
                            {agent.userId?.name} ({agent.specialization}) - {agent.activeComplaints} Active
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Change Ticket Status</label>
                      <select
                        className="input-field"
                        style={{ background: '#0f172a' }}
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Reopened">Reopened</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Support Live Chat */}
            <div className="detail-chat-panel glass-card-no-hover">
              <div className="chat-panel-header">
                <MessageSquare size={18} />
                <span>Live Chat Support</span>
              </div>

              {/* Admin warning */}
              {user?.role === 'ADMIN' && (
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <AlertCircle size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>You are viewing this chat log in Read-Only mode.</span>
                </div>
              )}

              {/* Chat Message Backlog */}
              <div className="chat-messages-container">
                {chatMessages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No messages in this chat. Introduce the issue to start communication.
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isOwnMessage = msg.senderId?._id 
                      ? msg.senderId._id === user._id 
                      : msg.senderId === user._id;

                    return (
                      <div key={msg._id} className={`chat-message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                        <div className="msg-sender">
                          {isOwnMessage ? 'You' : msg.senderId?.name || 'User'} ({msg.senderRole})
                        </div>
                        <div className="msg-text">{msg.message}</div>
                        <div className="msg-timestamp">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isOwnMessage && msg.isRead && (
                            <span style={{ color: 'var(--success)', marginLeft: '0.25rem' }}>✓ Read</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                {typingUser && (
                  <div className="typing-indicator-wrapper">
                    <span className="typing-indicator-dot"></span>
                    <span className="typing-indicator-dot"></span>
                    <span className="typing-indicator-dot"></span>
                    <span className="typing-text">{typingUser} is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Send message form */}
              {user?.role !== 'ADMIN' && (
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Type message here..."
                    value={messageText}
                    onChange={handleInputChange}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;

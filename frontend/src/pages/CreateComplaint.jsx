import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, ArrowLeft, Send, Upload, File, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'Medium',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      return toast.warning('You can attach a maximum of 5 files.');
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('priority', formData.priority);
    
    files.forEach((file) => {
      payload.append('attachments', file);
    });

    try {
      const res = await api.post('/complaints', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Complaint submitted successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit complaint.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar title="File a Complaint" />
        <ToastContainer theme="dark" position="top-right" />
        
        <main className="dashboard-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Support Ticket</h1>
          </div>

          <div className="glass-card-no-hover" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Complaint Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the issue briefly..."
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Incident Category</label>
                  <select
                    className="input-field"
                    style={{ background: '#0f172a' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Billing">Billing</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Account Issues">Account Issues</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Priority Level</label>
                  <select
                    className="input-field"
                    style={{ background: '#0f172a' }}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Detailed Description</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Provide all background information, symptoms, router restarts, error messages, etc..."
                  className="input-field"
                  style={{ resize: 'none' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Attachments Section */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Attachments (Max 5 files)</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click to upload screenshot or log document</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG, PDF, DOC, DOCX, TXT (Max 5MB each)</p>
                  <input
                    type="file"
                    multiple
                    className="file-upload-input"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Uploaded file badges */}
                {files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {files.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <File size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{file.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.15rem' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
                <Send size={18} /> {submitting ? 'Submitting Complaint Ticket...' : 'File Support Ticket'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateComplaint;

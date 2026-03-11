import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { Briefcase, Users, Trash2, MapPin, FileText, Video } from 'lucide-react';
import { isInterviewExpired, canJoinInterview } from '../../utils/helpers';
import EliteConfirmModal from '../common/EliteConfirmModal';

const HRDashboard = ({ user, jobs, setJobs, applications, setApplications, appPage, setAppPage, appTotalPages }) => {
    const navigate = useNavigate();
    const [hrActiveTab, setHrActiveTab] = useState('jobs');
    const [selectedApp, setSelectedApp] = useState(null);
    const [schedulingMode, setSchedulingMode] = useState(false);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewNotes, setInterviewNotes] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    const closeHrModal = () => {
        setSelectedApp(null);
        setSchedulingMode(false);
        setInterviewDate('');
        setInterviewNotes('');
    };

    const handleUpdateStatus = async (appId, newStatus, date = null, notes = null) => {
        setStatusUpdating(true);
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            const payload = { status: newStatus };
            if (date) payload.interviewDate = date;
            if (notes) payload.interviewNotes = notes;

            const res = await axios.put(`/api/applications/${appId}/status`, payload);

            setApplications(applications.map(app => {
                if (app._id === appId) {
                    return {
                        ...app,
                        ...res.data
                    };
                }
                return app;
            }));

            closeHrModal();
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update application status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleDeleteJob = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDeleteJob = async () => {
        const id = confirmModal.id;
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            await axios.delete(`/api/jobs/${id}`);
            setJobs(jobs.filter(job => job._id !== id));
            setApplications(applications.filter(app => app.job?._id !== id && app.job !== id));
            setConfirmModal({ isOpen: false, id: null });
        } catch (err) {
            console.error('Failed to delete job', err);
            alert('Failed to delete job posting.');
        }
    };

    return (
        <div className="hr-dash">
            {/* HR Review Application Modal */}
            {selectedApp && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '28rem', margin: 'auto', padding: '0', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background glow for modal */}
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: '0.15', borderRadius: '50%', pointerEvents: 'none' }}></div>

                        <div style={{ maxHeight: '70vh', overflowY: 'auto', position: 'relative', zIndex: 1, padding: '2.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '-0.025em', color: '#ffffff' }}>
                                        {schedulingMode ? 'Schedule Interview' : 'Review Application'}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Candidate ID: {selectedApp.candidate?._id?.substring(0, 8) || 'Unknown'}</p>
                                </div>
                                <span className={`badge ${selectedApp.status === 'Applied' ? 'badge-warning' : selectedApp.status === 'Offered' ? 'badge-success' : selectedApp.status === 'Interviewing' ? 'badge-warning' : selectedApp.status === 'Rejected' ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                                    {selectedApp.status === 'Interviewing' ? 'SCHEDULED' : selectedApp.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Info Box */}
                                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Candidate</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{selectedApp.candidate?.name || 'Applicant'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Applied For</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: 0 }}>{selectedApp.jobTitle || selectedApp.job?.title || 'Unknown Job'}</p>
                                    </div>
                                </div>

                                {/* AI Resume Analysis Section */}
                                {selectedApp.aiScore && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: `1px solid ${selectedApp.aiScore >= 80 ? 'rgba(16, 185, 129, 0.3)' : selectedApp.aiScore >= 70 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        {/* Score Circle */}
                                        <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.8)', border: `4px solid ${selectedApp.aiScore >= 80 ? '#34d399' : selectedApp.aiScore >= 70 ? '#fbbf24' : '#f87171'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${selectedApp.aiScore >= 80 ? 'rgba(16, 185, 129, 0.2)' : selectedApp.aiScore >= 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                            <span style={{ fontSize: '1.875rem', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>{selectedApp.aiScore}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Match</span>
                                        </div>
                                        {/* Feedback Text */}
                                        <div>
                                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: selectedApp.aiScore >= 80 ? '#34d399' : selectedApp.aiScore >= 70 ? '#fbbf24' : '#f87171', fontWeight: 'bold', marginBottom: '0.35rem', margin: 0 }}>AI Resume Analysis</p>
                                            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>{selectedApp.aiFeedback}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Documents Row */}
                                {selectedApp.resumeUrl && (
                                    <a href={selectedApp.resumeUrl.startsWith('http') ? selectedApp.resumeUrl : `http://localhost:5000${selectedApp.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease', textDecoration: 'none', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.625rem', borderRadius: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
                                        </div>
                                        <div>
                                            <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>View Applicant Resume</p>
                                            <p style={{ color: 'rgba(165, 180, 252, 0.7)', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>Uploaded PDF/Word</p>
                                        </div>
                                    </a>
                                )}

                                {/* Action Area */}
                                {schedulingMode ? (
                                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
                                        <p style={{ fontWeight: 'bold', color: '#fbbf24', marginTop: 0, marginBottom: '1rem' }}>Set Interview Details</p>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date & Time</label>
                                        <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white', marginBottom: '1rem', marginTop: '0.25rem' }} />

                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Instructions / Links</label>
                                        <textarea rows="3" placeholder="Enter meeting link or instructions" value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white', resize: 'none', marginTop: '0.25rem' }}></textarea>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                            <button onClick={() => setSchedulingMode(false)} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                                            <button onClick={() => handleUpdateStatus(selectedApp._id, 'Interviewing', interviewDate, interviewNotes)} disabled={statusUpdating || !interviewDate} className="btn" style={{ flex: 1, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>Confirm Date</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '1rem', margin: 0 }}>Phase Actions</p>
                                        {selectedApp.status === 'Interviewing' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                                {isInterviewExpired(selectedApp.interviewDate) && (
                                                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                                                        <span style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 'bold' }}>Interview time has expired.</span>
                                                    </div>
                                                )}
                                                <button onClick={() => handleUpdateStatus(selectedApp._id, 'Interview Conducted')} disabled={statusUpdating} className="btn" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#c4b5fd', border: '1px solid rgba(167, 139, 250, 0.2)', width: '100%' }}>Mark Conducted</button>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button onClick={() => handleUpdateStatus(selectedApp._id, 'Offered')} disabled={statusUpdating} className="btn" style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Hire Candidate</button>
                                                    <button onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')} disabled={statusUpdating} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Reject Candidate</button>
                                                </div>
                                            </div>
                                        ) : ['Interview Conducted'].includes(selectedApp.status) ? (
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                                <button onClick={() => handleUpdateStatus(selectedApp._id, 'Offered')} disabled={statusUpdating} className="btn" style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Hire Candidate</button>
                                                <button onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')} disabled={statusUpdating} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Reject Candidate</button>
                                            </div>
                                        ) : ['Offered', 'Rejected'].includes(selectedApp.status) ? (
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginTop: '1rem' }}>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Candidate review phase complete.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                                <button onClick={() => handleUpdateStatus(selectedApp._id, 'Reviewed')} disabled={statusUpdating} className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.2)' }}>Mark as Reviewed</button>
                                                <button onClick={() => setSchedulingMode(true)} disabled={statusUpdating} className="btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Schedule Interview</button>
                                                <button onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')} disabled={statusUpdating} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Pass / Reject</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button onClick={closeHrModal} className="btn" style={{ width: '100%', marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}>Close Window</button>
                        </div>
                    </div>
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                    onClick={() => setHrActiveTab('jobs')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: hrActiveTab === 'jobs' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: hrActiveTab === 'jobs' ? '#818cf8' : '#94a3b8',
                        border: 'none',
                        borderBottom: hrActiveTab === 'jobs' ? '2px solid #818cf8' : '2px solid transparent',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem'
                    }}
                >
                    Job Postings
                </button>
                <button
                    onClick={() => setHrActiveTab('applications')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: hrActiveTab === 'applications' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: hrActiveTab === 'applications' ? '#818cf8' : '#94a3b8',
                        border: 'none',
                        borderBottom: hrActiveTab === 'applications' ? '2px solid #818cf8' : '2px solid transparent',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem'
                    }}
                >
                    Recent Applications
                </button>
            </div>

            {hrActiveTab === 'jobs' && (
                <section className="mb-12 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-accent" /> Job Postings</h2>
                        <button onClick={() => navigate('/post-job')} className="btn btn-primary">Post New Job</button>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>You have {jobs.filter(j => j.postedBy?._id === user._id).length} active job postings.</p>

                        <div className="flex flex-col gap-4">
                            {jobs.filter(j => j.postedBy?._id === user._id).map(job => (
                                <div
                                    key={job._id}
                                    className="flex justify-between items-center"
                                    style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', transition: 'all 0.2s', cursor: 'pointer' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                >
                                    <div>
                                        <h4 className="font-bold text-xl" style={{ marginBottom: '0.25rem' }}>{job.title}</h4>
                                        <p className="text-sm font-semibold text-accent mb-2">{job.company}</p>
                                        <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
                                            <MapPin size={14} /> {job.location}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            title="Delete Job"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {hrActiveTab === 'applications' && (
                <section className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-accent" /> Recent Applications</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {applications.map(app => (
                            <div key={app._id} style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 className="font-bold text-xl" style={{ marginBottom: '0.25rem' }}>{app.candidate?.name || 'Applicant'}</h4>
                                        <span className={`badge ${app.status === 'Applied' ? 'badge-warning' : app.status === 'Offered' ? 'badge-success' : app.status === 'Interviewing' ? 'badge-warning' : app.status === 'Interview Conducted' ? 'badge-neutral' : app.status === 'Rejected' ? 'badge-error' : 'badge-success'}`}>{app.status === 'Interviewing' ? 'SCHEDULED' : app.status === 'Interview Conducted' ? 'CONDUCTED' : app.status.toUpperCase()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>Applied for: <span style={{ color: '#a78bfa' }}>{app.jobTitle || app.job?.title || 'Deleted Job'}</span></p>
                                    
                                    {/* AI Match Badge */}
                                    {app.aiScore ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: app.aiScore >= 80 ? '#34d399' : app.aiScore >= 70 ? '#fbbf24' : '#f87171', boxShadow: `0 0 8px ${app.aiScore >= 80 ? '#34d399' : app.aiScore >= 70 ? '#fbbf24' : '#f87171'}` }}></div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#e2e8f0', letterSpacing: '0.05em' }}>AI MATCH: <span style={{ color: app.aiScore >= 80 ? '#34d399' : app.aiScore >= 70 ? '#fbbf24' : '#fca5a5' }}>{app.aiScore}%</span></span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.05em' }}>AI MATCH: EVALUATING...</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {app.status === 'Interviewing' && app.meetingLink && (
                                            isInterviewExpired(app.interviewDate) ? (
                                                <div className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.75rem', fontWeight: 'bold' }}>EXPIRED</div>
                                            ) : (
                                                <button
                                                    onClick={() => canJoinInterview(app.interviewDate) && navigate(`/interview/${app.meetingLink}`)}
                                                    disabled={!canJoinInterview(app.interviewDate)}
                                                    className="btn"
                                                    style={{
                                                        padding: '0.5rem 1rem', fontSize: '0.875rem',
                                                        background: canJoinInterview(app.interviewDate) ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        color: canJoinInterview(app.interviewDate) ? 'white' : '#64748b',
                                                        borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold',
                                                        cursor: canJoinInterview(app.interviewDate) ? 'pointer' : 'not-allowed'
                                                    }}>
                                                    <Video size={14} />
                                                    {canJoinInterview(app.interviewDate)
                                                        ? 'Join Room'
                                                        : `Starts ${new Date(app.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                    }
                                                </button>
                                            )
                                        )}
                                        <button onClick={() => setSelectedApp(app)} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '0.375rem', cursor: 'pointer' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 1)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}>{app.status === 'Interviewing' ? 'Edit / Update' : 'Review / Schedule'}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem' }}>
                                <p style={{ color: '#94a3b8' }}>No applications to review at this time.</p>
                            </div>
                        )}
                    </div>

                    {appTotalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setAppPage(prev => Math.max(prev - 1, 1))}
                                disabled={appPage === 1}
                                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-muted">Page {appPage} of {appTotalPages}</span>
                            <button
                                onClick={() => setAppPage(prev => Math.min(prev + 1, appTotalPages))}
                                disabled={appPage === appTotalPages}
                                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Page
                            </button>
                        </div>
                    )}
                </section>
            )}
            {/* Confirmation Modal */}
            <EliteConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmDeleteJob}
                title="Delete Job Posting?"
                message="Are you sure you want to remove this job? This will also remove associated application links."
                confirmText="Delete Now"
                type="danger"
            />
        </div>
    );
};

export default HRDashboard;

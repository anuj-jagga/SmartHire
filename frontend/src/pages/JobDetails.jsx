import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { MapPin, Banknote, Clock, Send, FileText, ChevronLeft, Upload } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await axios.get(`/api/jobs/${id}`);
                setJob(data);
            } catch (err) {
                console.error('Error fetching job details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (!resumeFile) {
            const msg = 'Please select a resume file before applying.';
            setMessage(msg);
            return;
        }
        setMessage('');

        setApplying(true);
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            let finalResumeUrl = 'https://resume-placeholder.pdf';

            const uploadData = new FormData();
            uploadData.append('file', resumeFile);

            const uploadRes = await axios.post('/api/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            finalResumeUrl = uploadRes.data.url;

            await axios.post('/api/applications', {
                job: job._id,
                resumeUrl: finalResumeUrl,
                coverLetter: 'Application submitted with uploaded resume via SmartHire.'
            });
            setMessage('Application submitted successfully! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to apply.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted font-medium animate-pulse">Loading Opportunity details...</p>
        </div>
    );
    
    if (!job) return (
        <div className="container py-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Job not found.</h2>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '1.5rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. Improved Navigation Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '-1rem' }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ 
                        background: 'none', border: 'none', color: 'var(--text-muted)', 
                        fontSize: '0.9rem', fontWeight: '600', display: 'flex', 
                        alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                        padding: '0.5rem 0'
                    }}
                >
                    <ChevronLeft size={18} /> Exit to dashboard
                </button>
            </div>

            {/* 2. Enhanced Hero Section (Kept Original Alignment) */}
            <div className="glass-panel" style={{ 
                padding: '2.25rem 2.5rem', 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', 
                border: '1px solid var(--border-subtle)', 
                position: 'relative', 
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'var(--accent-primary)', filter: 'blur(110px)', opacity: '0.15', borderRadius: '50%' }}></div>

                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.5rem', margin: 0 }}>{job.title}</h1>
                <p style={{ fontSize: '1.4rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '2rem', marginTop: '0.25rem' }}>{job.company}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <span style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', 
                        borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', 
                        background: 'rgba(99, 102, 241, 0.08)', color: '#a5b4fc', 
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <MapPin size={16} /> {job.location}
                    </span>
                    {job.salary && (
                        <span style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', 
                            borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', 
                            background: 'rgba(16, 185, 129, 0.08)', color: '#6ee7b7', 
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Banknote size={16} /> {job.salary}
                        </span>
                    )}
                    <span style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', 
                        borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', 
                        background: 'rgba(236, 72, 153, 0.08)', color: '#f9a8d4', 
                        border: '1px solid rgba(236, 72, 153, 0.2)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <Clock size={16} /> Full-time
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'stretch' }}>

                {/* Left Column: Descriptions (Equal level alignment) */}
                <div style={{ flex: '2 1 0%', display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '350px' }}>
                    <div className="glass-panel" style={{ 
                        padding: '1.5rem 2rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-lg)',
                        flex: 1, display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem', marginTop: 0 }}>About the Role</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.95rem', margin: 0 }}>{job.description}</p>
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                        <div className="glass-panel" style={{ padding: '1.5rem 2rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem', marginTop: 0 }}>Requirements</h3>
                            <ul style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, listStyle: 'none', margin: 0 }}>
                                {job.requirements.map((req, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '0.5rem', boxShadow: '0 0 6px var(--accent-primary)' }}></div>
                                        <span style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column: Actions (Equal level alignment) */}
                <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '300px' }}>
                    <div className="glass-panel" style={{ 
                        padding: '1.5rem 2rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-lg)',
                        display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', flex: 1
                    }}>
                        {user?.role === 'Candidate' ? (
                            <>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem', marginTop: 0 }}>Ready to join?</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Submit your application for consideration.</p>

                                {message && (
                                    <div style={{ 
                                        padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: '700', 
                                        backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                        color: message.includes('success') ? 'var(--success)' : 'var(--error)', 
                                        border: `1px solid ${message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` 
                                    }}>
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', display: 'block', letterSpacing: '0.05em' }}>Your Resume</label>
                                        <input
                                            type="file"
                                            id="resume-upload"
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                setResumeFile(e.target.files[0]);
                                                if (message?.includes('select a resume')) setMessage('');
                                            }}
                                        />
                                        <label htmlFor="resume-upload" style={{ 
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', 
                                            border: `1px dashed ${message.includes('select a resume') ? 'var(--error)' : (resumeFile ? 'var(--success)' : 'rgba(255,255,255,0.2)')}`, 
                                            background: 'rgba(0,0,0,0.2)', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                                            overflow: 'hidden'
                                        }}>
                                            <Upload size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                                            <span style={{ fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {resumeFile ? resumeFile.name : 'Select PDF...'}
                                            </span>
                                        </label>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '800' }} disabled={applying || message.includes('success')}>
                                        <Send size={16} /> {applying ? 'Applying...' : 'Apply Now'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                    {user ? "Admin access enabled." : "Sign in to apply for this role."}
                                </p>
                                {!user && (
                                    <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>Login / Join</button>
                                )}
                            </div>
                        )}

                        <div style={{ flex: 1, minHeight: '1rem' }}></div>

                        {job.jdUrl && (
                            <a href={`http://localhost:5000${job.jdUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.9rem', 
                                background: 'rgba(30, 41, 59, 0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', 
                                textDecoration: 'none', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                            >
                                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                                    <FileText size={16} />
                                </div>
                                <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>Job Description (PDF)</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ height: '1.5rem' }}></div>
        </div>
    );
};

export default JobDetails;

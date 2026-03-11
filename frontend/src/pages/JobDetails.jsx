import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { MapPin, Banknote, Clock, Send, FileText } from 'lucide-react';

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
        setApplying(true);
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            let finalResumeUrl = 'https://resume-placeholder.pdf';

            if (resumeFile) {
                const uploadData = new FormData();
                uploadData.append('file', resumeFile);

                const uploadRes = await axios.post('/api/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalResumeUrl = uploadRes.data.url;
            }

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

    if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading Job Details...</div>;
    if (!job) return <div className="text-center py-20 text-xl text-red-400">Job not found.</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header / Hero Section */}
            <div className="glass-panel" style={{ padding: '3rem 2.5rem', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: '0.2', borderRadius: '50%' }}></div>

                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '1rem', margin: 0 }}>{job.title}</h1>
                <p style={{ fontSize: '1.5rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>{job.company}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <MapPin size={16} /> {job.location}
                    </span>
                    {job.salary && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <Banknote size={16} /> {job.salary}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(236, 72, 153, 0.1)', color: '#f9a8d4', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                        <Clock size={16} /> Full-time
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

                {/* Left Column: Descriptions */}
                <div style={{ flex: '2 1 0%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>Job Description</h3>
                        <p style={{ color: '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.05rem', margin: 0 }}>{job.description}</p>
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                        <div className="glass-panel" style={{ padding: '2.5rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>Key Requirements</h3>
                            <ul style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, listStyle: 'none', margin: 0 }}>
                                {job.requirements.map((req, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '0.6rem' }}></div>
                                        <span style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column: Actions */}
                <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
                    {user?.role === 'Candidate' && (
                        <div className="card glass-panel" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '2rem', borderTop: '4px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ffffff', marginTop: 0 }}>Ready to join?</h3>

                            {message && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('success') ? '#6ee7b7' : '#fca5a5', border: `1px solid ${message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Upload Resume (PDF/Word)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setResumeFile(e.target.files[0])}
                                        style={{ width: '100%', fontSize: '0.875rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)', padding: '0.8rem 1.25rem' }} disabled={applying || message.includes('success')}>
                                    <Send size={18} /> {applying ? 'Applying...' : 'Submit Now'}
                                </button>
                            </form>
                        </div>
                    )}

                    {job.jdUrl && (
                        <a href={`http://localhost:5000${job.jdUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                                <FileText size={20} />
                            </div>
                            <span style={{ fontWeight: '600', color: '#e2e8f0' }}>Job description</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetails;

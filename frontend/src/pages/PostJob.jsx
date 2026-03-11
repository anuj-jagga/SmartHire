import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Briefcase } from 'lucide-react';

const PostJob = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Ensure only HR or Admin can view this page
    if (!user || (user.role !== 'HR' && user.role !== 'Admin')) {
        navigate('/dashboard');
        return null; // Return null so the rest of the component doesn't briefly render
    }

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
        minSalary: '',
        maxSalary: ''
    });

    const [jdFile, setJdFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            let uploadedJdUrl = '';

            if (jdFile) {
                const uploadData = new FormData();
                uploadData.append('file', jdFile);

                const uploadRes = await axios.post('/api/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedJdUrl = uploadRes.data.url;
            }

            const payload = { ...formData };
            if (payload.requirements && typeof payload.requirements === 'string') {
                payload.requirements = payload.requirements
                    .split(/[,\n]+/)
                    .map(item => item.trim())
                    .filter(item => item !== '');
            }
            if (uploadedJdUrl) payload.jdUrl = uploadedJdUrl;

            if (payload.salary) {
                const numbers = payload.salary.match(/\d+/g);
                if (numbers && numbers.length > 0) {
                    const parsedNums = numbers.map(Number);
                    payload.minSalary = parsedNums[0];
                    if (parsedNums.length > 1) {
                        payload.maxSalary = parsedNums[1];
                    }
                }
            } else {
                delete payload.salary;
            }

            // Cleanup empty string strict validations for JOI
            if (payload.minSalary === '') delete payload.minSalary;
            if (payload.maxSalary === '') delete payload.maxSalary;

            await axios.post('/api/jobs', payload);
            navigate('/dashboard'); // Go back to dashboard on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%', position: 'relative' }}>
            {/* Background elements to match the theme */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'rgba(49, 46, 129, 0.1)', borderRadius: '9999px', filter: 'blur(120px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'rgba(88, 28, 135, 0.1)', borderRadius: '9999px', filter: 'blur(120px)' }}></div>
            </div>

            <div className="card glass-panel relative z-10 p-8" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: '0.1', borderRadius: '50%', pointerEvents: 'none' }}></div>

                <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 0 15px rgba(99,102,241,0.2)' }}>
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Post a New Job</h2>
                        <p className="mt-1" style={{ color: '#94a3b8' }}>Create a new opportunity and find the perfect candidate.</p>
                    </div>
                </div>

                {error && <div className="p-4 mb-8 rounded" style={{ fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#ef4444' }} className="animate-pulse"></div>{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Title</label>
                            <input
                                type="text"
                                name="title"
                                className="input-field"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Senior Backend Engineer"
                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Name</label>
                            <input
                                type="text"
                                name="company"
                                className="input-field"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                            <input
                                type="text"
                                name="location"
                                className="input-field"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Remote, San Francisco, CA"
                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</label>
                            <input
                                type="text"
                                name="salary"
                                className="input-field"
                                value={formData.salary}
                                onChange={handleChange}
                                required
                                placeholder="e.g. $120,000 - $150,000 / year"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Description (Short Summary)</label>
                        <textarea
                            name="description"
                            className="input-field"
                            style={{ minHeight: '100px', resize: 'vertical', lineHeight: '1.6' }}
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Brief overview of the role and responsibilities..."
                        />
                    </div>

                    <div>
                        <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Official Job Document (PDF/Word)</label>
                        <div 
                            style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; }}
                            onClick={() => document.getElementById('jdFileInput').click()}
                        >
                            <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                                {jdFile ? jdFile.name : 'Click to select a document from your computer'}
                            </span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem' }}>Optional. Provide the full formal JD document for candidates to download.</span>
                            <input
                                type="file"
                                id="jdFileInput"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={(e) => setJdFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements & Qualifications</label>
                        <textarea
                            name="requirements"
                            className="input-field"
                            style={{ minHeight: '150px', resize: 'vertical', lineHeight: '1.6' }}
                            value={formData.requirements}
                            onChange={handleChange}
                            required
                            placeholder="• 5+ years of experience with React/Node&#10;• Experience with AWS or similar cloud providers&#10;• Strong communication skills..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn" style={{ background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', boxShadow: '0 4px 15px -3px rgba(139,92,246,0.3)' }} disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin"></div>
                                    Publishing...
                                </span>
                            ) : 'Publish Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;

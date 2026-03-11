import re
import sys

# Patch CandidateDashboard.jsx
with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\components\\dashboards\\CandidateDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will just write a regex that matches the entire modal block and replaces it.
start_marker = "{/* Candidate Application Details Modal */}"
end_marker = "            <header"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    new_modal = """{/* Candidate Application Details Modal */}
            {selectedApp && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '32rem', padding: '0', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background glow for modal */}
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: '0.15', borderRadius: '50%', pointerEvents: 'none' }}></div>
                        
                        <div style={{ padding: '2.5rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '-0.025em', color: '#ffffff' }}>Application Details</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`badge ${selectedApp.status === 'Applied' ? 'badge-warning' : selectedApp.status === 'Offered' ? 'badge-success' : selectedApp.status === 'Interviewing' ? 'badge-warning' : selectedApp.status === 'Rejected' ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                                    {selectedApp.status === 'Interviewing' ? 'Scheduled' : selectedApp.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Role & Company Card */}
                                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Position</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem', margin: 0 }}>{selectedApp.jobTitle || selectedApp.job?.title || 'Unknown Job'}</p>
                                    {selectedApp.job?.company && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <Briefcase size={14} style={{ color: 'var(--accent-primary)' }} />
                                            <p style={{ fontSize: '1rem', fontWeight: '500', color: '#cbd5e1', margin: 0 }}>{selectedApp.job.company}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Resume View Button */}
                                {selectedApp.resumeUrl && (
                                    <a href={selectedApp.resumeUrl.startsWith('http') ? selectedApp.resumeUrl : `http://localhost:5000${selectedApp.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease', textDecoration: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.625rem', borderRadius: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p style={{ color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>View Submitted Resume</p>
                                                <p style={{ color: 'rgba(165, 180, 252, 0.7)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Click to open in new tab</p>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                {/* Interview Info */}
                                {selectedApp.interviewDate && !['Rejected', 'Offered'].includes(selectedApp.status) && (
                                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: '#fbbf24', display: 'flex', alignItems: 'center' }}>
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Interview Scheduled</p>
                                                <p style={{ color: 'rgba(253, 230, 138, 0.8)', fontSize: '0.875rem', margin: 0 }}>{new Date(selectedApp.interviewDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {selectedApp.interviewNotes && (
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(245, 158, 11, 0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Instructions</p>
                                                <p style={{ fontSize: '0.875rem', color: 'rgba(253, 230, 138, 0.9)', lineHeight: '1.625', background: 'rgba(120, 53, 15, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.1)', margin: 0 }}>{selectedApp.interviewNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <button onClick={() => setSelectedApp(null)} className="btn" style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Close Frame</button>
                                <button onClick={() => handleWithdrawApplication(selectedApp._id)} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Withdraw App</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

"""
    content = content[:start_idx] + new_modal + content[end_idx:]
    with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\components\\dashboards\\CandidateDashboard.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("CandidateDashboard.jsx patched.")

# Patch JobDetails.jsx
with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\pages\\JobDetails.jsx", "r", encoding="utf-8") as f:
    content_jd = f.read()

start_marker_jd = '        <div className="animate-fade-in"'
end_marker_jd = "    );\n};\n"

if start_marker_jd in content_jd and end_marker_jd in content_jd:
    start_idx_jd = content_jd.find(start_marker_jd)
    end_idx_jd = content_jd.find(end_marker_jd)
    new_jd = """        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header / Hero Section */}
            <div className="glass-panel" style={{ padding: '3rem 2.5rem', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: '0.2', borderRadius: '50%' }}></div>
                
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '1rem', margin: 0 }}>{job.title}</h1>
                <p style={{ fontSize: '1.5rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>{job.company}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <MapPin size={16} /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <Banknote size={16} /> {job.salary}
                    </span>
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
                            <span style={{ fontWeight: '600', color: '#e2e8f0' }}>Official Document</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
"""
    content_jd = content_jd[:start_idx_jd] + new_jd + content_jd[end_idx_jd:]
    with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\pages\\JobDetails.jsx", "w", encoding="utf-8") as f:
        f.write(content_jd)
    print("JobDetails.jsx patched.")


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
                    <div className="card" style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto', padding: '0', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}>
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
                                    
                                    {/* Job Meta Details */}
                                    {selectedApp.job && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {selectedApp.job.location && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#a5b4fc' }}>
                                                    <MapPin size={14} /> {selectedApp.job.location}
                                                </span>
                                            )}
                                            {(selectedApp.job.salary || selectedApp.job.minSalary) && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#6ee7b7' }}>
                                                    <Banknote size={14} /> {selectedApp.job.salary ? selectedApp.job.salary : selectedApp.job.maxSalary ? `${selectedApp.job.minSalary} - ${selectedApp.job.maxSalary}` : selectedApp.job.minSalary}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Job Description Snippet */}
                                {selectedApp.job?.description && (
                                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '0.75rem' }}>Job Description</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                            {selectedApp.job.description.length > 200 ? selectedApp.job.description.substring(0, 200) + '...' : selectedApp.job.description}
                                        </p>
                                    </div>
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

                                {/* Links Row */}
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {/* Resume View Button */}
                                    {selectedApp.resumeUrl && (
                                        <a href={selectedApp.resumeUrl.startsWith('http') ? selectedApp.resumeUrl : selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease', textDecoration: 'none', gap: '1rem' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.625rem', borderRadius: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>View Resume</p>
                                                <p style={{ color: 'rgba(165, 180, 252, 0.7)', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>Uploaded Document</p>
                                            </div>
                                        </a>
                                    )}

                                    {/* Official JD Button */}
                                    {selectedApp.job?.jdUrl && (
                                        <a href={selectedApp.job.jdUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease', textDecoration: 'none', gap: '1rem' }}>
                                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.625rem', borderRadius: '0.5rem', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>Official JD</p>
                                                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>Company Document</p>
                                            </div>
                                        </a>
                                    )}
                                </div>

                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
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

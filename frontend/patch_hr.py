import re

# Patch HRDashboard.jsx
with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\components\\dashboards\\HRDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{/* HR Review Application Modal */}"
end_marker = "<div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem'"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    new_modal = """{/* HR Review Application Modal */}
            {selectedApp && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '38rem', padding: '0', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background glow for modal */}
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: '0.15', borderRadius: '50%', pointerEvents: 'none' }}></div>
                        
                        <div style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 1, padding: '2.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '-0.025em', color: '#ffffff' }}>
                                        {schedulingMode ? 'Schedule Interview' : 'Review Application'}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Candidate ID: {selectedApp.candidate?._id?.substring(0,8) || 'Unknown'}</p>
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

                                {/* Documents Row */}
                                {selectedApp.resumeUrl && (
                                    <a href={selectedApp.resumeUrl.startsWith('http') ? selectedApp.resumeUrl : `http://localhost:5000${selectedApp.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease', textDecoration: 'none', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.625rem', borderRadius: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
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
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem'"""
            
    content = content[:start_idx] + new_modal + content[end_idx + 68:]
    with open("c:\\Users\\jagga\\OneDrive\\Desktop\\SmartHire\\frontend\\src\\components\\dashboards\\HRDashboard.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("HRDashboard.jsx review modal patched successfully.")

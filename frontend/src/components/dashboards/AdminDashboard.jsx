import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { Trash2, Download, Search, CheckCircle, AlertCircle, Users, Briefcase, Award } from 'lucide-react';
import EliteConfirmModal from '../common/EliteConfirmModal';

const AdminDashboard = ({ 
    user, 
    adminStats, 
    usersList, 
    setUsersList,
    adminUserSearch,
    setAdminUserSearch,
    adminUserRole,
    setAdminUserRole,
    adminUserPage,
    setAdminUserPage,
    adminUserTotalPages,
    analyticsEvents = []
}) => {
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // type: success | error

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleDownloadReport = () => {
        if (!adminStats) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminStats, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "smarthire_admin_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast('Report downloaded successfully!');
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            // eslint-disable-next-line react-hooks/immutability
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            await axios.put(`/api/auth/users/${userId}/role`, { role: newRole });

            // Re-fetch users or update local state
            setUsersList(usersList.map(u => u._id === userId ? { ...u, role: newRole } : u));
            showToast(`Role updated successfully`, 'success');
        } catch (err) {
            console.error('Failed to change role', err);
            showToast('Failed to change role.', 'error');
        }
    };

    const handleDeleteUser = (userId) => {
        setConfirmModal({ isOpen: true, id: userId });
    };

    const confirmDeleteUser = async () => {
        const userId = confirmModal.id;
        try {
            // eslint-disable-next-line react-hooks/immutability
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            await axios.delete(`/api/auth/users/${userId}`);

            // Re-fetch users or update local state
            setUsersList(usersList.filter(u => u._id !== userId));
            setConfirmModal({ isOpen: false, id: null });
            showToast('User permanently deleted.', 'success');
        } catch (err) {
            console.error('Failed to delete user', err);
            showToast('Failed to delete user.', 'error');
        }
    };

    return (
        <div className="admin-dash animate-fade-in relative" style={{ padding: '2.5rem 0' }}>
            <header className="relative" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '64rem', margin: '0 auto 2.5rem auto', flexDirection: window.innerWidth > 768 ? 'row' : 'column', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 auto', textAlign: 'center' }}>
                    <h2 className="font-bold text-gradient" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>System Overview</h2>
                    <p style={{ color: '#94a3b8' }}>Real-time Advanced Insights across the Platform</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                        onClick={handleDownloadReport}
                        className="btn bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </header>

            {adminStats ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr', gap: '1.5rem' }}>
                        {/* Candidates Card */}
                        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#3b82f6', boxShadow: '0 0 15px #3b82f6' }}></div>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: '#3b82f6' }}>
                                <Users size={120} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Users size={20} style={{ color: '#60a5fa' }} />
                                </div>
                                <p style={{ color: '#94a3b8', letterSpacing: '0.05em', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Total Candidates</p>
                            </div>
                            <h3 className="font-extrabold" style={{ fontSize: '3rem', color: '#ffffff', position: 'relative', zIndex: 1, margin: 0 }}>{adminStats.totalStudents}</h3>
                        </div>

                        {/* Jobs Listed Card */}
                        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6', boxShadow: '0 0 15px #8b5cf6' }}></div>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: '#8b5cf6' }}>
                                <Briefcase size={120} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Briefcase size={20} style={{ color: '#a78bfa' }} />
                                </div>
                                <p style={{ color: '#94a3b8', letterSpacing: '0.05em', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Jobs Listed</p>
                            </div>
                            <h3 className="font-extrabold" style={{ fontSize: '3rem', color: '#ffffff', position: 'relative', zIndex: 1, margin: 0 }}>{adminStats.totalJobs}</h3>
                        </div>

                        {/* Placements Card */}
                        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981', boxShadow: '0 0 15px #10b981' }}></div>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: '#10b981' }}>
                                <Award size={120} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Award size={20} style={{ color: '#34d399' }} />
                                </div>
                                <p style={{ color: '#94a3b8', letterSpacing: '0.05em', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Selected Placements</p>
                            </div>
                            <h3 className="font-extrabold" style={{ fontSize: '3rem', color: '#ffffff', position: 'relative', zIndex: 1, margin: 0 }}>{adminStats.selectedCount}</h3>
                        </div>
                    </div>

                    {/* Live Pipeline Activity Feed */}
                    <div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h3 className="font-bold flex items-center gap-3" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                            <div className="rounded-full" style={{ background: 'var(--accent-gradient)', width: '8px', height: '32px' }}></div>
                            Live Pipeline Activity
                        </h3>
                        <div className="glass-panel" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem' }}>
                            {analyticsEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <AlertCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No recent activity detected.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {analyticsEvents.map((event, idx) => {
                                        let icon = <AlertCircle size={16} />;
                                        let iconColor = '#94a3b8';
                                        let bgColor = 'rgba(148, 163, 184, 0.1)';
                                        
                                        if (event.event === 'APPLICATION_SUBMITTED') {
                                            icon = <Briefcase size={16} />;
                                            iconColor = '#60a5fa';
                                            bgColor = 'rgba(59, 130, 246, 0.1)';
                                        } else if (event.event === 'APPLICATION_STATUS_UPDATED') {
                                            icon = <CheckCircle size={16} />;
                                            iconColor = '#34d399';
                                            bgColor = 'rgba(16, 185, 129, 0.1)';
                                        } else if (event.event === 'USER_REGISTERED') {
                                            icon = <Users size={16} />;
                                            iconColor = '#a78bfa';
                                            bgColor = 'rgba(139, 92, 246, 0.1)';
                                        } else if (event.event === 'USER_LOGIN') {
                                            icon = <Award size={16} />;
                                            iconColor = '#fbbf24';
                                            bgColor = 'rgba(251, 191, 36, 0.1)';
                                        }

                                        return (
                                            <div key={idx} style={{ 
                                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                                                borderBottom: idx === analyticsEvents.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                                transition: 'all 0.2s ease',
                                                borderRadius: '0.5rem'
                                            }} className="hover:bg-white/5">
                                                <div style={{ 
                                                    width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', 
                                                    backgroundColor: bgColor, color: iconColor,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {icon}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>
                                                                {event.user?.name || 'System'} <span style={{ fontWeight: 400, color: '#94a3b8' }}>{event.details || event.event.replace(/_/g, ' ').toLowerCase()}</span>
                                                            </p>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                                                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        {event.candidate && <span>Candidate: <strong>{event.candidate.name}</strong></span>}
                                                        {event.job && <span> • Job: <strong>{event.job.title}</strong></span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {adminStats.jobWiseStats && adminStats.jobWiseStats.length > 0 && (
                        <div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <h3 className="font-bold flex items-center gap-3" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                                <div className="rounded-full" style={{ background: '#10b981', width: '8px', height: '32px' }}></div>
                                Job-wise Selection Breakdown
                            </h3>
                            <div className="glass-panel overflow-x-auto rounded-xl border border-white/5">
                                <div style={{ minWidth: '700px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <div className="font-semibold text-muted text-sm uppercase tracking-wider">Job Title</div>
                                        <div className="font-semibold text-muted text-sm uppercase tracking-wider">Company</div>
                                        <div className="font-semibold text-muted text-sm uppercase tracking-wider">Total</div>
                                        <div className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Offered</div>
                                        <div className="font-semibold text-blue-400 text-sm uppercase tracking-wider">Pending</div>
                                        <div className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Interview</div>
                                        <div className="font-semibold text-red-400 text-sm uppercase tracking-wider">Rejected</div>
                                    </div>
                                    <div style={{ borderTop: 'none' }}>
                                        {adminStats.jobWiseStats.map((stat, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1.25rem 1.5rem', alignItems: 'center', borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                <div className="font-medium truncate" style={{ paddingRight: '1rem', color: '#fff' }} title={stat.jobTitle}>{stat.jobTitle}</div>
                                                <div className="truncate" style={{ paddingRight: '1rem', color: '#94a3b8' }} title={stat.company}>{stat.company}</div>
                                                <div style={{ color: '#94a3b8' }}>{stat.totalApplications}</div>
                                                <div className="font-bold" style={{ color: '#34d399' }}>{stat.offered}</div>
                                                <div style={{ color: '#60a5fa' }}>{stat.pending}</div>
                                                <div style={{ color: '#fbbf24' }}>{stat.interviewing}</div>
                                                <div style={{ color: '#f87171' }}>{stat.rejected}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-muted">Loading System Stats...</div>
            )}

            <div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '1rem', maxWidth: '64rem', margin: '2rem auto 2.5rem auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexDirection: window.innerWidth > 768 ? 'row' : 'column', alignItems: window.innerWidth > 768 ? 'center' : 'flex-start' }}>
                    <h3 className="font-bold flex items-center gap-3" style={{ fontSize: '1.5rem', margin: 0 }}>
                        <div className="rounded-full" style={{ background: '#3b82f6', width: '8px', height: '32px' }}></div>
                        Platform User Management
                    </h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', width: window.innerWidth > 768 ? 'auto' : '100%' }}>
                        <div style={{ position: 'relative', width: window.innerWidth > 768 ? '280px' : '100%' }}>
                            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                <Search className="text-muted" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={adminUserSearch}
                                onChange={(e) => {
                                    setAdminUserSearch(e.target.value);
                                    setAdminUserPage(1); // Reset to page 1 on search
                                }}
                                className="input-field"
                                style={{ padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.9rem', width: '100%' }}
                            />
                        </div>
                        <select
                            value={adminUserRole}
                            onChange={(e) => {
                                setAdminUserRole(e.target.value);
                                setAdminUserPage(1); // Reset to page 1 on filter
                            }}
                            className="input-field cursor-pointer"
                            style={{ width: window.innerWidth > 768 ? '150px' : '100%', padding: '0.65rem 1rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.9rem' }}
                        >
                            <option value="">All Roles</option>
                            <option value="Candidate">Candidate</option>
                            <option value="HR">HR</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ minWidth: '700px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 3fr 1.5fr 1.5fr 80px', gap: '1rem', padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div className="font-semibold" style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</div>
                            <div className="font-semibold" style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                            <div className="font-semibold" style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</div>
                            <div className="font-semibold" style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
                            <div className="font-semibold" style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</div>
                        </div>
                        <div style={{ borderTop: 'none' }}>
                            {usersList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>No users found matching current filters.</div>
                            ) : usersList.map((usr, idx) => (
                                <div key={usr._id} style={{ display: 'grid', gridTemplateColumns: '3fr 3fr 1.5fr 1.5fr 80px', gap: '1rem', padding: '1.25rem 1.5rem', alignItems: 'center', borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div className="font-medium truncate" style={{ paddingRight: '1rem', color: '#fff' }} title={usr.name}>{usr.name}</div>
                                    <div className="truncate" style={{ color: '#94a3b8', fontSize: '0.875rem', paddingRight: '1rem' }} title={usr.email}>{usr.email}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}</div>
                                <div style={{ paddingRight: '1rem' }}>
                                    <select
                                        value={usr.role}
                                        onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                                        className="cursor-pointer"
                                        style={{ width: '100%', outline: 'none', padding: '0.35rem 0.5rem', fontSize: '0.875rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem', color: usr.role === 'Admin' ? '#f87171' : usr.role === 'HR' ? '#fbbf24' : '#60a5fa' }}
                                        disabled={usr._id === user._id}
                                    >
                                        <option value="Candidate">Candidate</option>
                                        <option value="HR">HR</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                        <button
                                            onClick={() => handleDeleteUser(usr._id)}
                                            disabled={usr._id === user._id}
                                            className="btn disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{ 
                                                padding: '0.5rem', 
                                                background: 'rgba(239, 68, 68, 0.15)', 
                                                color: '#f87171',
                                                border: '1px solid rgba(239, 68, 68, 0.4)', 
                                                borderRadius: '0.375rem', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                if(usr._id !== user._id) {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                                                    e.currentTarget.style.color = '#fca5a5';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if(usr._id !== user._id) {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                    e.currentTarget.style.color = '#f87171';
                                                }
                                            }}
                                            title={usr._id === user._id ? "Cannot delete yourself" : "Delete User"}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                {adminUserTotalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            onClick={() => setAdminUserPage(p => Math.max(1, p - 1))}
                            disabled={adminUserPage === 1}
                            className="btn"
                            style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', opacity: adminUserPage === 1 ? 0.5 : 1, cursor: adminUserPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Previous
                        </button>
                        <span style={{ color: '#94a3b8' }}>
                            Page <span className="font-medium" style={{ color: '#fff' }}>{adminUserPage}</span> of {adminUserTotalPages}
                        </span>
                        <button
                            onClick={() => setAdminUserPage(p => Math.min(adminUserTotalPages, p + 1))}
                            disabled={adminUserPage === adminUserTotalPages}
                            className="btn"
                            style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', opacity: adminUserPage === adminUserTotalPages ? 0.5 : 1, cursor: adminUserPage === adminUserTotalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            {/* Confirmation Modal */}
            <EliteConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmDeleteUser}
                title="Delete User Permanently?"
                message="Are you sure? This user and all their associated data will be purged from the platform."
                confirmText="Delete Permanently"
                type="danger"
            />

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in z-50 ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

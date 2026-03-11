import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { Briefcase, FileText, Calendar, MapPin, Search, Sliders, Banknote, X, Command, Video, RefreshCcw } from 'lucide-react';
import { canJoinInterview, isInterviewExpired } from '../../utils/helpers';
import EliteConfirmModal from '../common/EliteConfirmModal';

const CandidateDashboard = ({
    user,
    jobs,
    applications,
    setApplications,
    searchQuery, setSearchQuery,
    locationFilter, setLocationFilter,
    minSalaryFilter, setMinSalaryFilter,
    maxSalaryFilter, setMaxSalaryFilter,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    totalPages
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('available');
    const [selectedApp, setSelectedApp] = useState(null);

    // Elite Search Suite State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [localLocation, setLocalLocation] = useState(locationFilter);
    const [localMinSalary, setLocalMinSalary] = useState(minSalaryFilter);
    const [localMaxSalary, setLocalMaxSalary] = useState(maxSalaryFilter);
    const [localStatus, setLocalStatus] = useState(statusFilter);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    // Keyboard Shortcut: CMD+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen]);

    const handleApplyFilters = () => {
        setSearchQuery(localSearch);
        setLocationFilter(localLocation);
        setMinSalaryFilter(localMinSalary);
        setMaxSalaryFilter(localMaxSalary);
        setStatusFilter(localStatus);
        setIsSearchOpen(false);
    };

    const handleClearFilters = () => {
        setLocalSearch('');
        setLocalLocation('');
        setLocalMinSalary('');
        setLocalMaxSalary('');
        setLocalStatus('');
        setSearchQuery('');
        setLocationFilter('');
        setMinSalaryFilter('');
        setMaxSalaryFilter('');
        setStatusFilter('');
    };

    const handleWithdrawApplication = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmWithdraw = async () => {
        const id = confirmModal.id;
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
            await axios.delete(`/api/applications/${id}`);
            setApplications(applications.filter(app => app._id !== id));
            setSelectedApp(null);
            setConfirmModal({ isOpen: false, id: null });
        } catch (err) {
            console.error('Failed to withdraw application', err);
            alert(err.response?.data?.message || 'Failed to withdraw application.');
        }
    };

    const appliedJobIds = new Set(
        applications
            .map(app => {
                if (app.job && typeof app.job === 'object' && app.job._id) {
                    return app.job._id.toString();
                } else if (app.job) {
                    return app.job.toString();
                }
                return null;
            })
            .filter(id => id !== null)
    );
    const availableJobs = jobs.filter(job => job && !appliedJobIds.has(job._id.toString()));

    return (
        <div className="candidate-dash">
            {/* Elite Search Suite Overlay - Redesigned & Stabilized */}
            {isSearchOpen && (
                <div className="elite-search-modal-container">
                    {/* Immersive Backdrop */}
                    <div
                        className="elite-search-backdrop"
                        onClick={() => setIsSearchOpen(false)}
                    />

                    {/* Search Command Center Card */}
                    <div className="elite-search-card">
                        {/* Search Bar Segment */}
                        <div className="elite-search-header">
                            <div className="elite-search-icon-wrapper">
                                <Search className="text-accent-pulse" size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search roles, companies, or tech stack..."
                                className="elite-search-input"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                autoFocus
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="elite-search-close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Middle Controls & Layout */}
                        <div className="elite-search-body">
                            <div className="elite-search-meta">
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`elite-search-toggle ${showAdvancedFilters ? 'active' : ''}`}
                                >
                                    <Sliders size={14} /> {showAdvancedFilters ? 'Simple View' : 'Advanced Filters'}
                                </button>

                                <div className="elite-search-shortcut">
                                    <Command size={11} /> <span style={{ marginLeft: '4px' }}>K</span>
                                </div>
                            </div>

                            {/* Advanced Segment (Expandable) */}
                            {showAdvancedFilters && (
                                <div className="elite-search-advanced-grid">
                                    {/* Location Input */}
                                    <div className="elite-search-field">
                                        <div className="elite-search-field-header">
                                            <label>Location Preference</label>
                                            <MapPin size={12} className="meta-icon" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Remote, London, etc."
                                            className="elite-search-sub-input"
                                            value={localLocation}
                                            onChange={(e) => setLocalLocation(e.target.value)}
                                        />
                                    </div>

                                    {/* Status Multiplier */}
                                    <div className="elite-search-field">
                                        <div className="elite-search-field-header">
                                            <label>Job Status</label>
                                            <Briefcase size={12} className="meta-icon" />
                                        </div>
                                        <select
                                            className="elite-search-sub-input"
                                            value={localStatus}
                                            onChange={(e) => setLocalStatus(e.target.value)}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="">Any Status</option>
                                            <option value="Open">Active Only</option>
                                            <option value="Closed">Closed Only</option>
                                        </select>
                                    </div>

                                    {/* Min Salary */}
                                    <div className="elite-search-field">
                                        <div className="elite-search-field-header">
                                            <label>Min Salary ($)</label>
                                            <Banknote size={12} className="meta-icon success" />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="e.g. 80000"
                                            className="elite-search-sub-input"
                                            value={localMinSalary}
                                            onChange={(e) => setLocalMinSalary(e.target.value)}
                                        />
                                    </div>

                                    {/* Max Salary */}
                                    <div className="elite-search-field">
                                        <div className="elite-search-field-header">
                                            <label>Max Salary ($)</label>
                                            <Banknote size={12} className="meta-icon success" />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="e.g. 150000"
                                            className="elite-search-sub-input"
                                            value={localMaxSalary}
                                            onChange={(e) => setLocalMaxSalary(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="elite-search-footer">
                                <button
                                    onClick={handleClearFilters}
                                    className="elite-search-btn-secondary"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="elite-search-btn-primary"
                                >
                                    Search Jobs
                                </button>
                            </div>
                        </div>

                        {/* Keyboard Prompt Badge */}
                        <div className="elite-search-hint">
                            Press <span className="highlight">ENTER</span> to execute search
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .elite-search-modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 12vh;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    z-index: 99999 !important;
                }
                .elite-search-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(2, 6, 23, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    z-index: -1;
                }
                .elite-search-card {
                    position: relative;
                    width: 100%;
                    max-width: 42rem;
                    background: rgba(15, 23, 42, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(124, 58, 237, 0.15);
                    overflow: hidden;
                    animation: eliteModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes eliteModalIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .elite-search-header {
                    padding: 1.5rem 1.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .elite-search-icon-wrapper {
                    padding: 0.75rem;
                    background: rgba(124, 58, 237, 0.15);
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .text-accent-pulse {
                    color: #a78bfa;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                .elite-search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: white;
                }
                .elite-search-input::placeholder { color: rgba(255, 255, 255, 0.2); }
                .elite-search-close {
                    padding: 0.75rem;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.2s;
                    border-radius: 1rem;
                }
                .elite-search-close:hover { color: white; background: rgba(255, 255, 255, 0.05); }
                .elite-search-body {
                    padding: 2rem;
                }
                .elite-search-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .elite-search-toggle {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 0.65rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .elite-search-toggle:hover { color: white; }
                .elite-search-toggle.active { color: #a78bfa; }
                .elite-search-shortcut {
                    padding: 0.25rem 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 0.6rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                }
                .elite-search-advanced-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    animation: eliteSlideIn 0.3s ease-out;
                }
                @keyframes eliteSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .elite-search-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .elite-search-field-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 0.25rem;
                }
                .elite-search-field label {
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }
                .meta-icon { color: rgba(167, 139, 250, 0.3); }
                .meta-icon.success { color: rgba(16, 185, 129, 0.3); }
                .elite-search-sub-input {
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 1.1rem 1.25rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .elite-search-sub-input:focus {
                    outline: none;
                    border-color: rgba(124, 58, 237, 0.4);
                    background: rgba(0, 0, 0, 0.6);
                }
                .elite-search-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1.5rem 0 0.5rem 0;
                }
                .elite-search-btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .elite-search-btn-secondary:hover { color: white; background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.15); }
                .elite-search-btn-primary {
                    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.4);
                }
                .elite-search-btn-primary:hover {
                    box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.6);
                    transform: translateY(-2px);
                }
                .elite-search-hint {
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: center;
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.4em;
                }
                .elite-search-hint .highlight { color: rgba(255, 255, 255, 0.3); }

                /* Header Search Button */
                .elite-header-search-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    padding: 0.75rem 1.25rem;
                    border-radius: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .elite-header-search-btn:hover {
                    background: rgba(255, 255, 255, 0.06) !important;
                    border-color: rgba(124, 58, 237, 0.3) !important;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }
                .elite-header-search-btn .label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                }
                .elite-header-search-btn:hover .label { color: rgba(255, 255, 255, 0.8); }
                .elite-header-search-btn .shortcut {
                    padding: 0.15rem 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    font-size: 0.6rem;
                    color: rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                }

                @media (max-width: 768px) {
                    .elite-search-advanced-grid { grid-template-columns: 1fr; }
                    .elite-search-card { border-radius: 0; height: 100vh; max-width: none; }
                    .elite-search-modal-container { padding: 0; padding-top: 0; }
                }
            `}</style>

            {/* Candidate Application Details Modal */}
            {selectedApp && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '42rem', padding: '0', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background glow for modal */}
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: '0.15', borderRadius: '50%', pointerEvents: 'none' }}></div>

                        {/* Scrollable Container hidden scrollbar */}
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', position: 'relative', zIndex: 1, padding: '2.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '-0.025em', color: '#ffffff' }}>Application Details</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
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
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#a5b4fc', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                    <MapPin size={14} /> {selectedApp.job.location}
                                                </span>
                                            )}
                                            {(selectedApp.job.salary || selectedApp.job.minSalary) && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#6ee7b7', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    <Banknote size={14} /> {selectedApp.job.salary ? selectedApp.job.salary : selectedApp.job.maxSalary ? `${selectedApp.job.minSalary} - ${selectedApp.job.maxSalary}` : selectedApp.job.minSalary}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Job Description Snippet */}
                                {selectedApp.job?.description && (
                                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '0.75rem', marginTop: 0 }}>Job Description</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                            {selectedApp.job.description.length > 250 ? selectedApp.job.description.substring(0, 250) + '...' : selectedApp.job.description}
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
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(245, 158, 11, 0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '0.5rem', margin: 0 }}>Instructions</p>
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
                                <button onClick={() => handleWithdrawApplication(selectedApp._id)} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Withdraw Application</button>
                            </div>
                        </div>
                    </div>
                    {/* Add global style block just for scrollbar hiding inside modal if inline isn't enough */}
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                </div>
            )}

            <header className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Welcome, <span className="text-gradient">{user?.name}</span></h1>
                    <p className="text-muted" style={{ marginBottom: '0.5rem' }}>Here's your {user?.role} overview for today.</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User ID:</span>
                        <code style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{user?._id?.substring(0, 8) || 'Unknown'}</code>
                    </div>
                </div>
                <button
                    onClick={() => setIsSearchOpen(true)}
                    style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', transition: 'background 0.2s', cursor: 'pointer' }}
                    title="Quick Search (⌘K)"
                >
                    <Search size={22} style={{ color: '#a78bfa' }} />
                </button>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('available')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'available' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                            color: activeTab === 'available' ? '#a78bfa' : '#64748b',
                            border: 'none',
                            borderBottom: activeTab === 'available' ? '2px solid #7c3aed' : '2px solid transparent',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderTopLeftRadius: '0.75rem',
                            borderTopRightRadius: '0.75rem',
                            marginBottom: '-1px'
                        }}
                        className="hover:text-white"
                    >
                        Available
                    </button>
                    <button
                        onClick={() => setActiveTab('applied')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'applied' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                            color: activeTab === 'applied' ? '#a78bfa' : '#64748b',
                            border: 'none',
                            borderBottom: activeTab === 'applied' ? '2px solid #7c3aed' : '2px solid transparent',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderTopLeftRadius: '0.75rem',
                            borderTopRightRadius: '0.75rem',
                            marginBottom: '-1px'
                        }}
                        className="hover:text-white"
                    >
                        Applied
                    </button>
                </div>
            </div>

            {/* Elite Active Filter Bar - Clinical Monospace Re-Engineering */}
            {(searchQuery || locationFilter || minSalaryFilter || maxSalaryFilter || statusFilter) && activeTab === 'available' && (
                <div
                    className="flex items-center mb-10 w-fit animate-fade-in"
                    style={{
                        padding: '4px 6px',
                        background: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '100px',
                        boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 1)'
                    }}
                >
                    {/* Brand Section - Micro Typography */}
                    <div className="flex items-center border-r border-[#27272a] px-5 py-1.5" style={{ marginRight: '10px' }}>
                        <div style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: '#6366f1',
                            boxShadow: '0 0 8px #6366f1',
                            marginRight: '14px',
                            flexShrink: 0
                        }}></div>
                        <span style={{
                            fontSize: '9px',
                            fontWeight: '900',
                            color: '#71717a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            lineHeight: '1'
                        }}>
                            Filters
                        </span>
                    </div>

                    {/* Active Chips Section - Technical Monospace Vibe */}
                    <div className="flex items-center gap-3 px-1">
                        {searchQuery && (
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-full transition-all hover:border-[#3f3f46]">
                                <Search size={10} className="text-[#a1a1aa]" />
                                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e4e4e7', letterSpacing: '-0.02em' }}>{searchQuery}</span>
                                <X size={10} className="ml-1 text-[#52525b] cursor-pointer hover:text-red-400 transition-colors" onClick={() => setSearchQuery('')} />
                            </div>
                        )}

                        {locationFilter && (
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-full transition-all hover:border-[#3f3f46]">
                                <MapPin size={10} className="text-[#a1a1aa]" />
                                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e4e4e7', letterSpacing: '-0.02em' }}>{locationFilter}</span>
                                <X size={10} className="ml-1 text-[#52525b] cursor-pointer hover:text-red-400 transition-colors" onClick={() => setLocationFilter('')} />
                            </div>
                        )}

                        {statusFilter && (
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-full transition-all hover:border-[#3f3f46]">
                                <Briefcase size={10} className="text-[#a1a1aa]" />
                                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e4e4e7', letterSpacing: '-0.02em' }}>{statusFilter}</span>
                                <X size={10} className="ml-1 text-[#52525b] cursor-pointer hover:text-red-400 transition-colors" onClick={() => setStatusFilter('')} />
                            </div>
                        )}

                        {(minSalaryFilter || maxSalaryFilter) && (
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-full transition-all hover:border-[#3f3f46]">
                                <Banknote size={10} className="text-[#a1a1aa]" />
                                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e4e4e7', letterSpacing: '-0.02em' }}>
                                    {minSalaryFilter && maxSalaryFilter ? `${minSalaryFilter} - ${maxSalaryFilter}` :
                                        minSalaryFilter ? `${minSalaryFilter}+` :
                                            `Up to ${maxSalaryFilter}`}
                                </span>
                                <X size={10} className="ml-1 text-[#52525b] cursor-pointer hover:text-red-400 transition-colors" onClick={() => { setMinSalaryFilter(''); setMaxSalaryFilter(''); setLocalMinSalary(''); setLocalMaxSalary(''); }} />
                            </div>
                        )}
                    </div>

                    {/* Utility Section - Surgical Reset */}
                    <div className="pl-5 pr-1 border-l border-[#27272a]" style={{ marginLeft: '10px' }}>
                        <button
                            onClick={handleClearFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                borderRadius: '100px',
                                fontSize: '9px',
                                fontWeight: '900',
                                color: '#fca5a5',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <RefreshCcw size={10} strokeWidth={3} />
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'available' && (
                <section className="animate-fade-in">
                    <div className="elite-job-grid">
                        {availableJobs.map(job => (
                            <div key={job._id} className="card flex flex-col justify-between" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <div>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontWeight: '800', fontSize: '1.5rem', lineHeight: '1.2', color: '#f8fafc', margin: 0 }}>{job.title}</h3>
                                            {job.status === 'Closed' && <span style={{ fontSize: '0.65rem', fontWeight: '900', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Closed</span>}
                                        </div>
                                        <p style={{ fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', margin: 0 }}>{job.company}</p>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#e2e8f0', background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.85rem', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <MapPin size={14} color="#94a3b8" /> {job.location}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#e2e8f0', background: 'rgba(16, 185, 129, 0.05)', padding: '0.4rem 0.85rem', borderRadius: '2rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                            <Banknote size={14} color="#10b981" /> {job.salary}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
                                </div>
                                <button onClick={() => navigate(`/jobs/${job._id}`)} className="btn btn-secondary w-full" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>View Opportunity</button>
                            </div>
                        ))}
                        {availableJobs.length === 0 && <p className="text-muted col-span-full">No open positions found right now.</p>}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-muted">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Page
                            </button>
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'applied' && (
                <section className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FileText className="text-accent" /> My Applications</h2>
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ fontWeight: '500', color: '#94a3b8' }}>Job Title</div>
                            <div style={{ fontWeight: '500', color: '#94a3b8' }}>Applied On</div>
                            <div style={{ fontWeight: '500', color: '#94a3b8' }}>Status</div>
                            <div style={{ fontWeight: '500', color: '#94a3b8', textAlign: 'right' }}>Actions</div>
                        </div>

                        <div>
                            {applications.map(app => (
                                <div key={app._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', alignItems: 'center', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ fontWeight: '500' }}>
                                        {app.jobTitle || app.job?.title || 'Unknown Job'}
                                        {app.job?.company && <span style={{ color: '#94a3b8', fontWeight: 'normal', fontStyle: 'italic', marginLeft: '0.35rem' }}>at {app.job.company}</span>}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{new Date(app.createdAt).toLocaleDateString()}</div>
                                    <div>
                                        <span className={`badge ${app.status === 'Applied' ? 'badge-warning' : app.status === 'Offered' ? 'badge-success' : app.status === 'Interviewing' ? 'badge-warning' : app.status === 'Interview Conducted' ? 'badge-neutral' : app.status === 'Rejected' ? 'badge-error' : 'badge-success'}`}>
                                            {app.status === 'Interviewing' ? 'SCHEDULED' : app.status === 'Interview Conducted' ? 'CONDUCTED' : app.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                                        {app.status === 'Interviewing' && app.meetingLink && (
                                            isInterviewExpired(app.interviewDate) ? (
                                                <div className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.75rem', fontWeight: 'bold' }}>EXPIRED</div>
                                            ) : (
                                                <button
                                                    onClick={() => canJoinInterview(app.interviewDate) && navigate(`/interview/${app.meetingLink}`)}
                                                    disabled={!canJoinInterview(app.interviewDate)}
                                                    className="btn"
                                                    style={{
                                                        padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                                                        background: canJoinInterview(app.interviewDate) ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        color: canJoinInterview(app.interviewDate) ? 'white' : '#64748b',
                                                        borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold',
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

                                        <button onClick={() => setSelectedApp(app)} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid rgba(167, 139, 250, 0.5)', color: '#a78bfa', borderRadius: '0.375rem' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}>View</button>
                                        <button onClick={() => handleWithdrawApplication(app._id)} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', borderRadius: '0.375rem' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}>Withdraw</button>
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.2)', fontStyle: 'italic' }}>
                                    You haven't applied to any jobs yet.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
            {/* Confirmation Modal */}
            <EliteConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmWithdraw}
                title="Withdraw Application?"
                message="Are you sure you want to withdraw? This action is permanent and you may not be able to re-apply immediately."
                confirmText="Withdraw Now"
                type="danger"
            />
        </div>
    );
};

export default CandidateDashboard;

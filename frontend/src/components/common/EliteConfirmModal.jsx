import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const EliteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            padding: '1.5rem',
            backdropFilter: 'blur(12px)',
            animation: 'eliteFadeIn 0.3s ease'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '26rem',
                padding: '2rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '200px',
                    height: '200px',
                    background: type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                    filter: 'blur(100px)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '1.25rem',
                        background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        border: type === 'danger' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                        <AlertCircle size={32} color={type === 'danger' ? '#ef4444' : '#a78bfa'} />
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>{title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{message}</p>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                borderRadius: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: type === 'danger' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: type === 'danger' ? '0 10px 15px -3px rgba(239, 68, 68, 0.25)' : '0 10px 15px -3px rgba(139, 92, 246, 0.25)'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes eliteFadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EliteConfirmModal;

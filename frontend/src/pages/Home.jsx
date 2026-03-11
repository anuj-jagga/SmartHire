import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FastForward, CheckCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="home-container animate-fade-in">
            {/* Hero Section */}
            <section className="hero py-20 text-center flex flex-col items-center justify-center min-h-[70vh]">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl">
                    The Future of <span className="text-gradient">Hiring</span> is Here.
                </h1>
                <p className="text-xl text-muted mb-10 max-w-2xl">
                    SmartHire streamlines your recruitment process. Elevating the experience for top-tier candidates and HR professionals seeking elite talent.
                </p>
                <div className="flex gap-4">
                    <Link to="/register" className="btn btn-primary px-8 py-4 text-lg">Get Started</Link>
                    <Link to="/login" className="btn btn-secondary px-8 py-4 text-lg">Log In</Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="features py-20 grid md:grid-cols-3 gap-8">
                <Link to="/register" className="card text-center flex flex-col items-center hover:scale-105 transition-transform" style={{ textDecoration: 'none' }}>
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', width: '4rem', height: '4rem', display: 'flex', borderRadius: '9999px', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Briefcase size={32} />
                    </div>
                    <h3 className="text-3xl mb-4" style={{ color: 'var(--text-main)' }}>Smart Job Postings</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Create detailed job listings and reach thousands of qualified candidates instantly.</p>
                </Link>

                <Link to="/register" className="card text-center flex flex-col items-center hover:scale-105 transition-transform" style={{ textDecoration: 'none' }}>
                    <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', width: '4rem', height: '4rem', display: 'flex', borderRadius: '9999px', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <FastForward size={32} />
                    </div>
                    <h3 className="text-3xl mb-4" style={{ color: 'var(--text-main)' }}>Streamlined Applications</h3>
                    <p style={{ color: 'var(--text-muted)' }}>One-click apply and real-time application tracking for optimal efficiency.</p>
                </Link>

                <Link to="/register" className="card text-center flex flex-col items-center hover:scale-105 transition-transform" style={{ textDecoration: 'none' }}>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', width: '4rem', height: '4rem', display: 'flex', borderRadius: '9999px', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-3xl mb-4" style={{ color: 'var(--text-main)' }}>Automated Scheduling</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Seamlessly schedule interviews and manage candidate pipelines efficiently.</p>
                </Link>
            </section>
        </div>
    );
};

export default Home;

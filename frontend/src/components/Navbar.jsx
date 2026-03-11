import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Briefcase, LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar-container glass-panel">
            <div className="container flex items-center justify-between py-4">
                <Link to="/" className="logo flex items-center gap-2">
                    <Briefcase size={28} className="text-accent" />
                    <span className="text-xl font-bold text-gradient">SmartHire</span>
                </Link>

                <nav className="flex gap-6 items-center">
                    {user ? (
                        <>
                            <div className="user-menu flex items-center gap-4">
                                <Link to="/dashboard" className="nav-link font-medium">Dashboard</Link>
                                <div className="user-badge flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                        <User size={16} className="text-muted" />
                                    </div>
                                    <span className={`badge badge-role-${user.role.toLowerCase()}`}>{user.role}</span>
                                </div>
                                <button onClick={handleLogout} className="btn text-sm py-2 px-4 bg-slate-800/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-colors border border-transparent rounded-full flex items-center gap-2">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;

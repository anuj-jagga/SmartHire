import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Candidate'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/api/auth/register', formData);
            login(data, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] animate-fade-in py-10">
            <div className="card w-full max-w-md glass-panel relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p>Join SmartHire today</p>
                </div>

                {error && <div className="p-3 mb-6 rounded text-sm badge-error">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="input-label">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            autoComplete="name"
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="input-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="username"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="input-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <div>
                        <label className="input-label">I am a...</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                name="role"
                                className="input-field w-full"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ WebkitAppearance: 'none', appearance: 'none', paddingRight: '2.5rem' }}
                            >
                                <option value="Candidate" style={{ background: '#12121e' }}>Candidate</option>
                                <option value="HR" style={{ background: '#12121e' }}>HR Professional</option>
                                <option value="Admin" style={{ background: '#12121e' }}>Administrator</option>
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

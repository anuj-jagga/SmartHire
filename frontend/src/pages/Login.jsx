import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            login(data, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] animate-fade-in py-10">
            <div className="card w-full max-w-md glass-panel relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p>Log in to your account</p>
                </div>

                {error && <div className="p-3 mb-6 rounded text-sm badge-error">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="on">
                    <div>
                        <label htmlFor="loginEmail" className="input-label">Email Address</label>
                        <input
                            type="email"
                            id="loginEmail"
                            name="loginEmail"
                            autoComplete="username"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="loginPassword" className="input-label">Password</label>
                        <input
                            type="password"
                            id="loginPassword"
                            name="loginPassword"
                            autoComplete="current-password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="mt-8 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/home');
            } else {
                const errorText = await response.text();
                setError(errorText || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    {/* Logo/Brand */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{ 
                            fontSize: '3em', 
                            marginBottom: 'var(--spacing-md)',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}>
                            🧠
                        </div>
                        <h1 style={{ 
                            fontSize: 'var(--font-size-3xl)', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            QuizMaster
                        </h1>
                        <p style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-lg)'
                        }}>
                            Welcome back! Sign in to continue.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                            style={{ marginTop: 'var(--spacing-lg)' }}
                        >
                            {loading ? (
                                <>
                                    <div className="loading" style={{ width: '16px', height: '16px', marginRight: 'var(--spacing-sm)' }}></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: 'var(--spacing-xl)',
                        paddingTop: 'var(--spacing-lg)',
                        borderTop: '1px solid var(--border-light)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                            Don't have an account?
                        </p>
                        <Link 
                            to="/register"
                            style={{
                                color: 'var(--primary-600)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 'var(--font-size-lg)'
                            }}
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 
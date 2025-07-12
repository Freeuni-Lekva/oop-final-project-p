import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
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
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container auth-container-narrow fade-in">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ 
                    background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                    fontSize: 'var(--font-size-4xl)'
                }}>
                    🎯 QuizMaster
                </h1>
                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                    Welcome back! Sign in to continue your quiz journey.
                </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div style={{ width: '100%' }}>
                    <label htmlFor="username" style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: 'var(--gray-700)', 
                        fontWeight: '600',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ width: '100%' }}>
                    <label htmlFor="password" style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: 'var(--gray-700)', 
                        fontWeight: '600',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ width: '100%', marginTop: '8px' }}
                >
                    {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div className="loading" style={{ width: '16px', height: '16px' }}></div>
                            Signing in...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div style={{ 
                textAlign: 'center', 
                marginTop: '24px', 
                padding: '16px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)'
            }}>
                <p style={{ margin: '0 0 12px 0', color: 'var(--gray-600)' }}>
                    Don't have an account?
                </p>
                <button 
                    onClick={() => navigate('/register')} 
                    className="btn-outline"
                    style={{ fontSize: 'var(--font-size-sm)' }}
                >
                    Create Account
                </button>
            </div>
        </div>
    );
};

export default Login; 
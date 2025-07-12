import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed');
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
                    🎯 Join QuizMaster
                </h1>
                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                    Create your account and start creating amazing quizzes!
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
                        placeholder="Choose a username"
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
                        placeholder="Create a password"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ width: '100%' }}>
                    <label htmlFor="confirmPassword" style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: 'var(--gray-700)', 
                        fontWeight: '600',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
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
                            Creating account...
                        </div>
                    ) : (
                        'Create Account'
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
                    Already have an account?
                </p>
                <button 
                    onClick={() => navigate('/login')} 
                    className="btn-outline"
                    style={{ fontSize: 'var(--font-size-sm)' }}
                >
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default Register; 
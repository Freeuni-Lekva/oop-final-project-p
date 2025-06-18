import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                username,
                password
            });
            if (response.status === 200) {
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data || 'An error occurred during registration');
        }
    };

    return (
        <div className="auth-container">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account?{' '}
                <button className="auth-link" onClick={() => navigate('/login')}>Sign in here</button>
            </p>
        </div>
    );
};

export default Register; 
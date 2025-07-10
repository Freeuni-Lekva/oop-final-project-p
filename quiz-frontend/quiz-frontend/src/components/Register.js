import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Register";
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create form data to match Spring Security's form login
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('http://localhost:8081/auth/signup', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true // Important for session cookies
            });

            if (response.status === 200) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data || 'An error occurred during registration');
        }
    };

    return (
        <div className="auth-container">
            <img src={`${process.env.PUBLIC_URL}/AppLogo.png`} alt="Logo" width="120"/>
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
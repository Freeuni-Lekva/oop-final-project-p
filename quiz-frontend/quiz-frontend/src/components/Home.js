import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Home";

        // Fetch user welcome info
        fetch('http://localhost:8081/api/home', {
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Not authenticated or server error');
                return res.json();
            })
            .then((data) => {
                setMessage(data.message);
                setUsername(data.user);
            })
            .catch((err) => setError(err.message));

        // Fetch announcements
        fetch('http://localhost:8081/api/announcements')
            .then((res) => res.json())
            .then((data) => setAnnouncements(data))
            .catch((err) => console.error("Failed to fetch announcements:", err));
    }, []);

    return (
        <div className="auth-container">
            {error && <div className="auth-error">{error}</div>}
            <div className="main-box">
                <h1>{message || 'Welcome!'}</h1>
                {username && <p>Hello, <b>{username}</b>!</p>}
                {username && (
                    <button onClick={() => navigate('/create-quiz')} style={{ marginTop: '16px' }}>
                        Create a New Quiz
                    </button>
                )}
            </div>

            <div className="announcement-box">
                <h2>📣 Announcements</h2>
                {announcements.length === 0 ? (
                    <p>No announcements available.</p>
                ) : (
                    <ul>
                        {announcements.map((a) => (
                            <li key={a.id}>
                                <strong>{a.title}</strong><br/>
                                <span>{a.content}</span><br/>
                                <small>{new Date(a.createdAt).toLocaleString()}</small>
                                <hr/>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Home;

import React, { useEffect, useState } from 'react';
import FriendsModal from './FriendsModal';
import './Friends.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isFriendsModalOpen, setFriendsModalOpen] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Home";

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
                // Fetch achievements by username
                if (data.user) {
                    fetch(`http://localhost:8081/api/achievements/username/${data.user}`)
                        .then(res => res.json())
                        .then(setAchievements)
                        .catch(() => setAchievements([]));
                }
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
            {/* Achievements Section */}
            {achievements.length > 0 && (
                <div className="achievements-bar" style={{
                    display: 'flex',
                    gap: '18px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '24px 0 12px 0',
                    flexWrap: 'wrap',
                }}>
                    {achievements.map((ua) => (
                        <div key={ua.id} style={{ position: 'relative', display: 'inline-block' }}>
                            <span
                                style={{ fontSize: '2.2rem', cursor: 'pointer' }}
                                title={ua.achievement.description}
                            >
                                {/* Use emoji as fallback if no icon */}
                                {ua.achievement.icon || '🏆'}
                            </span>
                            <div style={{ fontSize: '0.9rem', color: '#2563eb', textAlign: 'center', marginTop: '2px' }}>
                                {ua.achievement.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="main-box">
                <h2>{message || 'Welcome!'}</h2>
                {username && <p>Hello, <b>{username}</b>!</p>}
            </div>

            <div className="announcement-box">
                <h3>📣 Announcements</h3>
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

            <button onClick={() => navigate('/quizzes')} style={{marginTop: '20px', marginRight: '10px'}}>Take a Quiz</button>
            <button onClick={() => navigate('/create-quiz')} style={{marginTop: '20px'}}>Create a Quiz</button>

            {/* Floating Friends Icon Button */}
            <button onClick={() => setFriendsModalOpen(true)} className="friends-icon-button">
                👥
            </button>

            {/* Friends Modal */}
            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setFriendsModalOpen(false)}
            />
        </div>
    );
};

export default Home;

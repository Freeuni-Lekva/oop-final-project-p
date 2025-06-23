import React, { useEffect, useState } from 'react';
import FriendsModal from './FriendsModal';
import MessagesModal from './MessagesModal';
import './Friends.css';

const Home = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isFriendsModalOpen, setFriendsModalOpen] = useState(false);
    const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);

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

            {/* Top-right floating icons */}
            <div className="top-right-icons">
                <button onClick={() => setMessagesModalOpen(true)} className="messages-icon-button" title="Messages">
                    💬
                </button>
                <button onClick={() => setFriendsModalOpen(true)} className="friends-icon-button" title="Friends">
                    👥
                </button>
            </div>

            {/* Friends Modal */}
            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setFriendsModalOpen(false)}
            />
            {/* Messages Modal */}
            <MessagesModal
                isOpen={isMessagesModalOpen}
                onClose={() => setMessagesModalOpen(false)}
            />
        </div>
    );
};

export default Home;

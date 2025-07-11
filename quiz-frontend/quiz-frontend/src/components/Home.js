import React, { useEffect, useState } from 'react';
import FriendsModal from './FriendsModal';
import MessagesModal from './MessagesModal';
import './Friends.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isFriendsModalOpen, setFriendsModalOpen] = useState(false);
    const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
    const [isSignOutModalOpen, setSignOutModalOpen] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [userId, setUserId] = useState(null);
    const [challengeScores, setChallengeScores] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Home";

        fetch('http://localhost:8081/api/home', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('Not authenticated or server error');
                return res.json();
            })
            .then((data) => {
                setMessage(data.message);
                setUsername(data.user);
                setRole(data.role);
                // Fetch userId
                if (data.user) {
                    fetch(`http://localhost:8081/api/auth/user/${data.user}`)
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to fetch user data');
                            return res.json();
                        })
                        .then(user => {
                            setUserId(user.id);
                            // Fetch challenges for this user
                            fetch(`http://localhost:8081/api/challenges/for-user/${data.user}`)
                                .then(res => {
                                    if (!res.ok) throw new Error('Failed to fetch challenges');
                                    return res.json();
                                })
                                .then(async (chals) => {
                                    if (!Array.isArray(chals)) {
                                        setChallenges([]);
                                        return;
                                    }
                                    setChallenges(chals);
                                    // For each challenge, fetch best score
                                    const scores = {};
                                    for (const chal of chals) {
                                        try {
                                            const res = await fetch(`http://localhost:8081/api/challenges/challenger-best-score/${chal.quiz.id}/${chal.challenger.username}`);
                                            if (res.ok) {
                                                const score = await res.json();
                                                scores[chal.id] = score;
                                            } else {
                                                scores[chal.id] = 0; // Default score if fetch fails
                                            }
                                        } catch (e) {
                                            scores[chal.id] = 0; // Default score if fetch fails
                                        }
                                    }
                                    setChallengeScores(scores);
                                })
                                .catch(err => {
                                    console.error('Challenges fetch error:', err);
                                    setChallenges([]);
                                });
                        })
                        .catch(err => {
                            console.error('User fetch error:', err);
                        });
                }
            })
            .catch((err) => setError(err.message));

        fetch('http://localhost:8081/api/announcements')
            .then((res) => res.json())
            .then((data) => setAnnouncements(data))
            .catch((err) => console.error("Failed to fetch announcements:", err));
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch('http://localhost:8081/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {}
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleShowStats = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/admin/statistics', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch statistics');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            setStats({ error: 'Failed to fetch statistics' });
        }
        setShowStats(true);
    };

    return (
        <div className="auth-container">
            {/* Top-left action bar */}
            <div style={{ position: 'fixed', top: 24, left: 32, display: 'flex', gap: 12, zIndex: 2000, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '6px 12px' }}>
                {role === 'ROLE_ADMIN' && (
                    <>
                        <button onClick={() => navigate('/admin')} style={{ background: '#312e81', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(49,46,129,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#4338ca'} onMouseOut={e => e.currentTarget.style.background='#312e81'}>Admin</button>
                        <button onClick={handleShowStats} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(13,148,136,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#14b8a6'} onMouseOut={e => e.currentTarget.style.background='#0d9488'}>Statistics</button>
                    </>
                )}
                <button onClick={() => setMessagesModalOpen(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#1d4ed8'} onMouseOut={e => e.currentTarget.style.background='#2563eb'}>Messages</button>
                <button onClick={() => setFriendsModalOpen(true)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(5,150,105,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#10b981'} onMouseOut={e => e.currentTarget.style.background='#059669'}>Friends</button>
                <button onClick={() => setSignOutModalOpen(true)} style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(225,29,72,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#be123c'} onMouseOut={e => e.currentTarget.style.background='#e11d48'}>Sign Out</button>
            </div>
            {/* Top-left sign out button for non-admins */}
            {role !== 'ROLE_ADMIN' && (
                <div className="top-left-signout">
                    <button className="signout-icon-button" onClick={() => setSignOutModalOpen(true)} title="Sign Out">
                        ⬅️
                    </button>
                </div>
            )}

            {/* Statistics Modal */}
            {showStats && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', position: 'relative' }}>
                        <button onClick={() => setShowStats(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
                        <h2 style={{ color: '#4f46e5', marginBottom: 18 }}>Site Statistics</h2>
                        {stats ? (
                            stats.error ? <div style={{ color: 'red' }}>{stats.error}</div> :
                                <ul style={{ fontSize: 18, lineHeight: 2 }}>
                                    <li><b>Users:</b> {stats.users}</li>
                                    <li><b>Quizzes:</b> {stats.quizzes}</li>
                                    <li><b>Quizzes Taken:</b> {stats.quizzesTaken}</li>
                                </ul>
                        ) : (
                            <div>Loading...</div>
                        )}
                    </div>
                </div>
            )}

            {/* Sign-out Modal */}
            {isSignOutModalOpen && (
                <div className="signout-modal-overlay">
                    <div className="signout-modal-content">
                        <h3>Sign Out?</h3>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                            <button onClick={() => setSignOutModalOpen(false)} className="cancel-signout-button">Cancel</button>
                            <button onClick={handleSignOut} className="confirm-signout-button">Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            {/* Challenge Notifications */}
            {challenges.length > 0 && (
                <div className="challenge-notifications" style={{ background: '#f0f4ff', border: '1px solid #b6d0ff', borderRadius: 8, padding: 16, marginBottom: 18 }}>
                    <h3>🎯 Challenges</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {challenges.map(chal => (
                            <li key={chal.id} style={{ marginBottom: 10 }}>
                                <b>{chal.challenger.username}</b> has challenged you to take <b>{chal.quiz.title}</b>!<br/>
                                Their best score: <b>{challengeScores[chal.id]}</b><br/>
                                <button className="quiz-btn quiz-btn-primary" style={{ marginTop: 4 }} onClick={() => navigate(`/quiz-summary/${chal.quiz.id}`)}>
                                    Go to Quiz
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="main-box">
                <h2>{message || 'Welcome!'}</h2>
                {username && <p>Hello, <b>{username}</b>!</p>}
                {username && (
                    <button
                        className="profile-button"
                        onClick={() => window.location.href = `/profile/${username}`}
                        style={{ marginBottom: '1rem' }}
                    >
                        My Profile
                    </button>
                )}
                {username && (
                    <button onClick={() => navigate('/create-quiz')} style={{ marginTop: '16px' }}>
                        Create a New Quiz
                    </button>
                )}
            </div>

            <div className="announcement-box">
                <h3>📣 Announcements</h3>
                {announcements.length === 0 ? (
                    <p>No announcements available.</p>
                ) : (
                    <ul>
                        {announcements.map((a) => (
                            <li key={a.id}>
                                <strong>{a.title}</strong><br />
                                <span>{a.content}</span><br />
                                <small>{new Date(a.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>
                                <hr />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Navigation Buttons */}
            <button onClick={() => navigate('/quizzes')} style={{marginTop: '20px', marginRight: '10px'}}>Browse Quizzes</button>
            <button onClick={() => navigate('/create-quiz')} style={{marginTop: '20px'}}>Create a Quiz</button>

            {/* Top-right floating icons for non-admins */}
            {role !== 'ROLE_ADMIN' && (
                <div className="top-right-icons">
                    <button onClick={() => setMessagesModalOpen(true)} className="messages-icon-button" title="Messages">
                        💬
                    </button>
                    <button onClick={() => setFriendsModalOpen(true)} className="friends-icon-button" title="Friends">
                        👥
                    </button>
                </div>
            )}

            {/* Modals */}
            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setFriendsModalOpen(false)}
            />
            <MessagesModal
                isOpen={isMessagesModalOpen}
                onClose={() => setMessagesModalOpen(false)}
            />
        </div>
    );
};

export default Home;
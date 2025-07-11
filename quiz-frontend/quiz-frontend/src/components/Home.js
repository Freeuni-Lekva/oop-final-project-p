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
                <button onClick={() => navigate(`/profile/${username}`)} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(124,58,237,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#8b5cf6'} onMouseOut={e => e.currentTarget.style.background='#7c3aed'}>My Profile</button>
                <button onClick={() => setMessagesModalOpen(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#1d4ed8'} onMouseOut={e => e.currentTarget.style.background='#2563eb'}>Messages</button>
                <button onClick={() => setFriendsModalOpen(true)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(5,150,105,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#10b981'} onMouseOut={e => e.currentTarget.style.background='#059669'}>Friends</button>
                <button onClick={() => setSignOutModalOpen(true)} style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(225,29,72,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#be123c'} onMouseOut={e => e.currentTarget.style.background='#e11d48'}>Sign Out</button>
            </div>

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
            {/* Remove any top-level or duplicate challenge notifications rendering */}
            {/* Only render challenges in the Challenges field below */}

            {/* Modern Homepage Soft Background Layout */}
            <div className="homepage-bg">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', margin: '32px 0 24px 0' }}>
                    <button
                        onClick={() => navigate('/create-quiz')}
                        style={{
                            background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px rgba(124,58,237,0.08)', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.01em'
                        }}
                        onMouseOver={e => e.currentTarget.style.background='#8b5cf6'}
                        onMouseOut={e => e.currentTarget.style.background='#7c3aed'}
                    >
                        + Create Quiz
                    </button>
                    <button
                        onClick={() => navigate('/quizzes')}
                        style={{
                            background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.01em'
                        }}
                        onMouseOver={e => e.currentTarget.style.background='#1d4ed8'}
                        onMouseOut={e => e.currentTarget.style.background='#2563eb'}
                    >
                        Browse Quizzes
                    </button>
                </div>
                <div className="homepage-vertical">
                    {/* Announcements Card */}
                    <div className="homepage-hcard homepage-announcements">
                        <h3 className="homepage-hcard-title">📢 Announcements</h3>
                        {announcements.length === 0 ? (
                            <div className="homepage-hcard-empty">No announcements available.</div>
                        ) : (
                            <ul className="homepage-hcard-list">
                                {announcements.map((a) => (
                                    <li key={a.id} className="homepage-hcard-listitem">
                                        <div className="homepage-hcard-listtitle">{a.title}</div>
                                        <div className="homepage-hcard-listcontent">{a.content}</div>
                                        <div className="homepage-hcard-listdate">{new Date(a.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Challenges Card */}
                    <div className="homepage-hcard homepage-challenges">
                        <h3 className="homepage-hcard-title">🎯 Challenges</h3>
                        {challenges.length === 0 ? (
                            <div className="homepage-hcard-empty">No challenges at the moment.</div>
                        ) : (
                            <ul className="homepage-hcard-list">
                                {challenges.map(chal => (
                                    <li key={chal.id} className="homepage-hcard-listitem">
                                        <span>
                                            <b><a href={`/profile/${chal.challenger.username}`} style={{color:'#2563eb',textDecoration:'underline'}}>{chal.challenger.username}</a></b> challenged you to <b><a href={`/quiz-summary/${chal.quiz.id}`} style={{color:'#2563eb',textDecoration:'underline'}}>{chal.quiz.title}</a></b>!
                                            <br/>
                                            Their best score: <b>{challengeScores[chal.id]}</b>
                                        </span>
                                        <span className="homepage-hcard-listlink" onClick={() => navigate(`/quiz-summary/${chal.quiz.id}`)} style={{color:'#2563eb', cursor:'pointer', marginLeft:8}}>Go to Quiz</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* History Card */}
                    <div className="homepage-hcard homepage-history">
                        <h3 className="homepage-hcard-title">🕑 History</h3>
                        {username ? (
                            <HistoryList username={username} />
                        ) : (
                            <div className="homepage-hcard-empty">Loading...</div>
                        )}
                    </div>
                    {/* Friends Card (placeholder) */}
                    <div className="homepage-hcard homepage-friends">
                        <h3 className="homepage-hcard-title">👥 Friends</h3>
                        <FriendsStatsList />
                    </div>
                    {/* Recent Quiz Creations Card (placeholder) */}
                    <div className="homepage-hcard homepage-creations">
                        <h3 className="homepage-hcard-title">📝 Recent Quiz Creations</h3>
                        {username ? (
                            <RecentCreationsList username={username} />
                        ) : (
                            <div className="homepage-hcard-empty">Loading...</div>
                        )}
                    </div>
                    {/* Popular Quizzes Card (placeholder) */}
                    <div className="homepage-hcard homepage-popular">
                        <h3 className="homepage-hcard-title">🌟 Popular Quizzes</h3>
                        <PopularQuizzesList />
                    </div>
                    {/* Achievements Card */}
                    <div className="homepage-hcard homepage-achievements">
                        <h3 className="homepage-hcard-title">🏅 Achievements</h3>
                        {username ? (
                            <AchievementsCard username={username} />
                        ) : (
                            <div className="homepage-hcard-empty">Loading...</div>
                        )}
                    </div>
                </div>
            </div>

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

function HistoryList({ username }) {
    const [quizHistory, setQuizHistory] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (!username) return;
        setLoading(true);
        fetch(`http://localhost:8081/api/users/${username}/quiz-history`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setQuizHistory(Array.isArray(data) ? data.slice(0, 10) : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [username]);
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    if (!quizHistory.length) return <div className="homepage-hcard-empty">No quiz history yet.</div>;
    return (
        <ul className="homepage-hcard-list">
            {quizHistory.map((q, idx) => (
                <li key={idx} className="homepage-hcard-listitem">
                    <div>
                        <b>
                            <a href={`/quiz-summary/${q.quizId}`} style={{color:'#2563eb',textDecoration:'underline'}}>{q.quizTitle}</a>
                        </b>
                    </div>
                    <div>Score: {q.score} / {q.totalQuestions} ({q.percentage ? q.percentage.toFixed(1) : 0}%)</div>
                    <div style={{fontSize:'0.95em',color:'#888'}}>Taken: {q.endTime ? new Date(q.endTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}</div>
                </li>
            ))}
        </ul>
    );
}

function RecentCreationsList({ username }) {
    const [quizzes, setQuizzes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (!username) return;
        setLoading(true);
        fetch('http://localhost:8081/api/quizzes', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                const userQuizzes = Array.isArray(data)
                    ? data.filter(q => q.createdBy === username)
                    : [];
                userQuizzes.sort((a, b) => new Date(b.createdAt || b.dateCreated) - new Date(a.createdAt || a.dateCreated));
                setQuizzes(userQuizzes.slice(0, 10));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [username]);
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    if (!quizzes.length) return <div className="homepage-hcard-empty">You haven't created any quizzes yet.</div>;
    return (
        <ul className="homepage-hcard-list">
            {quizzes.map((q, idx) => (
                <li key={q.id || idx} className="homepage-hcard-listitem">
                    <b>
                        <a href={`/quiz-summary/${q.id}`} style={{color:'#2563eb',textDecoration:'underline'}}>{q.title}</a>
                    </b><br/>
                    {q.createdAt && (
                        <span style={{fontSize:'0.95em',color:'#888'}}>
                            Created: {new Date(q.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

function PopularQuizzesList() {
    const [popular, setPopular] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/api/quizzes/popular', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setPopular(Array.isArray(data) ? data.slice(0, 5) : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    if (!popular.length) return <div className="homepage-hcard-empty">No popular quizzes yet.</div>;
    return (
        <ul className="homepage-hcard-list">
            {popular.map((item, idx) => (
                <li key={item.quiz.id || idx} className="homepage-hcard-listitem">
                    <b>
                        <a href={`/quiz-summary/${item.quiz.id}`} style={{color:'#2563eb',textDecoration:'underline'}}>{item.quiz.title}</a>
                    </b><br/>
                    <span style={{fontSize:'0.95em',color:'#888'}}>Attempts: {item.attemptCount}</span>
                </li>
            ))}
        </ul>
    );
}

function FriendsStatsList() {
    const [friends, setFriends] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/api/friends/stats', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setFriends(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    if (!friends.length) return <div className="homepage-hcard-empty">No friends yet.</div>;
    return (
        <ul className="homepage-hcard-list">
            {friends.map((f, idx) => (
                <li key={f.username || idx} className="homepage-hcard-listitem">
                    <b>
                        <a href={`/profile/${f.username}`} style={{color:'#2563eb',textDecoration:'underline'}}>{f.username}</a>
                    </b><br/>
                    <span style={{fontSize:'0.95em',color:'#888'}}>
                        Quizzes: {f.numQuizzes} taken | {f.numCreated} created | Avg: {f.avgPercent}%<br/>
                        {f.mostPopularQuizTitle && (
                            <span>Most popular: <b>{f.mostPopularQuizTitle}</b> ({f.mostPopularQuizAttempts} attempts)</span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function AchievementsCard({ username }) {
    const [achievements, setAchievements] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (!username) return;
        setLoading(true);
        fetch(`http://localhost:8081/api/users/${username}/achievements`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setAchievements(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [username]);
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    return (
        <>
            <div className="achievements-description">
                Earn achievements by creating quizzes, taking quizzes, and reaching top scores!
            </div>
            <div className="achievements-list">
                {achievements.map(a => (
                    <div key={a.key} className="achievement-with-desc">
                        <span className="icon-shortdesc">{a.shortDesc || a.description}</span>
                        <div className={`achievement-icon${a.earned ? '' : ' locked'}`}
                             title={a.description}
                             tabIndex={0}
                             aria-label={a.name + (a.earned ? '' : ' (locked)')}
                        >
                            <span className="icon-main">{a.icon}</span>
                            {!a.earned && <span className="icon-lock">🔒</span>}
                            <span className="icon-label">{a.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
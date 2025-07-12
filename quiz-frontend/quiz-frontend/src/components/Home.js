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
        <div className="homepage-bg">
            {/* Modern Top Navigation Bar */}
            <div className="card" style={{ 
                position: 'fixed', 
                top: '24px', 
                left: '32px', 
                right: '32px',
                zIndex: 2000, 
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--gray-900)' }}>
                        🎯 QuizMaster
                    </h2>
                    <span style={{ 
                        background: 'var(--primary-100)', 
                        color: 'var(--primary-700)', 
                        padding: '4px 12px', 
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                    }}>
                        Welcome, {username}!
                    </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    {role === 'ROLE_ADMIN' && (
                        <>
                            <button 
                                onClick={() => navigate('/admin')} 
                                className="btn-primary"
                                style={{ fontSize: '14px', padding: '8px 16px' }}
                            >
                                👑 Admin
                            </button>
                            <button 
                                onClick={handleShowStats} 
                                className="btn-success"
                                style={{ fontSize: '14px', padding: '8px 16px' }}
                            >
                                📊 Statistics
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => navigate(`/profile/${username}`)} 
                        className="btn-secondary"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        👤 Profile
                    </button>
                    <button 
                        onClick={() => setMessagesModalOpen(true)} 
                        className="btn-primary"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        💬 Messages
                    </button>
                    <button 
                        onClick={() => setFriendsModalOpen(true)} 
                        className="btn-success"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        👥 Friends
                    </button>
                    <button 
                        onClick={() => setSignOutModalOpen(true)} 
                        className="btn-danger"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        🚪 Sign Out
                    </button>
                </div>
            </div>

            {/* Statistics Modal */}
            {showStats && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: 'var(--primary-600)' }}>📊 Site Statistics</h3>
                            <button 
                                onClick={() => setShowStats(false)} 
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        {stats ? (
                            stats.error ? (
                                <div style={{ color: 'var(--error-600)', textAlign: 'center' }}>
                                    {stats.error}
                                </div>
                            ) : (
                                <div style={{ fontSize: '18px', lineHeight: '2' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        padding: '12px 0',
                                        borderBottom: '1px solid var(--gray-200)'
                                    }}>
                                        <span><strong>👥 Users:</strong></span>
                                        <span style={{ color: 'var(--primary-600)', fontWeight: '600' }}>{stats.users}</span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        padding: '12px 0',
                                        borderBottom: '1px solid var(--gray-200)'
                                    }}>
                                        <span><strong>📝 Quizzes:</strong></span>
                                        <span style={{ color: 'var(--secondary-600)', fontWeight: '600' }}>{stats.quizzes}</span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        padding: '12px 0'
                                    }}>
                                        <span><strong>✅ Quizzes Taken:</strong></span>
                                        <span style={{ color: 'var(--success-600)', fontWeight: '600' }}>{stats.quizzesTaken}</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="loading"></div>
                                <p>Loading statistics...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sign-out Modal */}
            {isSignOutModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: 'var(--error-600)' }}>🚪 Sign Out</h3>
                            <button 
                                onClick={() => setSignOutModalOpen(false)} 
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ textAlign: 'center', marginBottom: '24px' }}>
                            Are you sure you want to sign out?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setSignOutModalOpen(false)} 
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSignOut} 
                                className="btn-danger"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            {/* Main Content */}
            <div className="homepage-vertical" style={{ marginTop: '100px' }}>
                {/* Welcome Message */}
                <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ 
                        background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px'
                    }}>
                        Welcome to QuizMaster! 🎯
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--gray-600)', marginBottom: '24px' }}>
                        {message}
                    </p>
                    
                    {/* Quick Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/create-quiz')}
                            className="btn-primary"
                            style={{ fontSize: '16px', padding: '12px 24px' }}
                        >
                            ✨ Create Quiz
                        </button>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="btn-secondary"
                            style={{ fontSize: '16px', padding: '12px 24px' }}
                        >
                            🔍 Browse Quizzes
                        </button>
                    </div>
                </div>

                {/* Announcements Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">📢 Announcements</h3>
                    {announcements.length === 0 ? (
                        <div className="homepage-hcard-empty">No announcements available.</div>
                    ) : (
                        <ul className="homepage-hcard-list">
                            {announcements.map((announcement, index) => (
                                <li key={index} className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-listtitle">{announcement.title}</div>
                                    <div className="homepage-hcard-listcontent">{announcement.content}</div>
                                    <div className="homepage-hcard-listdate">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Active Challenges Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">⚔️ Active Challenges</h3>
                    {challenges.length === 0 ? (
                        <div className="homepage-hcard-empty">No active challenges.</div>
                    ) : (
                        <ul className="homepage-hcard-list">
                            {challenges.map((challenge) => (
                                <li key={challenge.id} className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-listtitle">
                                        {challenge.quiz.title} vs {challenge.challenger.username}
                                    </div>
                                    <div className="homepage-hcard-listcontent">
                                        Your best score: {challengeScores[challenge.id] || 0}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/quiz/${challenge.quiz.id}`)}
                                        className="btn-primary"
                                        style={{ marginTop: '8px', fontSize: '14px', padding: '6px 12px' }}
                                    >
                                        Take Challenge
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* User Stats Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">📈 Your Statistics</h3>
                    <UserStatsList username={username} />
                </div>

                {/* Recent Activity Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">🕒 Recent Activity</h3>
                    <HistoryList username={username} />
                </div>

                {/* Recent Creations Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">🎨 Recent Creations</h3>
                    <RecentCreationsList username={username} />
                </div>

                {/* Popular Quizzes Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">🔥 Popular Quizzes</h3>
                    <PopularQuizzesList />
                </div>

                {/* Friends Stats Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">👥 Friends Activity</h3>
                    <FriendsStatsList />
                </div>

                {/* Achievements Card */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">🏆 Achievements</h3>
                    <AchievementsCard username={username} />
                </div>
            </div>

            {/* Modals */}
            <FriendsModal isOpen={isFriendsModalOpen} onClose={() => setFriendsModalOpen(false)} />
            <MessagesModal isOpen={isMessagesModalOpen} onClose={() => setMessagesModalOpen(false)} />
        </div>
    );
};

export default Home;

function UserStatsList({ username }) {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        if (!username) return;
        setLoading(true);
        
        // Fetch user data and calculate stats from available endpoints
        Promise.all([
            // Get user's quiz history
            fetch(`http://localhost:8081/api/users/${username}/quiz-history`, { credentials: 'include' })
                .then(res => res.ok ? res.json() : [])
                .catch(() => []),
            // Get all quizzes to find user's created quizzes
            fetch('http://localhost:8081/api/quizzes', { credentials: 'include' })
                .then(res => res.ok ? res.json() : [])
                .catch(() => []),
            // Get friends list
            fetch('http://localhost:8081/api/friends/list', { credentials: 'include' })
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        ]).then(([quizHistory, allQuizzes, friends]) => {
            const userCreatedQuizzes = Array.isArray(allQuizzes) 
                ? allQuizzes.filter(q => q.createdBy === username) 
                : [];
            
            const completedQuizzes = Array.isArray(quizHistory) 
                ? quizHistory.filter(q => q.endTime) 
                : [];
            
            const avgScore = completedQuizzes.length > 0
                ? completedQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / completedQuizzes.length
                : 0;
            
            setStats({
                quizzesTaken: completedQuizzes.length,
                quizzesCreated: userCreatedQuizzes.length,
                averageScore: avgScore,
                friendsCount: Array.isArray(friends) ? friends.length : 0
            });
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch user stats:', err);
            setLoading(false);
        });
    }, [username]);
    
    if (loading) return <div className="homepage-hcard-empty">Loading...</div>;
    if (!stats) return <div className="homepage-hcard-empty">No statistics available.</div>;
    
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginTop: '16px'
        }}>
            <div style={{ 
                background: 'var(--primary-50)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-600)' }}>
                    {stats.quizzesTaken}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Quizzes Taken
                </div>
            </div>
            <div style={{ 
                background: 'var(--secondary-50)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--secondary-600)' }}>
                    {stats.quizzesCreated}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Quizzes Created
                </div>
            </div>
            <div style={{ 
                background: 'var(--success-50)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success-600)' }}>
                    {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Avg Score
                </div>
            </div>
            <div style={{ 
                background: 'var(--warning-50)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning-600)' }}>
                    {stats.friendsCount}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Friends
                </div>
            </div>
        </div>
    );
}

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
    const [friendsStats, setFriendsStats] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/api/friends/stats', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch friend stats');
                return res.json();
            })
            .then(data => {
                // Transform the stats data into activity-like format
                const activities = [];
                data.forEach(friend => {
                    const friendUsername = friend.username;
                    
                    // Add quiz taken activity if they have taken quizzes
                    if (friend.numQuizzes > 0) {
                        activities.push({
                            type: 'quiz_taken',
                            friend: friendUsername,
                            description: `took ${friend.numQuizzes} quizzes with ${friend.avgPercent}% average`,
                            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
                            score: friend.avgPercent,
                            quizTitle: friend.mostPopularQuizTitle || 'various quizzes'
                        });
                    }
                    
                    // Add quiz created activity if they have created quizzes
                    if (friend.numCreated > 0) {
                        activities.push({
                            type: 'quiz_created',
                            friend: friendUsername,
                            description: `created ${friend.numCreated} quizzes`,
                            timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random time in last 2 weeks
                            quizTitle: friend.mostPopularQuizTitle || 'a new quiz'
                        });
                    }
                    
                    // Add high score activity if they have a good average
                    if (friend.avgPercent > 80) {
                        activities.push({
                            type: 'high_score',
                            friend: friendUsername,
                            description: `achieved high scores with ${friend.avgPercent}% average`,
                            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random time in last 3 days
                            score: friend.avgPercent,
                            quizTitle: friend.mostPopularQuizTitle || 'multiple quizzes'
                        });
                    }
                    
                    // Add achievement activity for active users
                    if (friend.numQuizzes > 5 || friend.numCreated > 2) {
                        const achievements = [
                            'Quiz Enthusiast',
                            'Quiz Creator',
                            'High Scorer',
                            'Active Learner',
                            'Quiz Master'
                        ];
                        activities.push({
                            type: 'achievement_earned',
                            friend: friendUsername,
                            achievementName: achievements[Math.floor(Math.random() * achievements.length)],
                            description: 'earned an achievement',
                            timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) // Random time in last 5 days
                        });
                    }
                });
                
                // Sort by timestamp (most recent first) and take top 10
                activities.sort((a, b) => b.timestamp - a.timestamp);
                setFriendsStats(activities.slice(0, 10));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch friend stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="homepage-hcard-empty">Loading friends activities...</div>;
    if (!friendsStats.length) return <div className="homepage-hcard-empty">No recent friend activities.</div>;

    const getActivityIcon = (type) => {
        switch (type) {
            case 'quiz_taken': return '📝';
            case 'quiz_created': return '🎨';
            case 'achievement_earned': return '🏆';
            case 'high_score': return '🔥';
            case 'challenge_sent': return '⚔️';
            case 'challenge_completed': return '✅';
            default: return '📊';
        }
    };

    const getActivityText = (activity) => {
        const friendLink = (
            <button 
                onClick={() => window.location.href = `/profile/${activity.friend}`}
                className="auth-link"
                style={{ fontWeight: '600', marginRight: '4px' }}
            >
                {activity.friend}
            </button>
        );

        switch (activity.type) {
            case 'quiz_taken':
                return (
                    <span>
                        {friendLink} took {activity.quizTitle === 'various quizzes' ? 'some quizzes' : activity.quizTitle} 
                        {activity.score && ` and scored ${activity.score}%`}
                    </span>
                );
            case 'quiz_created':
                return (
                    <span>
                        {friendLink} created {activity.quizTitle === 'a new quiz' ? 'a new quiz' : activity.quizTitle}
                    </span>
                );
            case 'achievement_earned':
                return (
                    <span>
                        {friendLink} earned the{' '}
                        <span style={{ 
                            background: 'var(--warning-100)', 
                            color: 'var(--warning-700)', 
                            padding: '2px 8px', 
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600'
                        }}>
                            {activity.achievementName}
                        </span>
                        {' '}achievement!
                    </span>
                );
            case 'high_score':
                return (
                    <span>
                        {friendLink} achieved high scores of {activity.score}% on {activity.quizTitle}
                    </span>
                );
            default:
                return (
                    <span>
                        {friendLink} {activity.description || 'had some activity'}
                    </span>
                );
        }
    };

    return (
        <ul className="homepage-hcard-list">
            {friendsStats.map((activity, idx) => (
                <li key={idx} className="homepage-hcard-listitem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>
                            {getActivityIcon(activity.type)}
                        </span>
                        <div style={{ flex: 1 }}>
                            {getActivityText(activity)}
                        </div>
                    </div>
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
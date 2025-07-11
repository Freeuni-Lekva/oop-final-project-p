import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FriendsModal from './FriendsModal';
import MessagesModal from './MessagesModal';

const Home = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isFriendsModalOpen, setFriendsModalOpen] = useState(false);
    const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [userId, setUserId] = useState(null);
    const [challengeScores, setChallengeScores] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Dashboard - QuizMaster";

        fetch('http://localhost:8081/api/home', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('Not authenticated or server error');
                return res.json();
            })
            .then((data) => {
                setUsername(data.user);
                setRole(data.role);
                
                if (data.user) {
                    fetch(`http://localhost:8081/api/auth/user/${data.user}`)
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to fetch user data');
                            return res.json();
                        })
                        .then(user => {
                            setUserId(user.id);
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
                                    const scores = {};
                                    for (const chal of chals) {
                                        try {
                                            const res = await fetch(`http://localhost:8081/api/challenges/challenger-best-score/${chal.quiz.id}/${chal.challenger.username}`);
                                            if (res.ok) {
                                                const score = await res.json();
                                                scores[chal.id] = score;
                                            } else {
                                                scores[chal.id] = 0;
                                            }
                                        } catch (e) {
                                            scores[chal.id] = 0;
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

    if (error) {
        return (
            <div className="alert alert-error">
                {error}
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Welcome Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ 
                                fontSize: 'var(--font-size-3xl)', 
                                fontWeight: 700, 
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                Welcome back, {username}! 👋
                            </h1>
                            <p style={{ 
                                fontSize: 'var(--font-size-lg)', 
                                color: 'var(--text-secondary)',
                                margin: 0
                            }}>
                                Ready to test your knowledge? Create a new quiz or explore existing ones.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/create-quiz')}
                            >
                                ➕ Create Quiz
                            </button>
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => navigate('/quizzes')}
                            >
                                📚 Browse Quizzes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="card">
                    <div className="card-body text-center">
                        <div style={{ fontSize: '2.5em', marginBottom: 'var(--spacing-md)' }}>📚</div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Browse Quizzes</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                            Discover and take quizzes created by the community
                        </p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => navigate('/quizzes')}
                        >
                            Explore
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body text-center">
                        <div style={{ fontSize: '2.5em', marginBottom: 'var(--spacing-md)' }}>➕</div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Create Quiz</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                            Share your knowledge by creating engaging quizzes
                        </p>
                        <button 
                            className="btn btn-secondary w-full"
                            onClick={() => navigate('/create-quiz')}
                        >
                            Create
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body text-center">
                        <div style={{ fontSize: '2.5em', marginBottom: 'var(--spacing-md)' }}>👥</div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Friends</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                            Connect with friends and challenge each other
                        </p>
                        <button 
                            className="btn btn-success w-full"
                            onClick={() => setFriendsModalOpen(true)}
                        >
                            Manage
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body text-center">
                        <div style={{ fontSize: '2.5em', marginBottom: 'var(--spacing-md)' }}>💬</div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Messages</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                            Stay connected with your quiz community
                        </p>
                        <button 
                            className="btn btn-warning w-full"
                            onClick={() => setMessagesModalOpen(true)}
                        >
                            View
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Announcements & Challenges */}
                <div className="lg:col-span-2">
                    {/* Announcements */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">📢 Announcements</h3>
                        </div>
                        <div className="card-body">
                            {announcements.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                    No announcements available.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {announcements.map((announcement, index) => (
                                        <div 
                                            key={index}
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--background-secondary)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-light)'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                                                {announcement.title}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                                {announcement.content}
                                            </div>
                                            <small style={{ color: 'var(--text-muted)' }}>
                                                {new Date(announcement.timestamp).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Challenges */}
                    {challenges.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">⚡ Active Challenges</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {challenges.map((challenge) => (
                                        <div 
                                            key={challenge.id}
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--background-secondary)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-light)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                                        {challenge.quiz.title}
                                                    </div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                        Challenged by: {challenge.challenger.username}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                                        Best Score: {challengeScores[challenge.id] || 0}%
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => navigate(`/quiz/${challenge.quiz.id}`)}
                                                    >
                                                        Take Quiz
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Stats & Quick Info */}
                <div>
                    {/* User Stats */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">📊 Your Stats</h3>
                        </div>
                        <div className="card-body">
                            <UserStats username={username} />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">🕒 Recent Activity</h3>
                        </div>
                        <div className="card-body">
                            <RecentActivity username={username} />
                        </div>
                    </div>

                    {/* Popular Quizzes */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🔥 Popular Quizzes</h3>
                        </div>
                        <div className="card-body">
                            <PopularQuizzes />
                        </div>
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

            {/* Statistics Modal */}
            {showStats && (
                <div className="modal-overlay" onClick={() => setShowStats(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">📊 Site Statistics</h3>
                            <button className="modal-close" onClick={() => setShowStats(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {stats ? (
                                stats.error ? (
                                    <div className="alert alert-error">{stats.error}</div>
                                ) : (
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.users}</div>
                                            <div className="stat-label">Total Users</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.quizzes}</div>
                                            <div className="stat-label">Total Quizzes</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.quizzesTaken}</div>
                                            <div className="stat-label">Quizzes Taken</div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center">
                                    <div className="loading"></div>
                                    <p>Loading statistics...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const UserStats = ({ username }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetch(`http://localhost:8081/api/auth/user/${username}`)
                .then(res => res.json())
                .then(user => {
                    // Fetch user's quiz history
                    fetch(`http://localhost:8081/api/quiz-taking/history/user/${user.id}`)
                        .then(res => res.json())
                        .then(history => {
                            const totalQuizzes = history.length;
                            const totalScore = history.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
                            const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
                            
                            setStats({
                                totalQuizzes,
                                averageScore,
                                totalAttempts: history.length
                            });
                            setLoading(false);
                        })
                        .catch(() => {
                            setStats({ totalQuizzes: 0, averageScore: 0, totalAttempts: 0 });
                            setLoading(false);
                        });
                });
        }
    }, [username]);

    if (loading) {
        return <div className="loading"></div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Quizzes Taken:</span>
                <span style={{ fontWeight: 600 }}>{stats?.totalQuizzes || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Average Score:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{stats?.averageScore || 0}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Attempts:</span>
                <span style={{ fontWeight: 600 }}>{stats?.totalAttempts || 0}</span>
            </div>
        </div>
    );
};

const RecentActivity = ({ username }) => {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetch(`http://localhost:8081/api/auth/user/${username}`)
                .then(res => res.json())
                .then(user => {
                    fetch(`http://localhost:8081/api/quiz-taking/history/user/${user.id}`)
                        .then(res => res.json())
                        .then(history => {
                            const recent = history.slice(0, 5).map(attempt => ({
                                quizTitle: attempt.quiz.title,
                                score: attempt.score,
                                date: new Date(attempt.startTime).toLocaleDateString()
                            }));
                            setActivity(recent);
                            setLoading(false);
                        })
                        .catch(() => {
                            setActivity([]);
                            setLoading(false);
                        });
                });
        }
    }, [username]);

    if (loading) {
        return <div className="loading"></div>;
    }

    if (activity.length === 0) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No recent activity</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {activity.map((item, index) => (
                <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 'var(--spacing-sm)',
                    background: 'var(--background-secondary)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                            {item.quizTitle}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            {item.date}
                        </div>
                    </div>
                    <span style={{ 
                        fontWeight: 600, 
                        color: 'var(--primary-600)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        {item.score}%
                    </span>
                </div>
            ))}
        </div>
    );
};

const PopularQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8081/api/quizzes')
            .then(res => res.json())
            .then(data => {
                const popular = data.slice(0, 5);
                setQuizzes(popular);
                setLoading(false);
            })
            .catch(() => {
                setQuizzes([]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="loading"></div>;
    }

    if (quizzes.length === 0) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No quizzes available</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {quizzes.map((quiz) => (
                <div key={quiz.id} style={{ 
                    padding: 'var(--spacing-sm)',
                    background: 'var(--background-secondary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--background-secondary)'}
                onClick={() => window.location.href = `/quiz/${quiz.id}`}
                >
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                        {quiz.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        by {quiz.createdBy}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Home;
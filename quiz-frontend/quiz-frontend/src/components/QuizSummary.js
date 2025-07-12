import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuizSummary = () => {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [topScores, setTopScores] = useState([]);
    const [recentScores, setRecentScores] = useState([]);
    const [stats, setStats] = useState(null);
    const [sortBy, setSortBy] = useState('date');
    const [isOwner, setIsOwner] = useState(false);
    const [creatorId, setCreatorId] = useState(null);
    const [currentUsername, setCurrentUsername] = useState('');
    const [isChallengeModalOpen, setChallengeModalOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState('');
    const [challenging, setChallenging] = useState(false);
    const [topScoresToday, setTopScoresToday] = useState([]);
    const [clearingHistory, setClearingHistory] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8081/api/quizzes/${quizId}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load quiz.');
                return res.json();
            })
            .then(async (quizData) => {
                setQuiz(quizData);
                // Fetch creator ID for hotlink
                if (quizData.createdBy) {
                    const creatorRes = await fetch(`http://localhost:8081/api/auth/user/${quizData.createdBy}`);
                    if (creatorRes.ok) {
                        const creator = await creatorRes.json();
                        setCreatorId(creator.id);
                    }
                }
                // Fetch current user ID and username
                const homeRes = await fetch('http://localhost:8081/api/home', { credentials: 'include' });
                if (homeRes.ok) {
                    const homeData = await homeRes.json();
                    if (homeData.user) {
                        setCurrentUsername(homeData.user);
                        // Check if user is admin
                        if (homeData.role && homeData.role.includes('ROLE_ADMIN')) {
                            setIsAdmin(true);
                        }
                        const userRes = await fetch(`http://localhost:8081/api/auth/user/${homeData.user}`);
                        if (userRes.ok) {
                            const user = await userRes.json();
                            setUserId(user.id);
                            // Fetch user history for this quiz
                            fetch(`http://localhost:8081/api/quiz-taking/history/user/${user.id}/quiz/${quizId}`)
                                .then(res => {
                                    if (!res.ok) throw new Error('Failed to fetch user history');
                                    return res.json();
                                })
                                .then(data => setUserHistory(Array.isArray(data) ? data : []))
                                .catch(err => {
                                    console.error('User history fetch error:', err);
                                    setUserHistory([]);
                                });
                        }
                    }
                }
                // Fetch top scores (all time)
                fetch(`http://localhost:8081/api/quiz-taking/top-scores/${quizId}?limit=5`)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch top scores');
                        return res.json();
                    })
                    .then(data => setTopScores(Array.isArray(data) ? data : []))
                    .catch(err => {
                        console.error('Top scores fetch error:', err);
                        setTopScores([]);
                    });
                // Fetch top scores today
                fetch(`http://localhost:8081/api/quiz-taking/top-scores-today/${quizId}?limit=5`)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch top scores today');
                        return res.json();
                    })
                    .then(data => setTopScoresToday(Array.isArray(data) ? data : []))
                    .catch(err => {
                        console.error('Top scores today fetch error:', err);
                        setTopScoresToday([]);
                    });
                // Fetch recent attempts (last 15 min)
                fetch(`http://localhost:8081/api/quiz-taking/recent/${quizId}?limit=5`)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch recent attempts');
                        return res.json();
                    })
                    .then(data => setRecentScores(Array.isArray(data) ? data : []))
                    .catch(err => {
                        console.error('Recent attempts fetch error:', err);
                        setRecentScores([]);
                    });
                // Fetch stats
                fetch(`http://localhost:8081/api/quiz-taking/statistics/${quizId}`)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch statistics');
                        return res.json();
                    })
                    .then(setStats)
                    .catch(err => {
                        console.error('Statistics fetch error:', err);
                        setStats(null);
                    });
            })
            .catch(() => setError('Failed to load quiz.'));
    }, [quizId]);

    useEffect(() => {
        if (quiz && userId && quiz.createdBy && quiz.createdBy === currentUsername) {
            setIsOwner(true);
        }
    }, [quiz, userId, currentUsername]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const response = await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Quiz deleted successfully!');
            navigate('/quizzes');
        } catch (err) {
            alert('Failed to delete quiz: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteHistory = async () => {
        if (!window.confirm('Are you sure you want to delete all history for this quiz? This will remove all attempts, but the quiz will remain available.')) return;
        setClearingHistory(true);
        try {
            const response = await fetch(`http://localhost:8081/api/quizzes/${quizId}/clear-history`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Quiz history cleared successfully!');
        } catch (err) {
            alert('Failed to clear quiz history: ' + err.message);
        } finally {
            setClearingHistory(false);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/friends/list', {
                credentials: 'include'
            });
            if (response.ok) {
                const friendsData = await response.json();
                setFriends(Array.isArray(friendsData) ? friendsData : []);
            }
        } catch (err) {
            console.error('Failed to fetch friends:', err);
            setFriends([]);
        }
    };

    const handleChallengeFriend = async () => {
        if (!selectedFriend) {
            alert('Please select a friend to challenge');
            return;
        }

        setChallenging(true);
        try {
            const response = await fetch('http://localhost:8081/api/challenges/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    challengerUsername: currentUsername,
                    challengedUsername: selectedFriend,
                    quizId: quizId
                })
            });

            if (response.ok) {
                alert('Challenge sent successfully!');
                setChallengeModalOpen(false);
                setSelectedFriend('');
            } else {
                const errorText = await response.text();
                alert('Failed to send challenge: ' + errorText);
            }
        } catch (err) {
            alert('Failed to send challenge: ' + err.message);
        } finally {
            setChallenging(false);
        }
    };

    if (error) {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div className="auth-error">{error}</div>
                <button onClick={() => navigate('/quizzes')} className="btn-primary">
                    Back to Quizzes
                </button>
            </div>
        );
    }
    
    if (!quiz) {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div className="loading" style={{ width: '40px', height: '40px', margin: '20px auto' }}></div>
                <p>Loading quiz details...</p>
            </div>
        );
    }

    return (
        <div className="homepage-bg">
            {/* Header */}
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
                        📊 Quiz Summary
                    </h2>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => navigate('/quizzes')} 
                        className="btn-outline"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        🔍 All Quizzes
                    </button>
                    <button 
                        onClick={() => navigate('/home')} 
                        className="btn-outline"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        🏠 Home
                    </button>
                </div>
            </div>

            <div className="homepage-vertical" style={{ marginTop: '100px' }}>
                {/* Quiz Header */}
                <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ 
                        background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px',
                        fontSize: 'var(--font-size-3xl)'
                    }}>
                        {quiz.title}
                    </h1>
                    <p style={{ 
                        color: 'var(--gray-600)', 
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: '16px'
                    }}>
                        {quiz.description || 'No description available.'}
                    </p>
                    <div style={{ 
                        color: 'var(--gray-500)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        Created by: {quiz.createdBy ? (
                            <button 
                                onClick={() => navigate(`/profile/${quiz.createdBy}`)}
                                className="auth-link"
                                style={{ marginLeft: '4px' }}
                            >
                                {quiz.createdBy}
                            </button>
                        ) : (
                            <span style={{ marginLeft: '4px' }}>Unknown</span>
                        )}
                    </div>
                </div>

                {/* Statistics Overview */}
                {stats && (
                    <div className="homepage-hcard">
                        <h3 className="homepage-hcard-title">📈 Quiz Statistics</h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginTop: '16px'
                        }}>
                            <div style={{ 
                                background: 'var(--primary-50)', 
                                padding: '16px', 
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-600)' }}>
                                    {stats.averageScore}%
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Average Score
                                </div>
                            </div>
                            <div style={{ 
                                background: 'var(--secondary-50)', 
                                padding: '16px', 
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--secondary-600)' }}>
                                    {stats.averageTime} min
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Average Time
                                </div>
                            </div>
                            <div style={{ 
                                background: 'var(--success-50)', 
                                padding: '16px', 
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>
                                    {stats.totalAttempts}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Total Attempts
                                </div>
                            </div>
                            <div style={{ 
                                background: 'var(--warning-50)', 
                                padding: '16px', 
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-600)' }}>
                                    {stats.highestScore}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Highest Score
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Your Performance */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">📊 Your Performance</h3>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="sortBy" style={{ 
                            color: 'var(--gray-700)', 
                            fontWeight: '600',
                            fontSize: 'var(--font-size-sm)',
                            marginRight: '8px'
                        }}>
                            Sort by:
                        </label>
                        <select 
                            id="sortBy"
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)}
                            style={{ 
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--gray-300)',
                                fontSize: 'var(--font-size-sm)'
                            }}
                        >
                            <option value="date">Date</option>
                            <option value="percent">Score</option>
                            <option value="time">Time</option>
                        </select>
                    </div>
                    <ul className="homepage-hcard-list">
                        {(Array.isArray(userHistory) ? userHistory : []).sort((a, b) => {
                            if (sortBy === 'percent') return b.percentage - a.percentage;
                            if (sortBy === 'time') return (a.timeTakenMinutes || 0) - (b.timeTakenMinutes || 0);
                            return new Date(b.startTime) - new Date(a.startTime);
                        }).map((attempt, i) => (
                            <li key={attempt.id} className="homepage-hcard-listitem">
                                <div className="homepage-hcard-listtitle">
                                    {new Date(attempt.startTime).toLocaleString()}
                                </div>
                                <div className="homepage-hcard-listcontent">
                                    Score: {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                                </div>
                                <div className="homepage-hcard-listdate">
                                    Time: {attempt.timeTakenMinutes !== null ? attempt.timeTakenMinutes : 'N/A'} min
                                </div>
                            </li>
                        ))}
                        {(!Array.isArray(userHistory) || userHistory.length === 0) && (
                            <li className="homepage-hcard-listitem">
                                <div className="homepage-hcard-empty">No previous attempts</div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Top Performers */}
                <div className="homepage-grid">
                    <div className="homepage-hcard">
                        <h3 className="homepage-hcard-title">🏆 Top Performers (All Time)</h3>
                        <ul className="homepage-hcard-list">
                            {(Array.isArray(topScores) ? topScores : []).map((attempt, i) => (
                                <li key={attempt.id} className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-listtitle">
                                        #{i + 1} {attempt.username || 'User'}
                                    </div>
                                    <div className="homepage-hcard-listcontent">
                                        {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                                    </div>
                                </li>
                            ))}
                            {(!Array.isArray(topScores) || topScores.length === 0) && (
                                <li className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-empty">No attempts yet</div>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="homepage-hcard">
                        <h3 className="homepage-hcard-title">🔥 Top Performers (Today)</h3>
                        <ul className="homepage-hcard-list">
                            {(Array.isArray(topScoresToday) ? topScoresToday : []).map((attempt, i) => (
                                <li key={attempt.id} className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-listtitle">
                                        #{i + 1} {attempt.username || 'User'}
                                    </div>
                                    <div className="homepage-hcard-listcontent">
                                        {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                                    </div>
                                </li>
                            ))}
                            {(!Array.isArray(topScoresToday) || topScoresToday.length === 0) && (
                                <li className="homepage-hcard-listitem">
                                    <div className="homepage-hcard-empty">No attempts today</div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="homepage-hcard">
                    <h3 className="homepage-hcard-title">🕒 Recent Activity</h3>
                    <ul className="homepage-hcard-list">
                        {(Array.isArray(recentScores) ? recentScores : []).map((attempt, i) => (
                            <li key={attempt.id} className="homepage-hcard-listitem">
                                <div className="homepage-hcard-listtitle">
                                    {attempt.username || 'User'}
                                </div>
                                <div className="homepage-hcard-listcontent">
                                    {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                                </div>
                                <div className="homepage-hcard-listdate">
                                    {attempt.timeTakenMinutes !== null ? attempt.timeTakenMinutes : 'N/A'} min ago
                                </div>
                            </li>
                        ))}
                        {(!Array.isArray(recentScores) || recentScores.length === 0) && (
                            <li className="homepage-hcard-listitem">
                                <div className="homepage-hcard-empty">No recent attempts</div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                            className="btn-primary"
                            style={{ fontSize: '16px', padding: '12px 24px' }}
                        >
                            🚀 Start Quiz
                        </button>
                        {quiz.practiceMode && (
                            <button 
                                onClick={() => navigate(`/quiz/${quiz.id}?practice=true`)}
                                className="btn-secondary"
                                style={{ fontSize: '16px', padding: '12px 24px' }}
                            >
                                🎯 Practice Mode
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                fetchFriends();
                                setChallengeModalOpen(true);
                            }}
                            className="btn-success"
                            style={{ fontSize: '16px', padding: '12px 24px' }}
                        >
                            ⚔️ Challenge Friend
                        </button>
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="btn-danger"
                                    style={{ fontSize: '16px', padding: '12px 24px' }}
                                >
                                    {deleting ? '🗑️ Deleting...' : '🗑️ Delete Quiz'}
                                </button>
                                <button 
                                    onClick={handleDeleteHistory}
                                    disabled={clearingHistory}
                                    className="btn-warning"
                                    style={{ fontSize: '16px', padding: '12px 24px' }}
                                >
                                    {clearingHistory ? '🧹 Clearing...' : '🧹 Clear History'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Challenge Modal */}
            {isChallengeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: 'var(--success-600)' }}>⚔️ Challenge a Friend</h3>
                            <button 
                                onClick={() => setChallengeModalOpen(false)} 
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>
                            Select a friend to challenge to take this quiz:
                        </p>
                        <select
                            value={selectedFriend}
                            onChange={(e) => setSelectedFriend(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                marginBottom: '16px',
                                borderRadius: 'var(--radius-lg)',
                                border: '2px solid var(--gray-200)',
                                fontSize: 'var(--font-size-base)'
                            }}
                        >
                            <option value="">Select a friend...</option>
                            {friends.map(friend => (
                                <option key={friend} value={friend}>
                                    {friend}
                                </option>
                            ))}
                        </select>
                        {friends.length === 0 && (
                            <p style={{ 
                                color: 'var(--gray-500)', 
                                fontSize: 'var(--font-size-sm)', 
                                fontStyle: 'italic',
                                marginBottom: '16px'
                            }}>
                                No friends found. Add some friends first!
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setChallengeModalOpen(false)}
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChallengeFriend}
                                disabled={challenging || !selectedFriend}
                                className="btn-success"
                            >
                                {challenging ? 'Sending...' : 'Send Challenge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizSummary;
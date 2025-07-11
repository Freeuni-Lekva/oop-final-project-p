import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

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

    const fetchFriends = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/friends/list/${currentUsername}`, {
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

    if (error) return <div>{error}</div>;
    if (!quiz) return <div>Loading...</div>;

    return (
        <div className="quiz-summary-container">
            <div className="quiz-summary-header">
                <div className="quiz-summary-title">{quiz.title}</div>
                <div className="quiz-summary-meta">{quiz.description}</div>
                <div className="quiz-summary-meta">
                    Created by: {creatorId ? (
                    <a href={`/user/${creatorId}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{quiz.createdBy}</a>
                ) : (
                    <b>{quiz.createdBy || 'Unknown'}</b>
                )}
                </div>
            </div>
            {/* Stats */}
            {stats && (
                <div className="quiz-summary-meta" style={{ marginBottom: 16 }}>
                    <b>Stats:</b> Avg Score: {stats.averageScore}%, Avg Time: {stats.averageTime} min, Attempts: {stats.totalAttempts}, Highest Score: {stats.highestScore}
                </div>
            )}
            {/* User History */}
            <div className="quiz-summary-section">
                <h4>Your Past Performance</h4>
                <div style={{ margin: '8px 0' }}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <option value="date">Date</option>
                        <option value="percent">Percent Correct</option>
                        <option value="time">Time Taken</option>
                    </select>
                </div>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(userHistory) ? userHistory : []).sort((a, b) => {
                        if (sortBy === 'percent') return b.percentage - a.percentage;
                        if (sortBy === 'time') return (a.timeTakenMinutes || 0) - (b.timeTakenMinutes || 0);
                        return new Date(b.startTime) - new Date(a.startTime);
                    }).map((attempt, i) => (
                        <li key={attempt.id} style={{ marginBottom: 6 }}>
                            {new Date(attempt.startTime).toLocaleString()} — {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%) — {attempt.timeTakenMinutes !== null ? attempt.timeTakenMinutes : 'N/A'} min
                        </li>
                    ))}
                    {(!Array.isArray(userHistory) || userHistory.length === 0) && (
                        <li style={{ color: '#666', fontStyle: 'italic' }}>No previous attempts</li>
                    )}
                </ul>
            </div>
            {/* Top Performers (All Time) */}
            <div className="quiz-summary-section">
                <h4>Top Performers (All Time)</h4>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(topScores) ? topScores : []).map((attempt, i) => (
                        <li key={attempt.id}>
                            {attempt.user?.username || 'User'}: {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                        </li>
                    ))}
                    {(!Array.isArray(topScores) || topScores.length === 0) && (
                        <li style={{ color: '#666', fontStyle: 'italic' }}>No attempts yet</li>
                    )}
                </ul>
            </div>
            {/* Top Performers (Today) */}
            <div className="quiz-summary-section">
                <h4>Top Performers (Today)</h4>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(topScoresToday) ? topScoresToday : []).map((attempt, i) => (
                        <li key={attempt.id}>
                            {attempt.user?.username || 'User'}: {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%)
                        </li>
                    ))}
                    {(!Array.isArray(topScoresToday) || topScoresToday.length === 0) && (
                        <li style={{ color: '#666', fontStyle: 'italic' }}>No attempts today</li>
                    )}
                </ul>
            </div>
            {/* Recent Test Takers */}
            <div className="quiz-summary-section">
                <h4>Recent Test Takers</h4>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(recentScores) ? recentScores : []).map((attempt, i) => (
                        <li key={attempt.id}>
                            {attempt.user?.username || 'User'}: {attempt.score || 0}/{attempt.totalQuestions} ({Math.round(attempt.percentage || 0)}%) — {attempt.timeTakenMinutes !== null ? attempt.timeTakenMinutes : 'N/A'} min
                        </li>
                    ))}
                    {(!Array.isArray(recentScores) || recentScores.length === 0) && (
                        <li style={{ color: '#666', fontStyle: 'italic' }}>No recent attempts</li>
                    )}
                </ul>
            </div>
            <div className="quiz-summary-actions">
                <button className="quiz-btn quiz-btn-primary" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    Start Quiz
                </button>
                {quiz.practiceMode && (
                    <button className="quiz-btn quiz-btn-secondary" onClick={() => navigate(`/quiz/${quiz.id}?practice=true`)}>
                        Practice Mode
                    </button>
                )}
                <button className="quiz-btn quiz-btn-secondary" onClick={() => {
                    fetchFriends();
                    setChallengeModalOpen(true);
                }}>
                    Challenge a Friend
                </button>
                {isOwner && (
                    <button className="quiz-btn quiz-btn-secondary" onClick={() => navigate(`/edit-quiz/${quiz.id}`)}>
                        Edit Quiz
                    </button>
                )}
                {isOwner && (
                    <button className="quiz-btn quiz-btn-danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete Quiz'}
                    </button>
                )}
            </div>
            {isChallengeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Challenge a Friend</h3>
                        <p>Select a friend to challenge to take this quiz:</p>
                        <select
                            value={selectedFriend}
                            onChange={(e) => setSelectedFriend(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
                        >
                            <option value="">Select a friend...</option>
                            {friends.map(friend => (
                                <option key={friend.id} value={friend.username}>
                                    {friend.username}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setChallengeModalOpen(false)}
                                style={{ padding: '8px 16px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChallengeFriend}
                                disabled={challenging || !selectedFriend}
                                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white' }}
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
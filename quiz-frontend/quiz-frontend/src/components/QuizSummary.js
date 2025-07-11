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
    const [fetchingFriends, setFetchingFriends] = useState(false);
    const [topScoresToday, setTopScoresToday] = useState([]);
    const [clearingHistory, setClearingHistory] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8081/api/quizzes/${quizId}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load quiz.');
                return res.json();
            })
            .then(async (quizData) => {
                setQuiz(quizData);
                
                if (quizData.createdBy) {
                    const creatorRes = await fetch(`http://localhost:8081/api/auth/user/${quizData.createdBy}`);
                    if (creatorRes.ok) {
                        const creator = await creatorRes.json();
                        setCreatorId(creator.id);
                    }
                }
                
                const homeRes = await fetch('http://localhost:8081/api/home', { credentials: 'include' });
                if (homeRes.ok) {
                    const homeData = await homeRes.json();
                    if (homeData.user) {
                        setCurrentUsername(homeData.user);
                        const userRes = await fetch(`http://localhost:8081/api/auth/user/${homeData.user}`);
                        if (userRes.ok) {
                            const user = await userRes.json();
                            setUserId(user.id);
                            
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
                
                // Fetch all data in parallel
                Promise.all([
                    fetch(`http://localhost:8081/api/quiz-taking/top-scores/${quizId}?limit=5`),
                    fetch(`http://localhost:8081/api/quiz-taking/top-scores-today/${quizId}?limit=5`),
                    fetch(`http://localhost:8081/api/quiz-taking/recent/${quizId}?limit=5`),
                    fetch(`http://localhost:8081/api/quiz-taking/statistics/${quizId}`)
                ]).then(([topRes, todayRes, recentRes, statsRes]) => {
                    return Promise.all([
                        topRes.json(),
                        todayRes.json(),
                        recentRes.json(),
                        statsRes.json()
                    ]);
                }).then(([topData, todayData, recentData, statsData]) => {
                    setTopScores(Array.isArray(topData) ? topData : []);
                    setTopScoresToday(Array.isArray(todayData) ? todayData : []);
                    setRecentScores(Array.isArray(recentData) ? recentData : []);
                    setStats(statsData);
                }).catch(err => {
                    console.error('Data fetch error:', err);
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
        setFetchingFriends(true);
        try {
            console.log('Fetching friends...');
            const response = await fetch('http://localhost:8081/api/friends/list', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const friendsData = await response.json();
                console.log('Friends data received:', friendsData);
                
                // The backend returns List<String> of usernames
                let processedFriends = [];
                if (Array.isArray(friendsData)) {
                    // Convert string usernames to objects with username property
                    processedFriends = friendsData.map(username => ({ username }));
                } else if (friendsData && Array.isArray(friendsData.friends)) {
                    processedFriends = friendsData.friends.map(username => ({ username }));
                } else if (friendsData && Array.isArray(friendsData.users)) {
                    processedFriends = friendsData.users.map(username => ({ username }));
                } else if (typeof friendsData === 'object' && friendsData !== null) {
                    // If it's an object with usernames as keys
                    processedFriends = Object.keys(friendsData).map(username => ({ username }));
                }
                
                console.log('Processed friends:', processedFriends);
                setFriends(processedFriends);
            } else {
                console.error('Failed to fetch friends:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setFriends([]);
            }
        } catch (err) {
            console.error('Failed to fetch friends:', err);
            setFriends([]);
        } finally {
            setFetchingFriends(false);
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
            <div className="alert alert-error">
                {error}
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center">
                <div className="loading"></div>
                <p>Loading quiz...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Quiz Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ 
                                fontSize: 'var(--font-size-3xl)', 
                                fontWeight: 700, 
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                {quiz.title}
                            </h1>
                            <p style={{ 
                                fontSize: 'var(--font-size-lg)', 
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--spacing-md)'
                            }}>
                                {quiz.description}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                                <span className="badge badge-primary">
                                    {quiz.questions?.length || 0} Questions
                                </span>
                                <span className="badge badge-success">
                                    Created by {quiz.createdBy}
                                </span>
                                {quiz.createdAt && (
                                    <span className="badge badge-warning">
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/quiz/${quizId}`)}
                            >
                                🎯 Take Quiz
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    fetchFriends();
                                    setChallengeModalOpen(true);
                                }}
                            >
                                ⚡ Challenge Friend
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz Image */}
            {quiz.imageUrl && (
                <div className="card mb-4">
                    <div className="card-body text-center">
                        <img 
                            src={quiz.imageUrl} 
                            alt={quiz.title}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Statistics Grid */}
            {stats && (
                <div className="stats-grid mb-4">
                    <div className="stat-card">
                        <div className="stat-number">{stats.totalAttempts}</div>
                        <div className="stat-label">Total Attempts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.averageScore}%</div>
                        <div className="stat-label">Average Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.highestScore}</div>
                        <div className="stat-label">Highest Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.averageTime} min</div>
                        <div className="stat-label">Avg Time</div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Leaderboards */}
                <div>
                    {/* Top Scores All Time */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">🏆 Top Scores (All Time)</h3>
                        </div>
                        <div className="card-body">
                            <LeaderboardTable scores={topScores} />
                        </div>
                    </div>

                    {/* Top Scores Today */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">🔥 Top Scores (Today)</h3>
                        </div>
                        <div className="card-body">
                            <LeaderboardTable scores={topScoresToday} />
                        </div>
                    </div>

                    {/* Recent Attempts */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🕒 Recent Attempts</h3>
                        </div>
                        <div className="card-body">
                            <RecentAttemptsTable attempts={recentScores} />
                        </div>
                    </div>
                </div>

                {/* Right Column - User History & Actions */}
                <div>
                    {/* Your History */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">📊 Your History</h3>
                        </div>
                        <div className="card-body">
                            <UserHistoryTable history={userHistory} />
                        </div>
                    </div>

                    {/* Owner Actions */}
                    {isOwner && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3 className="card-title">⚙️ Quiz Management</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate(`/edit-quiz/${quizId}`)}
                                    >
                                        ✏️ Edit Quiz
                                    </button>
                                    <button
                                        className="btn btn-warning"
                                        onClick={handleDeleteHistory}
                                        disabled={clearingHistory}
                                    >
                                        {clearingHistory ? 'Clearing...' : '🗑️ Clear History'}
                                    </button>
                                    <button
                                        className="btn btn-error"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? 'Deleting...' : '💥 Delete Quiz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quiz Info */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">ℹ️ Quiz Information</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Questions:</span>
                                    <span style={{ fontWeight: 600 }}>{quiz.questions?.length || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Created:</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Creator:</span>
                                    <span style={{ fontWeight: 600 }}>
                                        <a 
                                            href={`/profile/${quiz.createdBy}`}
                                            style={{ color: 'var(--primary-600)', textDecoration: 'none' }}
                                        >
                                            {quiz.createdBy}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Challenge Modal */}
            {isChallengeModalOpen && (
                <div className="modal-overlay" onClick={() => setChallengeModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">⚡ Challenge a Friend</h3>
                            <button className="modal-close" onClick={() => setChallengeModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Select Friend:</label>
                                <select 
                                    className="form-input form-select"
                                    value={selectedFriend}
                                    onChange={(e) => setSelectedFriend(e.target.value)}
                                    disabled={fetchingFriends || friends.length === 0}
                                >
                                    <option value="">
                                        {fetchingFriends ? 'Loading friends...' : 
                                         friends.length === 0 ? 'No friends available' : 'Choose a friend...'}
                                    </option>
                                    {friends.map((friend) => (
                                        <option key={friend.username || friend.id || friend} value={friend.username || friend}>
                                            {friend.username || friend}
                                        </option>
                                    ))}
                                </select>
                                {fetchingFriends && (
                                    <div style={{ 
                                        color: 'var(--text-muted)', 
                                        fontSize: 'var(--font-size-sm)', 
                                        marginTop: 'var(--spacing-sm)',
                                        textAlign: 'center',
                                        fontStyle: 'italic'
                                    }}>
                                        Loading your friends...
                                    </div>
                                )}
                                {!fetchingFriends && friends.length === 0 && (
                                    <div style={{ 
                                        color: 'var(--text-muted)', 
                                        fontSize: 'var(--font-size-sm)', 
                                        marginTop: 'var(--spacing-sm)',
                                        textAlign: 'center',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--background-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border-light)'
                                    }}>
                                        <p style={{ margin: '0 0 var(--spacing-sm) 0', fontStyle: 'italic' }}>
                                            You don't have any friends yet.
                                        </p>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setChallengeModalOpen(false);
                                                navigate('/friends');
                                            }}
                                        >
                                            Add Friends
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-outline"
                                onClick={() => setChallengeModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleChallengeFriend}
                                disabled={challenging || !selectedFriend || friends.length === 0 || fetchingFriends}
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

// Helper Components
const LeaderboardTable = ({ scores }) => {
    if (!scores || scores.length === 0) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No scores yet</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {scores.map((score, index) => (
                <div 
                    key={score.id || index}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-md)',
                        background: index === 0 ? 'var(--primary-50)' : 'var(--background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: index === 0 ? '2px solid var(--primary-200)' : '1px solid var(--border-light)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: index === 0 ? 'var(--primary-600)' : 'var(--gray-300)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            {index + 1}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>
                                <a 
                                    href={`/profile/${score.user?.username || score.username}`}
                                    style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                                >
                                    {score.user?.username || score.username}
                                </a>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                {new Date(score.startTime).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                            fontWeight: 700, 
                            fontSize: 'var(--font-size-lg)',
                            color: index === 0 ? 'var(--primary-600)' : 'var(--text-primary)'
                        }}>
                            {score.score}%
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {score.timeTakenMinutes} min
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RecentAttemptsTable = ({ attempts }) => {
    if (!attempts || attempts.length === 0) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No recent attempts</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {attempts.map((attempt, index) => (
                <div 
                    key={attempt.id || index}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-md)',
                        background: 'var(--background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            <a 
                                href={`/profile/${attempt.user?.username || attempt.username}`}
                                style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                            >
                                {attempt.user?.username || attempt.username}
                            </a>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {new Date(attempt.startTime).toLocaleString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                            {attempt.score}%
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {attempt.timeTakenMinutes} min
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UserHistoryTable = ({ history }) => {
    if (!history || history.length === 0) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No attempts yet</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {history.map((attempt, index) => (
                <div 
                    key={attempt.id || index}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-md)',
                        background: 'var(--background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            Attempt #{history.length - index}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {new Date(attempt.startTime).toLocaleString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                            fontWeight: 600, 
                            color: attempt.score >= 80 ? 'var(--success-600)' : 
                                   attempt.score >= 60 ? 'var(--warning-600)' : 'var(--error-600)'
                        }}>
                            {attempt.score}%
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {attempt.timeTakenMinutes} min
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuizSummary;
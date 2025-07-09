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
                                .then(res => res.json())
                                .then(data => setUserHistory(Array.isArray(data) ? data : []))
                                .catch(() => setUserHistory([]));
                        }
                    }
                }
                // Fetch top scores (all time)
                fetch(`http://localhost:8081/api/quiz-taking/top-scores/${quizId}?limit=5`)
                    .then(res => res.json())
                    .then(data => setTopScores(Array.isArray(data) ? data : []))
                    .catch(() => setTopScores([]));
                // Fetch recent attempts (last 15 min)
                fetch(`http://localhost:8081/api/quiz-taking/recent/${quizId}?limit=5`)
                    .then(res => res.json())
                    .then(data => setRecentScores(Array.isArray(data) ? data : []))
                    .catch(() => setRecentScores([]));
                // Fetch stats
                fetch(`http://localhost:8081/api/quiz-taking/statistics/${quizId}`)
                    .then(res => res.json())
                    .then(setStats)
                    .catch(() => setStats(null));
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
            <div style={{ margin: '18px 0' }}>
                <b>Your Past Performance</b>
                <div style={{ margin: '8px 0' }}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
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
                            {new Date(attempt.startTime).toLocaleString()} — {attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%) — {attempt.timeTakenMinutes} min
                        </li>
                    ))}
                </ul>
            </div>
            {/* Top Performers */}
            <div style={{ margin: '18px 0' }}>
                <b>Top Performers (All Time)</b>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(topScores) ? topScores : []).map((attempt, i) => (
                        <li key={attempt.id}>
                            {attempt.user?.username || 'User'}: {attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%)
                        </li>
                    ))}
                </ul>
            </div>
            {/* Recent Test Takers */}
            <div style={{ margin: '18px 0' }}>
                <b>Recent Test Takers</b>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                    {(Array.isArray(recentScores) ? recentScores : []).map((attempt, i) => (
                        <li key={attempt.id}>
                            {attempt.user?.username || 'User'}: {attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%) — {attempt.timeTakenMinutes} min
                        </li>
                    ))}
                </ul>
            </div>
            <div className="quiz-summary-actions">
                <button className="quiz-btn quiz-btn-primary" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    Start Quiz
                </button>
                {/* Practice mode button if available */}
                {quiz.practiceMode && (
                    <button className="quiz-btn quiz-btn-secondary" onClick={() => navigate(`/quiz/${quiz.id}?practice=true`)}>
                        Practice Mode
                    </button>
                )}
                {/* Edit button if owner */}
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
        </div>
    );
};

export default QuizSummary; 
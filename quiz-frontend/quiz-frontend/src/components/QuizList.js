import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

const TEST_QUIZZES = [
    {
        id: 'test1',
        title: 'Sample General Knowledge Quiz',
        creator: 'admin',
    },
    {
        id: 'test2',
        title: 'History and Presidents',
        creator: 'teacher',
    },
    {
        id: 'test3',
        title: 'Science Basics',
        creator: 'professor',
    },
];

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState('');
    const [useTestQuizzes, setUseTestQuizzes] = useState(false);
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8081/api/home', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => setRole(data.role || ''));

        fetch('http://localhost:8081/api/quizzes', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load quizzes.');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setQuizzes(data);
                    setUseTestQuizzes(false);
                } else {
                    setUseTestQuizzes(true);
                }
            })
            .catch(() => {
                setError('Failed to load quizzes. Showing test quizzes.');
                setUseTestQuizzes(true);
            });
    }, []);

    const handleDelete = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            setQuizzes(quizzes.filter(q => q.id !== quizId));
        } catch (err) {
            alert('Failed to delete quiz.');
        }
    };

    const displayQuizzes = useTestQuizzes ? TEST_QUIZZES : quizzes;

    return (
        <div className="quiz-list-container">
            <h2 style={{textAlign:'center',marginBottom:'24px'}}>Available Quizzes</h2>
            {error && <div style={{ color: 'red', marginBottom: '1em' }}>{error}</div>}
            <ul className="quiz-list">
                {displayQuizzes.map(quiz => (
                    <li key={quiz.id} className="quiz-card">
                        <div>
                            <div className="quiz-title">{quiz.title}</div>
                            <div className="quiz-meta">by {quiz.createdBy || quiz.creator}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="quiz-btn quiz-btn-primary" onClick={() => navigate(`/quiz-summary/${quiz.id}`)}>
                                Check it out
                            </button>
                            {role === 'ROLE_ADMIN' && !useTestQuizzes && (
                                <button className="quiz-btn quiz-btn-danger" onClick={() => handleDelete(quiz.id)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {displayQuizzes.length === 0 && <div>No quizzes available.</div>}
        </div>
    );
};

export default QuizList;
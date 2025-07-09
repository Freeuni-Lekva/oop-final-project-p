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
    const [role, setRole] = useState(''); // NEW: store role
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
        <div className="quiz-list-container" style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32 }}>
            <h2 style={{textAlign:'center',marginBottom:'32px', color: '#4f46e5', fontWeight: 700}}>Available Quizzes</h2>
            {error && <div className="auth-error">{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {displayQuizzes.map((quiz) => (
                    <div key={quiz.id} style={{ background: '#f9fafb', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'box-shadow 0.2s', border: '1px solid #e5e7eb' }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 600, color: '#22223b', marginBottom: 4 }}>{quiz.title}</div>
                            <div style={{ color: '#6366f1', fontWeight: 500, fontSize: 15 }}>by {quiz.creator || quiz.createdBy || 'unknown'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => navigate(`/quiz/${quiz.id}`)} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 15, transition: 'background 0.2s' }}>Check it out</button>
                            {role === 'ROLE_ADMIN' && !useTestQuizzes && (
                                <button onClick={() => handleDelete(quiz.id)} style={{ padding: '8px 16px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 15, transition: 'background 0.2s' }}>Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {displayQuizzes.length === 0 && <div style={{textAlign:'center',marginTop:32}}>No quizzes available.</div>}
        </div>
    );
};

export default QuizList; 
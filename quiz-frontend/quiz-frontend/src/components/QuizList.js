import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/quizzes', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            } else {
                setError('Failed to fetch quizzes');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || quiz.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(quizzes.map(quiz => quiz.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div className="loading" style={{ width: '40px', height: '40px', margin: '20px auto' }}></div>
                <p>Loading quizzes...</p>
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
                        🔍 Quiz Library
                    </h2>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => navigate('/home')} 
                        className="btn-outline"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        🏠 Home
                    </button>
                    <button 
                        onClick={() => navigate('/create-quiz')} 
                        className="btn-primary"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        ✨ Create Quiz
                    </button>
                </div>
            </div>

            <div className="homepage-vertical" style={{ marginTop: '100px' }}>
                {/* Search and Filter Section */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label htmlFor="search" style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: 'var(--gray-700)', 
                                fontWeight: '600',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                🔍 Search Quizzes
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or description..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        
                        <div style={{ minWidth: '150px' }}>
                            <label htmlFor="category" style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: 'var(--gray-700)', 
                                fontWeight: '600',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                📂 Category
                            </label>
                            <select
                                id="category"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="auth-error" style={{ marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                {/* Results Count */}
                <div style={{ 
                    marginBottom: '16px', 
                    color: 'var(--gray-600)',
                    fontSize: 'var(--font-size-sm)'
                }}>
                    Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                </div>

                {/* Quiz Grid */}
                {filteredQuizzes.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ color: 'var(--gray-700)', marginBottom: '8px' }}>
                            No quizzes found
                        </h3>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
                            {searchTerm || filterCategory !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Be the first to create a quiz!'
                            }
                        </p>
                        {!searchTerm && filterCategory === 'all' && (
                            <button
                                onClick={() => navigate('/create-quiz')}
                                className="btn-primary"
                            >
                                Create Your First Quiz
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="homepage-grid">
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="homepage-card" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                                <div className="homepage-card-title">
                                    {quiz.category && (
                                        <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                                            {quiz.category}
                                        </span>
                                    )}
                                    {quiz.title}
                                </div>
                                
                                <div style={{ 
                                    color: 'var(--gray-600)', 
                                    marginBottom: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    {quiz.description || 'No description available.'}
                                </div>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    alignItems: 'center',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--gray-500)'
                                }}>
                                    {quiz.createdBy ? (
                                        <span>
                                            👤 by <span 
                                                style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigate(`/profile/${quiz.createdBy}`);
                                                }}
                                            >
                                                {quiz.createdBy}
                                            </span>
                                        </span>
                                    ) : (
                                        <span>👤 by Unknown</span>
                                    )}
                                </div>
                                
                                {quiz.createdAt && (
                                    <div style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--gray-400)',
                                        marginTop: '8px'
                                    }}>
                                        Created {new Date(quiz.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                                
                                <div style={{ 
                                    marginTop: '16px',
                                    padding: '8px 0',
                                    borderTop: '1px solid var(--gray-200)',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/quiz-summary/${quiz.id}`);
                                        }}
                                        className="btn-outline"
                                        style={{ flex: 1, fontSize: '14px' }}
                                    >
                                        📊 Checkout Quiz
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/quiz/${quiz.id}`);
                                        }}
                                        className="btn-primary"
                                        style={{ flex: 1, fontSize: '14px' }}
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizList;
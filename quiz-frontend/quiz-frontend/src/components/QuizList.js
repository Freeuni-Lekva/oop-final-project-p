import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/quizzes', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch quizzes');
            const data = await response.json();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load quizzes');
            console.error('Error fetching quizzes:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterBy === 'all') return matchesSearch;
        if (filterBy === 'recent') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return matchesSearch && new Date(quiz.createdAt) > oneWeekAgo;
        }
        if (filterBy === 'popular') {
            // This would need backend support for popularity metrics
            return matchesSearch;
        }
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="text-center">
                <div className="loading" style={{ width: '48px', height: '48px', margin: '0 auto var(--spacing-lg)' }}></div>
                <p>Loading quizzes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                {error}
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div>
                            <h1 style={{ 
                                fontSize: 'var(--font-size-3xl)', 
                                fontWeight: 700, 
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                📚 Browse Quizzes
                            </h1>
                            <p style={{ 
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--font-size-lg)',
                                margin: 0
                            }}>
                                Discover and take quizzes created by the community
                            </p>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/create-quiz')}
                        >
                            ➕ Create Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card mb-4">
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label className="form-label">Search Quizzes</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by title, description, or creator..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ minWidth: '150px' }}>
                            <label className="form-label">Filter</label>
                            <select
                                className="form-input form-select"
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                            >
                                <option value="all">All Quizzes</option>
                                <option value="recent">Recent (Last 7 days)</option>
                                <option value="popular">Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                </p>
            </div>

            {/* Quiz Grid */}
            {filteredQuizzes.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center">
                        <div style={{ fontSize: '4em', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>
                            🔍
                        </div>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>No quizzes found</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                            {searchTerm || filterBy !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Be the first to create a quiz!'
                            }
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/create-quiz')}
                        >
                            Create First Quiz
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} onNavigate={navigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

const QuizCard = ({ quiz, onNavigate }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="quiz-card" onClick={() => onNavigate(`/quiz-summary/${quiz.id}`)}>
            {/* Quiz Image */}
            {quiz.imageUrl && !imageError && (
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                        src={quiz.imageUrl}
                        alt={quiz.title}
                        className="quiz-image"
                        onError={() => setImageError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'var(--spacing-sm)',
                        right: 'var(--spacing-sm)',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600
                    }}>
                        {quiz.questions?.length || 0} Q
                    </div>
                </div>
            )}

            {/* Quiz Content */}
            <div className="quiz-content">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-description">
                    {quiz.description || 'No description available'}
                </p>
                
                <div className="quiz-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-600)',
                            fontWeight: 600,
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            {quiz.createdBy?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            by {quiz.createdBy || 'Unknown'}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown date'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    gap: 'var(--spacing-sm)', 
                    marginTop: 'var(--spacing-lg)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--border-light)'
                }}>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`/quiz/${quiz.id}`);
                        }}
                    >
                        🎯 Take Quiz
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`/quiz-summary/${quiz.id}`);
                        }}
                    >
                        📊 View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizList;
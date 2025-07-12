import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

// Utility to format minutes to hh:mm:ss or mm:ss
function formatTime(minutes) {
    if (!minutes || isNaN(minutes) || minutes < 0 || minutes > 10000) return '--';
    const totalSeconds = Math.round(minutes * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
    const [immediateFeedback, setImmediateFeedback] = useState(null);

    useEffect(() => {
        const startQuiz = async () => {
            try {
                const quizResponse = await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
                    credentials: 'include'
                });
                if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
                const quizData = await quizResponse.json();
                setQuiz(quizData);
                const startResponse = await fetch(`http://localhost:8081/api/quiz-taking/start/${quizId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (!startResponse.ok) throw new Error('Failed to start quiz');
                const startData = await startResponse.json();
                setAttemptId(startData.attemptId);
                setQuestions(startData.questions || quizData.questions);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        startQuiz();
    }, [quizId]);

    const handleChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    // For multi-page: submit one question for immediate correction
    const handleImmediateNext = async () => {
        setShowImmediateFeedback(false);
        setImmediateFeedback(null);
        const q = questions[currentIdx];
        if (!attemptId || !q) return;
        try {
            // If you had a /check endpoint, you can restore it here, or just skip immediate correction for now
            setImmediateFeedback('Answer submitted!');
            setShowImmediateFeedback(true);
            setTimeout(() => {
                setShowImmediateFeedback(false);
                setImmediateFeedback(null);
                setCurrentIdx((idx) => idx + 1);
            }, 1200);
        } catch (err) {
            setImmediateFeedback('Error checking answer');
            setShowImmediateFeedback(true);
        }
    };

    const handleNext = () => {
        setCurrentIdx((idx) => idx + 1);
    };
    const handlePrev = () => {
        setCurrentIdx((idx) => idx - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!attemptId) {
            setError('No active quiz attempt found');
            return;
        }
        setSubmitting(true);
        setError(null);
        setResult(null);
        try {
            const response = await fetch(`http://localhost:8081/api/quiz-taking/submit/${attemptId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(answers),
            });
            if (!response.ok) throw new Error('Failed to submit quiz');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestion = (question, idx) => {
        switch (question.type) {
            case 'QUESTION_RESPONSE':
            case 'FILL_IN_THE_BLANK':
                return (
                    <div key={question.id} className="question-block">
                        <label>{question.questionText}</label>
                        <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                        />
                    </div>
                );
            case 'MULTIPLE_CHOICE':
                return (
                    <div key={question.id} className="question-block">
                        <label>{question.questionText}</label>
                        <div>
                            {question.options && question.options.map((option, i) => (
                                <label key={i}>
                                    <input
                                        type="radio"
                                        name={`mc_${question.id}`}
                                        value={option.text}
                                        checked={answers[question.id] === option.text}
                                        onChange={() => handleChange(question.id, option.text)}
                                    />
                                    {option.text}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'PICTURE_RESPONSE':
                return (
                    <div key={question.id} className="question-block">
                        <label>{question.questionText}</label>
                        <div>
                            <img src={question.imageUrl} alt="Question" style={{ maxWidth: '300px', display: 'block', margin: '10px 0' }} />
                            <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleChange(question.id, e.target.value)}
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div key={question.id} className="question-block">
                        <label>{question.questionText} (Type: {question.type})</label>
                        <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                        />
                    </div>
                );
        }
    };

    if (loading) return <div>Loading quiz...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!quiz) return <div>No quiz found.</div>;

    if (result) {
        return (
            <div className="quiz-result-card">
                <h2 style={{ marginBottom: '18px', color: '#2563eb' }}>Quiz Results</h2>
                <div className="quiz-result-score">
                    <span className="quiz-result-score-main">{result.score}</span>
                    <span className="quiz-result-score-total">/ {result.totalQuestions}</span>
                </div>
                <div className="quiz-result-bar">
                    <div
                        className="quiz-progress"
                        style={{ width: `${result.percentage}%`, height: '100%' }}
                    ></div>
                </div>
                <div className="quiz-result-stats">
                    <span><strong>Percentage:</strong> {result.percentage}%</span>
                    <span><strong>Time Taken:</strong> {result.timeTaken} minutes</span>
                    <span><strong>Completed:</strong> {result.completed ? 'Yes' : 'No'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                    <button className="quiz-btn quiz-btn-primary" onClick={() => window.location.reload()}>
                        Retake Quiz
                    </button>
                    <button className="quiz-btn quiz-btn-secondary" onClick={() => navigate('/home')}>Back to Home</button>
                </div>
            </div>
        );
    }

    // Multi-page logic
    if (quiz.singlePage) {
        // Show all questions at once (default behavior)
        return (
            <div className="take-quiz-container">
                <h2>{quiz.title}</h2>
                <p>{quiz.description}</p>
                <form onSubmit={handleSubmit}>
                    {questions && questions.map((q, idx) => renderQuestion(q, idx))}
                    <button className="quiz-btn quiz-btn-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Quiz'}</button>
                </form>
            </div>
        );
    } else {
        // Multi-page: show one question at a time
        const q = questions[currentIdx];
        const progress = ((currentIdx + 1) / questions.length) * 100;
        return (
            <div className="take-quiz-container">
                <h2>{quiz.title}</h2>
                <p>{quiz.description}</p>
                <div className="quiz-progress-bar">
                    <div className="quiz-progress" style={{ width: `${progress}%` }}></div>
                </div>
                <form onSubmit={handleSubmit}>
                    {q && renderQuestion(q, currentIdx)}
                    <div style={{ marginTop: 20, display: 'flex', gap: '12px' }}>
                        <button className="quiz-btn quiz-btn-secondary" type="button" onClick={handlePrev} disabled={currentIdx === 0}>Previous</button>
                        {quiz.immediateCorrection ? (
                            <button
                                className="quiz-btn quiz-btn-primary"
                                type="button"
                                onClick={handleImmediateNext}
                                disabled={!answers[q.id] || showImmediateFeedback || currentIdx === questions.length - 1}
                            >
                                {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        ) : (
                            <button
                                className="quiz-btn quiz-btn-primary"
                                type={currentIdx === questions.length - 1 ? 'submit' : 'button'}
                                onClick={currentIdx === questions.length - 1 ? undefined : handleNext}
                                disabled={!answers[q.id]}
                            >
                                {currentIdx === questions.length - 1 ? (submitting ? 'Submitting...' : 'Submit Quiz') : 'Next'}
                            </button>
                        )}
                    </div>
                    {quiz.immediateCorrection && showImmediateFeedback && (
                        <div className={`quiz-feedback${immediateFeedback === 'Incorrect.' ? ' incorrect' : ''}`}>{immediateFeedback}</div>
                    )}
                </form>
            </div>
        );
    }
};

export default TakeQuiz;
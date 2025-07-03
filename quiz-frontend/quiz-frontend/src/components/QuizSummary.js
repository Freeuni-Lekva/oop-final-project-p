import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

const QuizSummary = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8081/api/quizzes/${quizId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load quiz.');
        return res.json();
      })
      .then(setQuiz)
      .catch(() => setError('Failed to load quiz.'));
  }, [quizId]);

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
        <div className="quiz-summary-meta">Created by: <b>{quiz.createdBy || 'Unknown'}</b></div>
      </div>
      <div className="quiz-summary-actions">
        <button className="quiz-btn quiz-btn-primary" onClick={() => navigate(`/quiz/${quiz.id}`)}>
          Start Quiz
        </button>
        <button className="quiz-btn quiz-btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizSummary; 
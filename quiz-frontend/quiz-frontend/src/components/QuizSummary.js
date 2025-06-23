import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuizSummary = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load quiz.');
        return res.json();
      })
      .then(setQuiz)
      .catch(() => setError('Failed to load quiz.'));
  }, [quizId]);

  if (error) return <div>{error}</div>;
  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="quiz-summary-container auth-container">
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>
      <p>Created by: <b>{quiz.creator}</b></p>
      {/* Add stats, top scorers, etc. if available */}
      <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Start Quiz</button>
    </div>
  );
};

export default QuizSummary; 
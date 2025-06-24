import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
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

  const displayQuizzes = useTestQuizzes ? TEST_QUIZZES : quizzes;

  return (
    <div className="quiz-list-container auth-container">
      <h2>Available Quizzes</h2>
      {error && <div style={{ color: 'red', marginBottom: '1em' }}>{error}</div>}
      <ul>
        {displayQuizzes.map(quiz => (
          <li key={quiz.id} style={{ marginBottom: '1em' }}>
            <b>{quiz.title}</b> by <span>{quiz.creator}</span>
            <button style={{ marginLeft: '1em' }} onClick={() => navigate(`/quiz/${quiz.id}`)}>Take</button>
          </li>
        ))}
      </ul>
      {displayQuizzes.length === 0 && <div>No quizzes available.</div>}
    </div>
  );
};

export default QuizList; 
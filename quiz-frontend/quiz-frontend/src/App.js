import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import TakeQuiz from './components/TakeQuiz';
import QuizList from './components/QuizList';
import QuizSummary from './components/QuizSummary';
import CreateQuiz from './components/CreateQuiz';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/create-quiz" element={<CreateQuiz />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/quiz/:quizId" element={<TakeQuiz />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/quiz-summary/:quizId" element={<QuizSummary />} />
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
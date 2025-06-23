import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home'; // ✅ Import Home
import TakeQuiz from './components/TakeQuiz';
import QuizList from './components/QuizList';
import QuizSummary from './components/QuizSummary';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} /> {/* ✅ Now uses Home.js */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/quiz/:quizId" element={<TakeQuiz />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/quiz-summary/:quizId" element={<QuizSummary />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;

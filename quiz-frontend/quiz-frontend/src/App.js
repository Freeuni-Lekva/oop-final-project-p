import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
                {/* Public routes - no layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login />} />
                
                {/* Protected routes - with layout */}
                <Route path="/home" element={
                    <Layout>
                        <Home />
                    </Layout>
                } />
                <Route path="/create-quiz" element={
                    <Layout>
                        <CreateQuiz />
                    </Layout>
                } />
                <Route path="/admin" element={
                    <Layout>
                        <AdminDashboard />
                    </Layout>
                } />
                <Route path="/quiz/:quizId" element={
                    <Layout>
                        <TakeQuiz />
                    </Layout>
                } />
                <Route path="/quizzes" element={
                    <Layout>
                        <QuizList />
                    </Layout>
                } />
                <Route path="/profile/:username" element={
                    <Layout>
                        <UserProfile />
                    </Layout>
                } />
                <Route path="/quiz-summary/:quizId" element={
                    <Layout>
                        <QuizSummary />
                    </Layout>
                } />
            </Routes>
        </Router>
    );
}

export default App;
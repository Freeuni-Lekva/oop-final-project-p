import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home'; // ✅ Import Home
import CreateQuiz from './components/CreateQuiz';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} /> {/* ✅ Now uses Home.js */}
                <Route path="/create-quiz" element={<CreateQuiz />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;

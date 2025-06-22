import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from "../quiz-frontend/src/components/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ Admin route */}
          <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App; 
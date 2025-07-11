import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Fetch user data
        fetch('http://localhost:8081/api/home', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then((data) => {
                setUsername(data.user);
                setRole(data.role);
            })
            .catch((err) => {
                console.error('Auth error:', err);
                navigate('/login');
            });
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await fetch('http://localhost:8081/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {}
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navigationItems = [
        { path: '/home', label: 'Dashboard', icon: '🏠' },
        { path: '/quizzes', label: 'Browse Quizzes', icon: '📚' },
        { path: '/create-quiz', label: 'Create Quiz', icon: '➕' },
        ...(role === 'ROLE_ADMIN' ? [{ path: '/admin', label: 'Admin Panel', icon: '⚙️' }] : []),
    ];

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="nav-menu">
                    {/* Logo/Brand */}
                    <div style={{ 
                        padding: 'var(--spacing-lg)', 
                        borderBottom: '1px solid var(--border-light)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: 'var(--primary-600)',
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 700
                        }}>
                            🧠 QuizMaster
                        </h2>
                    </div>

                    {/* Navigation */}
                    <nav>
                        {navigationItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                            >
                                <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* User Section */}
                    <div style={{ 
                        marginTop: 'auto', 
                        padding: 'var(--spacing-lg)',
                        borderTop: '1px solid var(--border-light)'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--primary-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 'var(--spacing-md)',
                                color: 'var(--primary-600)',
                                fontWeight: 600
                            }}>
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {username}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                    {role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => navigate(`/profile/${username}`)}
                                style={{ flex: 1 }}
                            >
                                Profile
                            </button>
                            <button
                                className="btn btn-error btn-sm"
                                onClick={handleSignOut}
                                style={{ flex: 1 }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ display: 'none' }}
                        >
                            ☰
                        </button>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            {navigationItems.find(item => isActive(item.path))?.label || 'QuizMaster'}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                            Welcome back, {username}!
                        </span>
                    </div>
                </header>

                {/* Content Area */}
                <main className="content-area">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="modal-overlay"
                    style={{ 
                        display: 'none',
                        zIndex: 90 
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout; 
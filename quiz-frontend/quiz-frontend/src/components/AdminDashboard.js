import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        document.title = "Admin Dashboard";
        fetchUsers();
        fetchCurrentUser();
        fetchAnnouncements();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/home', { credentials: 'include' });
            const data = await res.json();
            setCurrentUsername(data.user);
        } catch (err) {
            setCurrentUsername('');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/admin/users', {
                withCredentials: true,
            });
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('Failed to fetch users. You must be an admin.');
            setUsers([]);
        }
    };

    const promoteUser = async (id) => {
        try {
            await axios.post(`http://localhost:8081/api/admin/promote/${id}`, {}, {
                withCredentials: true,
            });
            fetchUsers();
        } catch (err) {
            alert('Promotion failed.');
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/admin/users/${id}`, {
                withCredentials: true,
            });
            fetchUsers();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    const createAnnouncement = async () => {
        try {
            await axios.post('http://localhost:8081/api/admin/announcements', {
                title: newTitle,
                content: newContent,
            }, {
                withCredentials: true,
            });
            alert("Announcement posted.");
            setNewTitle('');
            setNewContent('');
            fetchAnnouncements(); // Refresh announcements after creating
        } catch (err) {
            alert("Failed to create announcement.");
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/announcements', { withCredentials: true });
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setAnnouncements([]);
        }
    };

    const deleteAnnouncement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await axios.delete(`http://localhost:8081/api/admin/announcements/${id}`, { withCredentials: true });
            fetchAnnouncements();
        } catch (err) {
            alert('Failed to delete announcement.');
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {Array.isArray(users) && users.length > 0 ? (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</td>
                            <td>
                                {user.role !== 'ROLE_ADMIN' && (
                                    <button onClick={() => promoteUser(user.id)}>Promote</button>
                                )}
                                {user.username !== currentUsername && (
                                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                !error && <p>No users found.</p>
            )}

            {/* 🟣 Create Announcement Form */}
            <div style={{ marginTop: '30px', width: '100%' }}>
                <h3>Create Announcement</h3>
                <input
                    type="text"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                />
                <textarea
                    placeholder="Content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                />
                <button onClick={createAnnouncement}>Post Announcement</button>
            </div>

            {/* Announcements List with Delete */}
            <div style={{ marginTop: '40px', width: '100%' }}>
                <h3>Announcements</h3>
                {announcements.length === 0 ? (
                    <p>No announcements available.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {announcements.map(a => (
                            <li key={a.id} style={{ marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                                <b>{a.title}</b><br />
                                <span>{a.content}</span><br />
                                <small>{new Date(a.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>
                                <button onClick={() => deleteAnnouncement(a.id)} style={{ marginLeft: 16, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
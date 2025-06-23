import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Friends.css';

const MessagesModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('received');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sendStep, setSendStep] = useState('search'); // 'search' or 'compose'
    const [searchQuery, setSearchQuery] = useState('');
    const [friendResults, setFriendResults] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');

    useEffect(() => {
        if (isOpen && activeTab === 'received') {
            fetchReceivedMessages();
        }
    }, [isOpen, activeTab]);

    const fetchReceivedMessages = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/messages/received', { withCredentials: true });
            setReceivedMessages(res.data);
        } catch (err) {
            setError('Failed to load messages.');
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSendError('');
        setSendSuccess('');
        setSelectedFriend(null);
        setFriendResults([]);
        try {
            const res = await axios.get('/api/friends/list', { withCredentials: true });
            const results = res.data.filter((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
            if (results.length === 0) {
                setSendError('No friends found.');
            } else {
                setFriendResults(results);
            }
        } catch (err) {
            setSendError('Error searching friends.');
        }
    };

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        setSendStep('compose');
        setMessageContent('');
        setSendError('');
        setSendSuccess('');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setSendError('');
        setSendSuccess('');
        try {
            const res = await axios.post('/api/messages/send', {
                receiverUsername: selectedFriend,
                content: messageContent
            }, { withCredentials: true });
            setSendSuccess(res.data.message || 'Message sent!');
            setSendStep('search');
            setSearchQuery('');
            setFriendResults([]);
            setSelectedFriend(null);
            setMessageContent('');
        } catch (err) {
            setSendError(err.response?.data?.error || 'Failed to send message.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="friends-modal-overlay">
            <div className="friends-modal-content">
                <button onClick={onClose} className="friends-modal-close-button">&times;</button>
                <h2>Messages</h2>
                <div className="friends-modal-tabs">
                    <button
                        className={`friends-modal-tab ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        Messages for You
                    </button>
                    <button
                        className={`friends-modal-tab ${activeTab === 'send' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('send'); setSendStep('search'); setSendError(''); setSendSuccess(''); }}
                    >
                        Send Message
                    </button>
                </div>
                <div className="friends-modal-body">
                    {activeTab === 'received' && (
                        <div>
                            {loading ? <p>Loading...</p> : error ? <p className="error-message">{error}</p> : (
                                receivedMessages.length === 0 ? <p>No messages yet.</p> :
                                <ul className="friends-list">
                                    {receivedMessages.map((msg) => (
                                        <li key={msg.id} className="friend-item">
                                            <span><b>{msg.senderUsername}</b>: {msg.content}</span>
                                            <span style={{ fontSize: '0.85em', color: '#888' }}>{new Date(msg.timestamp).toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {activeTab === 'send' && (
                        <div>
                            {sendSuccess && <p className="success-message">{sendSuccess}</p>}
                            {sendError && <p className="error-message">{sendError}</p>}
                            {sendStep === 'search' && (
                                <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
                                    <input
                                        type="text"
                                        placeholder="Search friend to message..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        required
                                    />
                                    <button type="submit">Search</button>
                                </form>
                            )}
                            {sendStep === 'search' && friendResults.length > 0 && (
                                <ul className="user-search-results">
                                    {friendResults.map((friend) => (
                                        <li key={friend} className="search-result-item">
                                            <span>{friend}</span>
                                            <button onClick={() => handleSelectFriend(friend)} className="add-friend-button">Message</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {sendStep === 'compose' && selectedFriend && (
                                <form onSubmit={handleSendMessage}>
                                    <div style={{ marginBottom: 8 }}>
                                        <b>To:</b> {selectedFriend}
                                    </div>
                                    <textarea
                                        placeholder="Type your message..."
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        required
                                        rows={3}
                                        style={{ width: '100%', marginBottom: 8 }}
                                    />
                                    <button type="submit">Send</button>
                                    <button type="button" style={{ marginLeft: 8 }} onClick={() => { setSendStep('search'); setSelectedFriend(null); }}>Cancel</button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesModal; 
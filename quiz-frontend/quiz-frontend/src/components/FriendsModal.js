import React, { useState } from 'react';
import './Friends.css'; // Import our new styles
import FriendList from './FriendList';
import FriendRequests from './FriendRequests';
import UserSearch from './UserSearch';

const FriendsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'requests', 'add'
    const [requestsCount, setRequestsCount] = useState(0);

    if (!isOpen) {
        return null;
    }

    const handleRequestsCountChange = (count) => {
        setRequestsCount(count);
    };

    return (
        <div className="friends-modal-overlay">
            <div className="friends-modal-content">
                <button onClick={onClose} className="friends-modal-close-button">&times;</button>
                <h2>Friends</h2>
                <div className="friends-modal-tabs">
                    <button
                        className={`friends-modal-tab ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        My Friends
                    </button>
                    <button
                        className={`friends-modal-tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests
                        {requestsCount > 0 && <span className="notification-badge">{requestsCount}</span>}
                    </button>
                    <button
                        className={`friends-modal-tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        Add Friend
                    </button>
                </div>
                <div className="friends-modal-body">
                    {activeTab === 'list' && <FriendList />}
                    {activeTab === 'requests' && <FriendRequests onRequestsCountChange={handleRequestsCountChange} />}
                    {activeTab === 'add' && <UserSearch />}
                </div>
            </div>
        </div>
    );
};

export default FriendsModal; 
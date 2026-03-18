import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (err) {
            setError('Failed to load notifications.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Update the local state to show it as read
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString.replace(/-/g, '/'));
        return date.toLocaleString('en-GB', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">

                    <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-dark-blue)', marginBottom: '1.5rem' }}>All Notifications</h1>

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <div className="card">
                        {isLoading ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>You have no notifications.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {notifications.map(notification => (
                                    <div key={notification.id} style={{
                                        padding: '1.25rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        backgroundColor: notification.is_read ? 'transparent' : '#f0f9ff'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '1rem',
                                                color: 'var(--text-color)',
                                                margin: '0 0 0.5rem 0',
                                                fontWeight: notification.is_read ? '400' : '600'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-color-light)' }}>
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>

                                        {!notification.is_read && (
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.35rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                        {notification.is_read == 1 && (
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-color-light)', fontStyle: 'italic', paddingRight: '1rem' }}>
                                                Read
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}

export default NotificationsPage;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { eventService } from '../services/eventService';
import { supervisionService } from '../services/supervisionService';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Temporary empty state arrays until backend APIs are integrated
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch notifications
                const notifs = await notificationService.getNotifications();
                // Take only the 3 newest notifications regardless of read status
                setNotifications(notifs.slice(0, 3));

                // Fetch upcoming events
                const allEvents = await eventService.getEvents();
                let supervisionEvents = [];

                if (user.role === 'student') {
                    const bookings = await supervisionService.getMyBookings();
                    supervisionEvents = bookings.map(b => ({
                        id: `sup-${b.booking_id}`,
                        title: `Supervision - ${b.lecturer_first_name} ${b.lecturer_last_name}`,
                        location: b.location,
                        start_time: b.start_time,
                        end_time: b.end_time
                    }));
                } else if (user.role === 'lecturer' || user.role === 'admin') {
                    const hostedSlots = await supervisionService.getLecturerSlots();
                    supervisionEvents = hostedSlots.map(s => ({
                        id: `sup-${s.id}`,
                        title: `Hosting Supervision`,
                        location: s.location,
                        start_time: s.start_time,
                        end_time: s.end_time
                    }));
                }

                const combinedEvents = [...allEvents, ...supervisionEvents];
                const now = new Date();

                // Filter events that haven't ended yet
                const upcoming = combinedEvents.filter(e => {
                    const endDate = new Date(e.end_time.replace(/-/g, '/'));
                    return endDate > now;
                });

                // Sort by nearest start time first
                upcoming.sort((a, b) => {
                    const dateA = new Date(a.start_time.replace(/-/g, '/'));
                    const dateB = new Date(b.start_time.replace(/-/g, '/'));
                    return dateA - dateB;
                });

                // Take top 3
                setUpcomingEvents(upcoming.slice(0, 3));

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Optimistically remove it from the UI list
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    {/* Welcome Banner */}
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem 2rem' }}>
                        <h2 style={{ margin: 0 }}>Welcome {user ? `${user.first_name} ${user.last_name}` : ''}</h2>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="dashboard-grid">

                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Upcoming Events */}
                            <div className="card">
                                <h3>Upcoming Events</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map(event => {
                                            const startDate = new Date(event.start_time.replace(/-/g, '/'));
                                            const formattedDate = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                            const formattedTime = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <div key={event.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem 0' }}>{event.title}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-color-light)', margin: 0 }}>
                                                        {formattedDate} • {formattedTime} {event.location ? `• ${event.location}` : ''}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-color-light)', fontStyle: 'italic' }}>No upcoming events</p>
                                    )}
                                </div>
                            </div>

                            {/* Notifications Preview */}
                            <div className="card">
                                <h3>Notifications Preview</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div key={notification.id} style={{
                                                padding: '1rem 0',
                                                borderBottom: '1px dashed var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-color)', margin: 0, fontWeight: notification.is_read ? '400' : '500' }}>
                                                    {notification.message}
                                                </p>
                                                {/* No Mark Read component here; viewable in main NotificationsPage */}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-color-light)', fontStyle: 'italic', paddingBottom: '0.5rem' }}>No notifications</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Quick Actions */}
                            <div className="card">
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                    {user?.role === 'admin' && (
                                        <>
                                            <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>View Calendar</button>
                                            <button onClick={() => navigate('/admin/users')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>Manage Users</button>
                                            <button onClick={() => navigate('/admin')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>System Dashboard</button>
                                        </>
                                    )}
                                    {user?.role === 'lecturer' && (
                                        <>
                                            <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>View Calendar</button>
                                            <button onClick={() => navigate('/students')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>My Students</button>
                                            <button onClick={() => navigate('/manage-events')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>Create Event</button>
                                        </>
                                    )}
                                    {user?.role === 'student' && (
                                        <>
                                            <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>View Calendar</button>
                                            <button onClick={() => navigate('/supervision')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>Book Supervision</button>
                                            <button onClick={() => navigate('/notifications')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>My Notifications</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;

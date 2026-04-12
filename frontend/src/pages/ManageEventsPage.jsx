import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EventForm from '../components/EventForm';
import { eventService } from '../services/eventService';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

function ManageEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // View state: 'list', 'create', 'edit'
    const [viewState, setViewState] = useState('list');
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [eventsData, modulesData] = await Promise.all([
                eventService.getEvents(),
                adminService.getModules()
            ]);
            
            // Filter to only show events created by this user (or show all if admin)
            const myEvents = user.role === 'admin'
                ? eventsData
                : eventsData.filter(e => e.created_by == user.id);
            
            setEvents(eventsData); 
            setModules(modulesData);
        } catch (err) {
            setError('Failed to load events.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSubmit = async (formData) => {
        setFormLoading(true);
        setError(null);
        try {
            await eventService.createEvent(formData);
            setSuccessMessage('Event created successfully!');
            setViewState('list');
            fetchEvents();
        } catch (err) {
            setError(err.message || 'Error creating event');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditSubmit = async (formData) => {
        setFormLoading(true);
        setError(null);
        try {
            await eventService.updateEvent(editingEvent.id, formData);
            setSuccessMessage('Event updated successfully!');
            setEditingEvent(null);
            setViewState('list');
            fetchEvents();
        } catch (err) {
            setError(err.message || 'Error updating event');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        setError(null);
        try {
            await eventService.deleteEvent(eventId);
            setSuccessMessage('Event deleted successfully!');
            fetchEvents();
        } catch (err) {
            setError(err.message || 'Error deleting event');
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString.replace(/-/g, '/')).toLocaleString('en-GB', options);
    };

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-dark-blue)' }}>Manage Events</h1>
                        {viewState === 'list' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => { setViewState('create'); setError(null); setSuccessMessage(''); }}
                            >
                                + Create New Event
                            </button>
                        )}
                    </div>

                    {successMessage && (
                        <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    {viewState === 'list' && (
                        <div className="card">
                            {isLoading ? (
                                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>Loading events...</p>
                            ) : events.length === 0 ? (
                                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>No managed events found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--primary-dark-blue)' }}>
                                                <th style={{ padding: '1rem' }}>Event Title</th>
                                                <th style={{ padding: '1rem' }}>Type</th>
                                                <th style={{ padding: '1rem' }}>Start Time</th>
                                                <th style={{ padding: '1rem', width: '200px', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map(event => (
                                                <tr key={event.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{event.title}</td>
                                                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{event.event_type}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-color-light)', fontSize: '0.875rem' }}>{formatDateTime(event.start_time)}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                            onClick={() => {
                                                                setEditingEvent(event);
                                                                setViewState('edit');
                                                                setError(null);
                                                                setSuccessMessage('');
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderColor: '#dc2626', color: '#dc2626' }}
                                                            onClick={() => handleDelete(event.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {viewState === 'create' && (
                        <div className="card">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Create New Event</h2>
                            <EventForm
                                modules={modules}
                                onSubmit={handleCreateSubmit}
                                onCancel={() => setViewState('list')}
                                isLoading={formLoading}
                            />
                        </div>
                    )}

                    {viewState === 'edit' && editingEvent && (
                        <div className="card">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Edit Event</h2>
                            <EventForm
                                initialData={editingEvent}
                                modules={modules}
                                onSubmit={handleEditSubmit}
                                onCancel={() => { setViewState('list'); setEditingEvent(null); }}
                                isLoading={formLoading}
                            />
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

export default ManageEventsPage;

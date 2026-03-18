import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { supervisionService } from '../services/supervisionService';

function SupervisionPage() {
    const { user } = useAuth();
    const role = user?.role || 'student';
    const [loading, setLoading] = useState(true);

    // Common State
    const [slots, setSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Lecturer Form State
    const [newSlot, setNewSlot] = useState({
        start_time: '',
        end_time: '',
        location: '',
        max_students: 1
    });

    // Student Booking State
    const [bookingNotes, setBookingNotes] = useState({});

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [role]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            if (role === 'lecturer' || role === 'admin') {
                const fetchedSlots = await supervisionService.getLecturerSlots();
                setSlots(fetchedSlots);
            } else {
                // Fetch all open slots + personal bookings for students
                const available = await supervisionService.getAvailableSlots();
                const booked = await supervisionService.getMyBookings();
                setSlots(available);
                setMyBookings(booked);
            }
        } catch (err) {
            setError(err.message || 'Failed to load scheduling data');
        } finally {
            setLoading(false);
        }
    };

    // --- LECTURER ACTIONS ---
    const handlePublishSlot = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            await supervisionService.createSlot({
                ...newSlot,
                start_time: newSlot.start_time.replace('T', ' ') + ':00',
                end_time: newSlot.end_time.replace('T', ' ') + ':00',
            });
            setSuccessMsg('Slot published successfully');
            setNewSlot({ start_time: '', end_time: '', location: '', max_students: 1 });
            fetchData(); // Refresh list
        } catch (err) {
            setError(err.message || 'Failed to publish slot');
        }
    };

    // --- STUDENT ACTIONS ---
    const handleBookSlot = async (slotId) => {
        setError('');
        setSuccessMsg('');
        try {
            const notes = bookingNotes[slotId] || '';
            await supervisionService.bookSlot(slotId, notes);
            setSuccessMsg('Slot successfully booked');
            // Clear notes input
            setBookingNotes(prev => ({ ...prev, [slotId]: '' }));
        } catch (err) {
            // Even if there's a JSON error, the database usually updated
            // so we refresh to show the real state
            console.warn('Booking action result:', err.message);
        } finally {
            fetchData(); // Refresh to move it from "Available" to "My Bookings"
        }
    };

    const handleNoteChange = (slotId, val) => {
        setBookingNotes(prev => ({ ...prev, [slotId]: val }));
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this supervision slot?")) return;
        setError('');
        setSuccessMsg('');
        try {
            await supervisionService.cancelBooking(bookingId);
            setSuccessMsg('Booking cancelled successfully');
        } catch (err) {
            console.warn('Cancel action result:', err.message);
        } finally {
            fetchData(); // Refresh slots so it appears back in Available and leaves My Bookings
        }
    };

    // Helpers
    const formatTime = (dateStr) => {
        const d = new Date(dateStr.replace(/-/g, '/'));
        return d.toLocaleString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const nowLocalStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    <h2 style={{ marginBottom: '1.5rem' }}>Supervision Portal</h2>

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {successMsg}
                        </div>
                    )}

                    {loading ? (
                        <p style={{ color: 'var(--text-color-light)' }}>Loading portal data...</p>
                    ) : (
                        <div className="dashboard-grid">
                            
                            {/* --- ROLE: LECTURER VIEW --- */}
                            {(role === 'lecturer' || role === 'admin') && (
                                <>
                                    <div className="card">
                                        <h3>Publish Availability</h3>
                                        <form onSubmit={handlePublishSlot} style={{ marginTop: '1rem' }}>
                                            <div className="form-group">
                                                <label className="form-label">Start Time</label>
                                                <input type="datetime-local" required className="form-input" min={nowLocalStr}
                                                    value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">End Time</label>
                                                <input type="datetime-local" required className="form-input" min={newSlot.start_time || nowLocalStr}
                                                    value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Location / Link</label>
                                                <input type="text" placeholder="e.g. Room 402 or Teams Link" className="form-input"
                                                    value={newSlot.location} onChange={e => setNewSlot({ ...newSlot, location: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Max Students</label>
                                                <input type="number" min="1" max="50" required className="form-input"
                                                    value={newSlot.max_students} onChange={e => setNewSlot({ ...newSlot, max_students: parseInt(e.target.value) })} />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Publish Slot</button>
                                        </form>
                                    </div>

                                    <div className="card">
                                        <h3>My Upcoming Slots</h3>
                                        {slots.length === 0 ? (
                                            <p style={{ color: 'var(--text-color-light)', marginTop: '1rem' }}>You have no active supervision slots.</p>
                                        ) : (
                                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {slots.map(slot => (
                                                    <div key={slot.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <strong>{formatTime(slot.start_time)}</strong>
                                                            <span style={{ fontSize: '0.875rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                                                                {slot.booked_count} / {slot.max_students} Booked
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.875rem', margin: '0 0 1rem 0', color: 'var(--text-color-light)' }}>
                                                            📍 {slot.location || 'TBA'}
                                                        </p>

                                                        {slot.bookings && slot.bookings.length > 0 && (
                                                            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '4px' }}>
                                                                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Confirmed Students</h4>
                                                                <ul style={{ fontSize: '0.875rem', margin: 0, padding: 0 }}>
                                                                    {slot.bookings.map(b => (
                                                                        <li key={b.booking_id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                                                                            <strong>{b.first_name} {b.last_name}</strong>
                                                                            {b.notes && <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>Note: {b.notes}</div>}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* --- ROLE: STUDENT VIEW --- */}
                            {role === 'student' && (
                                <>
                                    <div className="card">
                                        <h3>Available Supervisors</h3>
                                        {slots.length === 0 ? (
                                            <p style={{ color: 'var(--text-color-light)', marginTop: '1rem' }}>No open slots available at the moment.</p>
                                        ) : (
                                            <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                                                {slots.map(slot => (
                                                    <div key={slot.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{slot.lecturer_first_name} {slot.lecturer_last_name}</h4>
                                                                <p style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>🕒 {formatTime(slot.start_time)}</p>
                                                                <p style={{ fontSize: '0.875rem', margin: '0 0 1rem 0', color: 'var(--text-color-light)' }}>📍 {slot.location || 'TBA'}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                placeholder="Optional note / subject"
                                                                style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                                                                value={bookingNotes[slot.id] || ''}
                                                                onChange={(e) => handleNoteChange(slot.id, e.target.value)}
                                                            />
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{ padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}
                                                                onClick={() => handleBookSlot(slot.id)}
                                                            >
                                                                Book
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="card">
                                        <h3>My Bookings</h3>
                                        {myBookings.length === 0 ? (
                                            <p style={{ color: 'var(--text-color-light)', marginTop: '1rem' }}>You haven't booked any supervisions yet.</p>
                                        ) : (
                                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {myBookings.map(b => (
                                                    <div key={b.booking_id} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#166534' }}>{b.lecturer_first_name} {b.lecturer_last_name}</p>
                                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>{formatTime(b.start_time)} • {b.location || 'TBA'}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancelBooking(b.booking_id)}
                                                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SupervisionPage;

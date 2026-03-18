import React, { useState } from 'react';

function CalendarGrid({ events }) {
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Simplistic monthly view for current month
    // Real implementation might allow month toggles, but this satisfies Timebox 2
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const monthName = today.toLocaleString('default', { month: 'long' });

    // Create array of day objects
    const days = [];

    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days in month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const closeModal = () => setSelectedEvent(null);

    return (
        <div style={styles.outerContainer}>
            <div style={styles.calendarHeader}>
                <h3 style={styles.monthYearTitle}>{monthName} {year}</h3>
                <div style={styles.todayIndicator}>
                    <span style={styles.todayBadgeSmall}></span> Today: {today.toLocaleDateString()}
                </div>
            </div>

            <div style={styles.container}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={styles.headerCell}>{day}</div>
                ))}

                {days.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} style={styles.emptyCell}></div>;

                    // Find events for this day
                    const dayEvents = events.filter(e => {
                        const eventDate = new Date(e.start_time);
                        return eventDate.getFullYear() === date.getFullYear() &&
                            eventDate.getMonth() === date.getMonth() &&
                            eventDate.getDate() === date.getDate();
                    });

                    return (
                        <div key={date.toISOString()} style={styles.cell}>
                            <div style={styles.dateNumber}>
                                <span style={date.toDateString() === today.toDateString() ? styles.todayBadge : {}}>
                                    {date.getDate()}
                                </span>
                            </div>
                            <div style={styles.eventsContainer}>
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        style={{
                                            ...styles.eventItem,
                                            backgroundColor: event.type === 'supervision_booking' ? '#ecfdf5' : 'var(--secondary-blue)',
                                            color: event.type === 'supervision_booking' ? '#065f46' : 'var(--white)',
                                            borderLeft: event.type === 'supervision_booking' ? '4px solid #10b981' : '4px solid var(--primary-action-blue)',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        {event.type === 'supervision_booking' ? '📅 ' : ''}{event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{
                            ...styles.modalHeader,
                            backgroundColor: selectedEvent.type === 'supervision_booking' ? '#ecfdf5' : 'var(--secondary-blue)',
                            borderBottom: selectedEvent.type === 'supervision_booking' ? '3px solid #10b981' : '3px solid var(--primary-action-blue)',
                            color: selectedEvent.type === 'supervision_booking' ? '#065f46' : 'var(--white)'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                                {selectedEvent.type === 'supervision_booking' ? '📅 ' : ''}{selectedEvent.title}
                            </h2>
                            <button onClick={closeModal} style={styles.closeButton}>&times;</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.detailRow}>
                                <strong>Type:</strong> 
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    marginLeft: '8px',
                                    backgroundColor: selectedEvent.type === 'supervision_booking' ? '#10b981' : 'var(--primary-action-blue)',
                                    color: 'white'
                                }}>
                                    {selectedEvent.type === 'supervision_booking' ? 'Supervision Booking' : 'Module Event'}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Date:</strong> {selectedEvent.date || new Date(selectedEvent.start_time).toLocaleDateString()}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Time:</strong> {selectedEvent.time ? selectedEvent.time.slice(0, 5) : new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Location:</strong> {selectedEvent.location || 'TBA'}
                            </div>
                            {selectedEvent.description && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Description:</strong>
                                    <p style={styles.modalDescription}>{selectedEvent.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    outerContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid var(--border-color)',
    },
    monthYearTitle: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#1e293b',
        textTransform: 'capitalize',
        letterSpacing: '-0.025em',
    },
    todayIndicator: {
        fontSize: '0.875rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
        backgroundColor: '#fff',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    todayBadgeSmall: {
        width: '10px',
        height: '10px',
        backgroundColor: 'var(--primary-action-blue)',
        borderRadius: '50%',
        display: 'inline-block',
    },
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: 'var(--border-color)',
        overflow: 'hidden',
    },
    headerCell: {
        backgroundColor: 'var(--white)',
        color: '#475569',
        padding: '1rem 0.75rem',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--border-color)',
    },
    cell: {
        backgroundColor: 'var(--white)',
        minHeight: '120px',
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: '#f8fafc',
        }
    },
    emptyCell: {
        backgroundColor: '#f1f5f9',
        minHeight: '120px',
    },
    dateNumber: {
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: '0.75rem',
        textAlign: 'right',
        fontSize: '0.875rem',
    },
    todayBadge: {
        backgroundColor: 'var(--primary-action-blue)',
        color: 'var(--white)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
    },
    eventsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        flexGrow: 1,
    },
    eventItem: {
        fontSize: '0.7rem',
        fontWeight: '600',
        padding: '0.375rem 0.625rem',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'transform 0.1s ease, filter 0.1s ease',
        '&:hover': {
            transform: 'translateY(-1px)',
            filter: 'brightness(95%)',
        }
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    modalHeader: {
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        background: 'rgba(0,0,0,0.1)',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'currentColor',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s ease',
    },
    modalBody: {
        padding: '2rem',
    },
    detailRow: {
        marginBottom: '1rem',
        fontSize: '0.925rem',
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
    },
    modalDescription: {
        fontSize: '0.875rem',
        lineHeight: '1.6',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '0.5rem',
        border: '1px solid #e2e8f0',
    }
};

export default CalendarGrid;

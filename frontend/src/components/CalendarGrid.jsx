import React from 'react';

function CalendarGrid({ events }) {
    // Simplistic monthly view for current month
    // Real implementation might allow month toggles, but this satisfies Timebox 2
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

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

    return (
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
                                <div key={event.id} style={styles.eventItem}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: 'var(--border-color)', // acts as border color since we have 1px gap
        borderRadius: '8px',
        overflow: 'hidden',
    },
    headerCell: {
        backgroundColor: 'var(--white)',
        color: 'var(--text-color)',
        padding: '0.75rem',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--border-color)',
    },
    cell: {
        backgroundColor: 'var(--white)',
        minHeight: '120px',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
    },
    emptyCell: {
        backgroundColor: '#FAFAFA',
        minHeight: '120px',
    },
    dateNumber: {
        fontWeight: '600',
        color: 'var(--text-color-light)',
        marginBottom: '0.5rem',
        textAlign: 'right'
    },
    todayBadge: {
        backgroundColor: 'var(--primary-action-blue)',
        color: 'var(--white)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
    eventsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        flexGrow: 1,
        overflowY: 'auto'
    },
    eventItem: {
        backgroundColor: 'var(--secondary-blue)',
        color: 'var(--white)',
        fontSize: '0.75rem',
        fontWeight: '500',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        borderLeft: '3px solid var(--primary-action-blue)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }
};

export default CalendarGrid;

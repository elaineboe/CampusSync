import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();

    // Helper to determine if a route is currently active
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    // Safe fallback if user object isn't completely loaded yet
    const role = user?.role || 'student';

    return (
        <aside className="sidebar-vertical">
            <nav className="nav-vertical">
                <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}>Dashboard</Link>
                <Link to="/calendar" style={{ ...styles.link, ...(isActive('/calendar') ? styles.activeLink : {}) }}>Calendar</Link>
                <Link to="/notifications" style={{ ...styles.link, ...(isActive('/notifications') ? styles.activeLink : {}) }}>Notifications</Link>
                <Link to="/supervision" style={{ ...styles.link, ...(isActive('/supervision') ? styles.activeLink : {}) }}>Supervision</Link>

                {(role === 'lecturer' || role === 'admin') && (
                    <>
                        <Link to="/manage-events" style={{ ...styles.link, ...(isActive('/manage-events') ? styles.activeLink : {}) }}>Manage Events</Link>
                        <Link to="/students" style={{ ...styles.link, ...(isActive('/students') ? styles.activeLink : {}) }}>Students</Link>
                    </>
                )}

                {role === 'admin' && (
                    <>
                        <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/calendar-integration') ? styles.activeLink : {}) }}>Module Assignment</Link>
                        <Link to="/admin/users" style={{ ...styles.link, ...(isActive('/admin/users') ? styles.activeLink : {}) }}>User Management</Link>
                        <Link to="/admin/calendar-integration" style={{ ...styles.link, ...(isActive('/admin/calendar-integration') ? styles.activeLink : {}) }}>Calendar Integration</Link>
                    </>
                )}
            </nav>
        </aside>
    );
}

const styles = {
    link: {
        padding: '0.75rem 1rem',
        color: 'var(--text-color-light)',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.875rem',
        borderRadius: '6px',
        display: 'block', // Ensuring it's a block for vertical stacking
        transition: 'all 0.2s ease',
    },
    activeLink: {
        backgroundColor: 'var(--primary-action-blue)',
        color: 'var(--white)',
        fontWeight: '600',
    }
};

export default Sidebar;

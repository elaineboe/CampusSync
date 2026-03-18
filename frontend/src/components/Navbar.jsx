import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={styles.header}>
            <div style={styles.logoContainer}>
                <Logo width={40} height={40} />
                <Link to="/dashboard" style={styles.logoText}>CampusSync</Link>
            </div>
            <nav style={styles.nav}>
                {/* Removed Home, About, Support links as per request */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-dark-blue)' }}>{user.first_name || user.username}</span>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.5rem 1.25rem' }}>Login</Link>
                )}
            </nav>
        </header>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 2rem',
        backgroundColor: 'var(--white)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        height: '70px',
        position: 'relative',
        zIndex: 10
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--primary-dark-blue)',
        textDecoration: 'none',
        letterSpacing: '-0.02em',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
    },
    navLink: {
        color: 'var(--text-color-light)',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.875rem',
        transition: 'color 0.2s',
    }
};

export default Navbar;

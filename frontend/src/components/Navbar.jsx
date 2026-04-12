import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname.startsWith(path);
    const role = user?.role || 'student';

    return (
        <header style={styles.header}>
            <div style={styles.logoContainer}>
                <Logo width={40} height={40} />
                <Link to="/dashboard" style={styles.logoText}>CampusSync</Link>
            </div>

            {/* Hamburger Button for Mobile */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                style={styles.hamburger}
                aria-label="Toggle menu"
            >
                <div style={{...styles.bar, transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'}}></div>
                <div style={{...styles.bar, opacity: isMenuOpen ? 0 : 1}}></div>
                <div style={{...styles.bar, transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'}}></div>
            </button>

            <nav style={{
                ...styles.nav,
                display: user ? (isMenuOpen ? 'flex' : 'none') : 'flex',
            }} className={isMenuOpen ? 'nav-open' : ''}>
                {user && (
                    <>
                        {/* Mobile-only consolidated links */}
                        <div className="mobile-only-nav" style={{ display: 'none', flexDirection: 'column', gap: '0.5rem', width: '100%', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <Link to="/dashboard" style={{...styles.mobileLink, fontWeight: isActive('/dashboard') ? '700' : '400'}}>Dashboard</Link>
                            <Link to="/calendar" style={{...styles.mobileLink, fontWeight: isActive('/calendar') ? '700' : '400'}}>Calendar</Link>
                            <Link to="/notifications" style={{...styles.mobileLink, fontWeight: isActive('/notifications') ? '700' : '400'}}>Notifications</Link>
                            <Link to="/supervision" style={{...styles.mobileLink, fontWeight: isActive('/supervision') ? '700' : '400'}}>Supervision</Link>
                            
                            {(role === 'lecturer' || role === 'admin') && (
                                <>
                                    <Link to="/manage-events" style={{...styles.mobileLink, fontWeight: isActive('/manage-events') ? '700' : '400'}}>Manage Events</Link>
                                    <Link to="/students" style={{...styles.mobileLink, fontWeight: isActive('/students') ? '700' : '400'}}>Students</Link>
                                </>
                            )}
                            {role === 'admin' && (
                                <>
                                    <Link to="/admin" style={{...styles.mobileLink, fontWeight: (isActive('/admin') && !isActive('/admin/users')) ? '700' : '400'}}>Module Assignment</Link>
                                    <Link to="/admin/users" style={{...styles.mobileLink, fontWeight: isActive('/admin/users') ? '700' : '400'}}>User Management</Link>
                                </>
                            )}
                        </div>

                        <div style={styles.userSection} className="user-section-nav">
                            <span style={styles.userName}>{user.first_name || user.username}</span>
                            <button onClick={handleLogout} className="btn btn-outline" style={styles.logoutBtn}>Logout</button>
                        </div>
                    </>
                )}
            </nav>
            
            {/* Mobile Menu Overlay CSS injection or Style tag */}
            <style>{`
                @media (max-width: 768px) {
                    header { padding: 0.75rem 1rem !important; }
                    nav {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        width: 100%;
                        background: white;
                        flex-direction: column;
                        padding: 1.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                        z-index: 100;
                        display: ${isMenuOpen ? 'flex' : 'none'} !important;
                    }
                    .mobile-only-nav {
                        display: flex !important;
                    }
                    .user-section-nav {
                        width: 100%;
                        justify-content: space-between !important;
                    }
                    .sidebar-horizontal {
                        display: none !important;
                    }
                }
                @media (min-width: 769px) {
                    nav { display: flex !important; }
                    button[aria-label="Toggle menu"] { display: none !important; }
                }
            `}</style>
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
        zIndex: 50
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
        gap: '1.5rem'
    },
    hamburger: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        padding: '5px',
        cursor: 'pointer',
        zIndex: 60
    },
    bar: {
        width: '25px',
        height: '3px',
        backgroundColor: 'var(--primary-dark-blue)',
        borderRadius: '2px',
        transition: 'all 0.3s ease'
    },
    userSection: {
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem'
    },
    userName: {
        fontSize: '0.875rem', 
        fontWeight: '600', 
        color: 'var(--primary-dark-blue)'
    },
    logoutBtn: {
        padding: '0.4rem 1rem', 
        fontSize: '0.875rem'
    },
    mobileLink: {
        padding: '0.75rem 0',
        color: 'var(--text-color)',
        textDecoration: 'none',
        fontSize: '1rem',
        borderBottom: '1px solid #f0f0f0'
    }
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.register({
                username: email.split('@')[0], // Generate a simple username from email
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role
            });
            // On success, redirect to login page
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.message || 'Failed to register account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation Bar (Static for Registration) */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2rem', backgroundColor: 'var(--white)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Logo width={40} height={40} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-dark-blue)' }}>CampusSync</span>
                </div>
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-color-light)', fontWeight: '500', fontSize: '0.875rem' }}>Home</span>
                    <span style={{ color: 'var(--text-color-light)', fontWeight: '500', fontSize: '0.875rem' }}>About</span>
                    <span style={{ color: 'var(--text-color-light)', fontWeight: '500', fontSize: '0.875rem' }}>Support</span>
                    <Link to="/login" className="btn btn-outline" style={{ marginLeft: '1rem', padding: '0.5rem 1.25rem', textDecoration: 'none' }}>Login</Link>
                </nav>
            </header>

            {/* Register Form Container centered on screen */}
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2.5rem' }}>

                    {/* Header Logo & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>CampusSync</h1>
                        <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.1em' }}>REGISTER</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="form-label">FIRST NAME</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="form-label">LAST NAME</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">EMAIL</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your university email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">PASSWORD</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                            <label className="form-label">ACCOUNT TYPE</label>
                            <select
                                className="form-input"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ backgroundColor: 'var(--white)', cursor: 'pointer' }}
                            >
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer / Teacher</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-outline"
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '1.5rem' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Register Account'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-color-light)' }}>Already have an account? </span>
                            <Link to="/login" style={{ textDecoration: 'underline', fontSize: '0.875rem', color: 'var(--text-color)', fontWeight: '600' }}>Login here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;

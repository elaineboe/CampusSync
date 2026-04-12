import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Check if we have a success message from registration redirect
    const successMessage = location.state?.message || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Note: Our wireframe uses 'email' but our backend currently receives 'username' for the stub
            // We will update the backend to support 'email' logging in. For now, sending email as the primary login identifier.
            const response = await authService.login(email, password);
            login(response.user, response.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation Bar (Static for Login) */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2rem', backgroundColor: 'var(--white)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Logo width={40} height={40} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-dark-blue)' }}>CampusSync</span>
                </div>
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {/* Navigation links removed as requested */}
                </nav>
            </header>

            {/* Login Form Container centered on screen */}
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2.5rem' }}>

                    {/* Header Logo & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>CampusSync</h1>
                        <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.1em' }}>LOGIN</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {successMessage && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>{successMessage}</div>}
                        {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">EMAIL</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your university email"
                                style={{ backgroundColor: '#eef2ff', border: '1px solid #e2e8f0' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">PASSWORD</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                style={{ backgroundColor: '#eef2ff', border: '1px solid #e2e8f0' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-outline"
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary-action-blue)', borderColor: 'var(--primary-action-blue)' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

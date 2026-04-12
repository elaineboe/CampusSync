import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/adminService';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    
    // Create User Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        role: 'student'
    });
    const [createError, setCreateError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role: ' + err.message);
        }
    };

    const handleStatusToggle = async (user) => {
        if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.first_name} ${user.last_name}?`)) return;

        try {
            const newStatus = !user.is_active;
            await adminService.updateUserStatus(user.id, newStatus);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const handleCreateChange = (e) => {
        setNewUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateError(null);
        try {
            await adminService.createUser(newUserData);
            setIsCreateOpen(false);
            setNewUserData({ first_name: '', last_name: '', email: '', username: '', password: '', role: 'student' });
            fetchUsers();
        } catch (err) {
            setCreateError(err.message || 'Failed to create user');
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        const fullString = `${user.first_name} ${user.last_name} ${user.email} ${user.role}`.toLowerCase();
        return fullString.includes(searchQuery.toLowerCase());
    }) : [];

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    // Ensure currentPage is not out of bounds after filtering
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-dark-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            User Management
                        </h1>
                    </div>

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        
                        {/* Header Banner inside card matching wireframe logic */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <input 
                                type="text"
                                placeholder="SEARCH USERS"
                                className="form-input"
                                style={{ width: '300px', marginBottom: '0', height: '40px', flex: '1 1 auto' }}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button 
                                className="btn btn-primary" 
                                style={{ backgroundColor: 'black', color: 'white', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.875rem', height: '40px', padding: '0 1.5rem', flex: '0 0 auto' }}
                                onClick={() => setIsCreateOpen(!isCreateOpen)}
                            >
                                {isCreateOpen ? 'CANCEL' : 'ADD USER'}
                            </button>
                        </div>

                        {/* Add User Dropdown Panel */}
                        {isCreateOpen && (
                            <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark-blue)' }}>Create New Account</h3>
                                {createError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{createError}</div>}
                                <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">First Name</label>
                                        <input type="text" name="first_name" className="form-input" required value={newUserData.first_name} onChange={handleCreateChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">Last Name</label>
                                        <input type="text" name="last_name" className="form-input" required value={newUserData.last_name} onChange={handleCreateChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" className="form-input" required value={newUserData.email} onChange={handleCreateChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">Username</label>
                                        <input type="text" name="username" className="form-input" required value={newUserData.username} onChange={handleCreateChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">Initial Password</label>
                                        <input type="password" name="password" className="form-input" required minLength={6} value={newUserData.password} onChange={handleCreateChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label">Role</label>
                                        <select name="role" className="form-input" value={newUserData.role} onChange={handleCreateChange}>
                                            <option value="student">Student</option>
                                            <option value="lecturer">Lecturer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'black', color: 'white' }}>CREATE ACCOUNT</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isLoading ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>Loading users...</p>
                        ) : (
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid black', backgroundColor: 'var(--white)' }}>
                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>Name</th>
                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>Email</th>
                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>Role</th>
                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>Status</th>
                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-light)' }}>No matching users found.</td>
                                            </tr>
                                        ) : (
                                            currentUsers.map(user => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                                                    <td style={{ padding: '1rem 1.5rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500' }}>
                                                        {user.first_name} {user.last_name}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                                                        {user.email}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <select 
                                                            className="form-input" 
                                                            style={{ height: '32px', padding: '0 0.5rem', width: '120px', fontSize: '0.875rem', textTransform: 'uppercase' }}
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        >
                                                            <option value="student">STUDENT</option>
                                                            <option value="lecturer">LECTURER</option>
                                                            <option value="admin">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', color: user.is_active ? 'inherit' : '#dc2626' }}>
                                                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                        <button 
                                                            className="btn-outline"
                                                            style={{ 
                                                                padding: '0.25rem 0.75rem', 
                                                                fontSize: '0.75rem', 
                                                                textTransform: 'uppercase',
                                                                borderColor: 'black',
                                                                color: 'black'
                                                            }}
                                                            onClick={() => handleStatusToggle(user)}
                                                        >
                                                            {user.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                                    <button 
                                        className="btn-outline" 
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-color-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        className="btn-outline" 
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}

export default UserManagementPage;

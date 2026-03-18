import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/adminService';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);
    const [assignments, setAssignments] = useState([]);
    
    // Create Module State
    const [newModuleCode, setNewModuleCode] = useState('');
    const [newModuleName, setNewModuleName] = useState('');
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    // Assign Module State
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedModules, setSelectedModules] = useState([]);
    const [assignError, setAssignError] = useState('');
    const [assignSuccess, setAssignSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersData, modulesData, assignmentsData] = await Promise.all([
                adminService.getUsers(),
                adminService.getModules(),
                adminService.getAssignments()
            ]);
            setUsers(usersData);
            setModules(modulesData);
            setAssignments(assignmentsData);
        } catch (err) {
            console.error("Failed to load admin data", err);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        setCreateError('');
        setCreateSuccess('');
        try {
            await adminService.createModule({
                module_code: newModuleCode,
                module_name: newModuleName
            });
            setCreateSuccess(`Module ${newModuleCode} created successfully!`);
            setNewModuleCode('');
            setNewModuleName('');
            fetchData();
        } catch (err) {
            setCreateError(err.message);
        }
    };

    const handleDeleteModule = async (moduleId, moduleCode) => {
        if (!window.confirm(`Are you sure you want to completely delete module ${moduleCode}? This will also remove all assignments for this module.`)) return;
        
        try {
            await adminService.deleteModule(moduleId);
            // Remove from selected modules if it was selected
            setSelectedModules(prev => prev.filter(id => id !== moduleId));
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleModuleCheckbox = (moduleId) => {
        setSelectedModules(prev => 
            prev.includes(moduleId) 
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleAssign = async () => {
        setAssignError('');
        setAssignSuccess('');
        
        if (!selectedUser) {
            setAssignError("Please select a user first.");
            return;
        }
        if (selectedModules.length === 0) {
            setAssignError("Please select at least one module.");
            return;
        }

        try {
            const res = await adminService.assignModules(selectedUser, selectedModules);
            setAssignSuccess(res.message);
            setSelectedUser('');
            setSelectedModules([]);
            fetchData();
        } catch (err) {
            setAssignError(err.message);
        }
    };

    const handleRemoveAssignment = async (userId, moduleId) => {
        if (!window.confirm("Are you sure you want to remove this assignment?")) return;
        try {
            await adminService.removeAssignment(userId, moduleId);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    <h2 style={{ marginBottom: '2rem', textTransform: 'uppercase' }}>Module Assignment</h2>

                    {/* Section 1: Create Module (Not strictly in wireframe but logically required to populate the list) */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1rem' }}>Create New Module</h3>
                        {createError && <div className="error-message">{createError}</div>}
                        {createSuccess && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{createSuccess}</div>}
                        <form onSubmit={handleCreateModule} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                <label className="form-label">Module Code (e.g. CS101)</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={newModuleCode} 
                                    onChange={e => setNewModuleCode(e.target.value.toUpperCase())} 
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 2 }}>
                                <label className="form-label">Module Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={newModuleName} 
                                    onChange={e => setNewModuleName(e.target.value)} 
                                />
                            </div>
                            <button type="submit" className="btn" style={{ padding: '0.75rem 2rem' }}>CREATE</button>
                        </form>
                    </div>

                    {/* Section 2: Assign Modules (Matches Wireframe) */}
                    {assignError && <div className="error-message">{assignError}</div>}
                    {assignSuccess && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{assignSuccess}</div>}
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <select 
                            className="form-input" 
                            style={{ maxWidth: '300px' }}
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">SELECT USER</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.role.toUpperCase()})
                                </option>
                            ))}
                        </select>
                        <button className="btn" style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem' }} onClick={handleAssign}>
                            ASSIGN
                        </button>
                    </div>

                    {/* Wireframe Checklist Box */}
                    <div className="card" style={{ padding: '1rem', marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '0' }}>
                        {modules.length === 0 ? (
                            <p style={{ margin: '1rem', color: '#666' }}>No modules exist yet. Create one above.</p>
                        ) : (
                            modules.map(mod => (
                                <div key={mod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            id={`mod-${mod.id}`}
                                            checked={selectedModules.includes(mod.id)}
                                            onChange={() => handleModuleCheckbox(mod.id)}
                                            style={{ width: '18px', height: '18px', marginRight: '1rem', cursor: 'pointer' }}
                                        />
                                        <label htmlFor={`mod-${mod.id}`} style={{ cursor: 'pointer', textTransform: 'uppercase', fontWeight: '500' }}>
                                            {mod.module_code} - {mod.module_name}
                                        </label>
                                    </div>
                                    <button 
                                        className="btn-outline" 
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#dc2626' }}
                                        onClick={() => handleDeleteModule(mod.id, mod.module_code)}
                                    >
                                        DELETE
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Current Assignments Table */}
                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1rem' }}>CURRENT ASSIGNMENTS</h3>
                    <div className="card" style={{ padding: 0, borderRadius: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1rem' }}>User Name</th>
                                    <th style={{ padding: '1rem' }}>Module Name</th>
                                    <th style={{ padding: '1rem', width: '100px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No assignments found.</td>
                                    </tr>
                                ) : (
                                    assignments.map((assignment, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', textTransform: 'uppercase' }}>
                                                {assignment.first_name} {assignment.last_name}
                                            </td>
                                            <td style={{ padding: '1rem', textTransform: 'uppercase' }}>
                                                {assignment.module_code} - {assignment.module_name}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button 
                                                    className="btn-outline" 
                                                    style={{ padding: '0.25rem 1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}
                                                    onClick={() => handleRemoveAssignment(assignment.user_id, assignment.module_id)}
                                                >
                                                    REMOVE
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminPage;

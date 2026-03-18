import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

function StudentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentModules, setStudentModules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLecturerModules = async () => {
            try {
                const data = await adminService.getModules();
                setModules(data);
            } catch (err) {
                console.error("Failed to fetch modules", err);
            }
        };
        fetchLecturerModules();
    }, []);

    const handleModuleChange = async (moduleId) => {
        setSelectedModule(moduleId);
        setSelectedStudent('');
        setStudentInfo(null);
        if (!moduleId) {
            setStudents([]);
            return;
        }
        try {
            const data = await adminService.getStudentsByModule(moduleId);
            setStudents(data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        if (!studentId) {
            setStudentInfo(null);
            return;
        }

        const info = students.find(s => String(s.id) === String(studentId));
        setStudentInfo(info);
        setLoading(true);

        try {
            // Fetch student's modules for the banner
            const mods = await adminService.getStudentModules(studentId);
            setStudentModules(mods);
        } catch (err) {
            console.error("Failed to fetch student data", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ margin: 0, textTransform: 'uppercase' }}>Student Schedule - Lecturer</h2>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <select 
                                className="form-input" 
                                style={{ width: '200px' }}
                                value={selectedModule}
                                onChange={(e) => handleModuleChange(e.target.value)}
                            >
                                <option value="">SELECT MODULE</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.module_code} - {m.module_name}</option>
                                ))}
                            </select>

                            <select 
                                className="form-input" 
                                style={{ width: '200px' }}
                                value={selectedStudent}
                                onChange={(e) => handleStudentChange(e.target.value)}
                                disabled={!selectedModule}
                            >
                                <option value="">SELECT STUDENT</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {studentInfo ? (
                        <>
                            {/* Student Info Banner */}
                            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '2px solid #000', borderRadius: '0' }}>
                                <div>
                                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {studentInfo.first_name} {studentInfo.last_name}
                                    </h1>
                                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Student ID: [{studentInfo.username}]</p>
                                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Email: {studentInfo.email}</p>
                                    
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Enrolled Modules</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {studentModules.map(m => (
                                                <span key={m.id} style={{ padding: '0.25rem 0.75rem', border: '1px solid #000', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {m.module_code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                 <button 
                                    className="btn-outline" 
                                    style={{ padding: '0.5rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}
                                    onClick={() => navigate(`/calendar?studentId=${studentInfo.id}`)}
                                >
                                    View Full Calendar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed #ccc' }}>
                            <p style={{ fontSize: '1.2rem', color: '#666' }}>Please select a module and a student to view their schedule.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default StudentsPage;

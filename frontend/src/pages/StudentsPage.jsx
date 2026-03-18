import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import { adminService } from '../services/adminService';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

function StudentsPage() {
    const { user } = useAuth();
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentModules, setStudentModules] = useState([]);
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const calendarRef = useRef(null);

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
        setEvents([]);
        setUpcomingEvents([]);
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
            setEvents([]);
            setUpcomingEvents([]);
            return;
        }

        setLoading(true);
        try {
            // Task 2: Profile & Modules
            const studentData = await adminService.getStudentModules(studentId);
            setStudentModules(studentData.modules);
            setStudentInfo(studentData.profile);

            // Task 3: Full Calendar & Upcoming
            const calendarData = await eventService.getStudentFullCalendar(studentId);
            setEvents(calendarData.allEvents);
            setUpcomingEvents(calendarData.upcomingEvents);
        } catch (err) {
            console.error("Failed to fetch student data", err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToCalendar = () => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                                    onClick={scrollToCalendar}
                                >
                                    View Full Calendar
                                </button>
                            </div>

                            <h3 style={{ textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                Calendar for {studentInfo.first_name} {studentInfo.last_name}
                            </h3>

                            <div ref={calendarRef} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                {/* Calendar View */}
                                <div className="card" style={{ padding: 0, borderRadius: 0, border: '1px solid #000', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                                        <span style={{ fontWeight: 'bold' }}>SEARCH BAR</span>
                                        <span style={{ fontWeight: 'bold' }}>MODULE FILTER ▼</span>
                                    </div>
                                    {loading ? (
                                        <div style={{ padding: '4rem', textAlign: 'center' }}>Loading calendar...</div>
                                    ) : (
                                        <CalendarGrid events={events} />
                                    )}
                                </div>

                                {/* Upcoming Events */}
                                <div>
                                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>Upcoming Events</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {upcomingEvents.length === 0 ? (
                                            <p style={{ color: '#666', fontStyle: 'italic' }}>No upcoming events.</p>
                                        ) : (
                                            upcomingEvents.map((ev, idx) => (
                                                <div key={ev.id || idx} style={{ padding: '1rem', border: '1px solid #000' }}>
                                                    <div style={{ height: '12px', background: '#eee', marginBottom: '8px', width: '80%' }}></div>
                                                    <div style={{ height: '8px', background: '#f5f5f5', width: '40%' }}></div>
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{ev.title}</p>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#666' }}>{new Date(ev.start_time).toLocaleDateString()} {new Date(ev.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
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

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import { adminService } from '../services/adminService';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

function StudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    // Student Detail State (Calendar View)
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentModules, setStudentModules] = useState([]);
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const calendarSectionRef = useRef(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            // Using the unified users endpoint which is now filtered for lecturers
            const data = await adminService.getUsers();
            // Filter to only students
            setStudents(Array.isArray(data) ? data.filter(u => u.role === 'student') : []);
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewSchedule = async (student) => {
        setSelectedStudent(student);
        setIsCalendarLoading(true);
        setEvents([]);
        setUpcomingEvents([]);

        try {
            // Step 1: Fetch Profile & Modules (Task 2 logic)
            const studentData = await adminService.getStudentModules(student.id);
            setStudentModules(studentData.modules);
            
            // Step 2: Fetch Multi-Calendar (Task 3 logic)
            const calendarData = await eventService.getStudentFullCalendar(student.id);
            setEvents(calendarData.allEvents);
            setUpcomingEvents(calendarData.upcomingEvents);

            // Scroll to calendar
            setTimeout(() => {
                calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error("Failed to load student schedule", err);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const fullString = `${s.first_name} ${s.last_name} ${s.email} ${s.username}`.toLowerCase();
        return fullString.includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
    const startIndex = (currentPage - 1) * studentsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', textTransform: 'uppercase', color: 'var(--primary-dark-blue)' }}>
                        Students Schedule
                    </h1>

                    {/* Table View (Reusing Admin component rendering logic) */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <input 
                                type="text"
                                placeholder="SEARCH STUDENTS"
                                className="form-input"
                                style={{ width: '300px', marginBottom: '0', height: '40px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid black', backgroundColor: '#f8fafc' }}>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Name</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Student ID</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Email</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading students...</td></tr>
                                    ) : currentStudents.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No students found.</td></tr>
                                    ) : (
                                        currentStudents.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                                                <td style={{ padding: '1rem 1.5rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500' }}>{s.first_name} {s.last_name}</td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{s.username}</td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{s.email}</td>
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
                                                        onClick={() => handleViewSchedule(s)}
                                                    >
                                                        VIEW SCHEDULE
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                            <button 
                                className="btn-outline" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                PREVIOUS
                            </button>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-color-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                                PAGE {currentPage} OF {totalPages}
                            </span>
                            <button 
                                className="btn-outline" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                NEXT
                            </button>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    {selectedStudent && (
                        <div ref={calendarSectionRef} style={{ animation: 'fadeIn 0.5s ease-in', marginTop: '3rem' }}>
                            <h2 style={{ textTransform: 'uppercase', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                Schedule for {selectedStudent.first_name} {selectedStudent.last_name}
                            </h2>

                             <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #000', borderRadius: '0', backgroundColor: '#f8fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                                        <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>ID: {selectedStudent.username}</p>
                                        <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>EMAIL: {selectedStudent.email}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Enrolled Modules</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {studentModules.map(m => (
                                                <span key={m.id} style={{ padding: '0.25rem 0.75rem', border: '1px solid #000', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#fff' }}>
                                                    {m.module_code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                <div className="card" style={{ padding: 0, borderRadius: 0, border: '1px solid #000', overflow: 'hidden' }}>
                                    {isCalendarLoading ? (
                                        <div style={{ padding: '4rem', textAlign: 'center' }}>Loading calendar data...</div>
                                    ) : (
                                        <CalendarGrid events={events} />
                                    )}
                                </div>

                                <div>
                                    <h3 style={{ textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>Upcoming Events</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {upcomingEvents.length === 0 ? (
                                            <p style={{ color: '#666', fontStyle: 'italic' }}>No upcoming events.</p>
                                        ) : (
                                            upcomingEvents.map((ev, idx) => (
                                                <div key={ev.id || idx} style={{ 
                                                    padding: '1rem', 
                                                    border: '1px solid #000', 
                                                    backgroundColor: ev.type === 'supervision_booking' ? '#ecfdf5' : '#fff',
                                                    borderLeft: ev.type === 'supervision_booking' ? '5px solid #10b981' : '1px solid #000',
                                                    animation: 'fadeIn 0.3s ease-out'
                                                }}>
                                                    <p style={{ margin: '0', fontSize: '0.85rem', fontWeight: 'bold', color: ev.type === 'supervision_booking' ? '#065f46' : 'inherit' }}>
                                                        {ev.type === 'supervision_booking' ? '📅 ' : ''}{ev.title}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: ev.type === 'supervision_booking' ? '#065f46' : '#666' }}>
                                                        {ev.date} {ev.time ? ev.time.slice(0, 5) : ''}
                                                    </p>
                                                    {ev.location && <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', fontStyle: 'italic', color: ev.type === 'supervision_booking' ? '#065f46' : '#666' }}>{ev.location}</p>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default StudentsPage;

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import { eventService } from '../services/eventService';
import { supervisionService } from '../services/supervisionService';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

function CalendarPage() {
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const studentId = queryParams.get('studentId');

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetStudentInfo, setTargetStudentInfo] = useState(null);

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [moduleMap, setModuleMap] = useState({});

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return; // Wait for auth context

            setLoading(true);
            try {
                // Determine whose calendar we are fetching
                const isViewingOther = studentId && (user.role === 'lecturer' || user.role === 'admin');
                const fetchId = isViewingOther ? studentId : null;

                // Unified endpoint handles both academic events and supervision (bookings or hosted)
                const calendarData = await eventService.getStudentFullCalendar(fetchId);
                
                if (isViewingOther) {
                    // Still need student info for the page header
                    try {
                        const allUsers = await adminService.getUsers();
                        const info = allUsers.find(u => String(u.id) === String(fetchId));
                        setTargetStudentInfo(info);
                    } catch (err) {
                        console.error("Failed to load target student info", err);
                    }
                }

                setEvents(calendarData.allEvents);
            } catch (error) {
                console.error("Failed to fetch unified events", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchModules = async () => {
            if (!user) return;
            try {
                const modules = await adminService.getModules();
                const map = {};
                modules.forEach(m => {
                    map[m.id] = `${m.module_code} - ${m.module_name}`;
                });
                setModuleMap(map);
            } catch (err) {
                console.error("Failed to load modules for filter names", err);
            }
        };

        fetchEvents();
        fetchModules();
    }, [user, studentId]);

    // Derive unique modules and types for dropdown options
    const uniqueModules = useMemo(() => {
        const modules = events.map(e => e.module_id).filter(Boolean);
        return [...new Set(modules)];
    }, [events]);

    const uniqueTypes = useMemo(() => {
        const types = events.map(e => e.type || e.event_type).filter(Boolean);
        return [...new Set(types)];
    }, [events]);

    // Apply filters to events
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = (e.title?.toLowerCase() || '').includes(searchLower) ||
                (e.description?.toLowerCase() || '').includes(searchLower);

            const matchesModule = moduleFilter ? String(e.module_id) === String(moduleFilter) : true;
            const matchesType = typeFilter ? (
                (e.type?.toLowerCase() === typeFilter.toLowerCase()) || 
                (e.event_type?.toLowerCase() === typeFilter.toLowerCase())
            ) : true;

            return matchesSearch && matchesModule && matchesType;
        });
    }, [events, searchQuery, moduleFilter, typeFilter]);

    return (
        <div className="app-container" style={{ flexDirection: 'column' }}>
            <Navbar />
            <div className="main-flex">
                <Sidebar />
                <main className="main-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>
                            {targetStudentInfo 
                                ? `Calendar for ${targetStudentInfo.first_name} ${targetStudentInfo.last_name}` 
                                : 'Calendar'}
                        </h2>

                        {/* Calendar Controls */}
                        <div className="calendar-controls">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search events..."
                                    style={{ width: '200px', padding: '0.5rem 1rem' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <select
                                    className="form-input"
                                    style={{ width: '160px', padding: '0.5rem 1rem' }}
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                >
                                    <option value="">All Modules</option>
                                    {uniqueModules.map(mod => (
                                        <option key={mod} value={mod}>
                                            {moduleMap[mod] || `Module ID: ${mod}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <select
                                    className="form-input"
                                    style={{ width: '160px', padding: '0.5rem 1rem' }}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    {uniqueTypes.map(type => (
                                        <option key={type} value={type}>
                                            {/* Capitalize first letter */}
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-color-light)' }}>
                                <p>Loading your schedule...</p>
                            </div>
                        ) : (
                            <CalendarGrid events={filteredEvents} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CalendarPage;

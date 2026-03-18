import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import ManageEventsPage from './pages/ManageEventsPage';
import NotificationsPage from './pages/NotificationsPage';
import SupervisionPage from './pages/SupervisionPage';
import AdminPage from './pages/AdminPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected Routes (Authenticated users only) */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/supervision" element={<SupervisionPage />} />

                            {/* Role-specific Example */}
                            <Route element={<ProtectedRoute allowedRoles={['lecturer', 'admin']} />}>
                                <Route path="/manage-events" element={<ManageEventsPage />} />
                            </Route>

                            {/* Admin Only Route */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/admin" element={<AdminPage />} />
                                <Route path="/admin/users" element={<UserManagementPage />} />
                            </Route>
                        </Route>

                        {/* Redirect root to dashboard (which handles auth redirect) */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

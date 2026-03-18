import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!user) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but doesn't have required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;

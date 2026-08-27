import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * ProtectedRoute Component
 * 
 * Enforces authentication and role-based access control.
 * 
 * @param {Array} allowedRoles - Roles permitted to access this route.
 * @param {React.ReactNode} children - The component to render if authorized.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useUser();
    const location = useLocation();

    // Mapping of roles to their primary dashboard paths
    const getDashboardPath = (role) => {
        const r = (role || '').toLowerCase();
        switch (r) {
            case 'student': return '/student';
            case 'faculty': return '/faculty';
            case 'hod': return '/hod';
            case 'principal': return '/principal';
            case 'dean': return '/dean';
            case 'registrar': return '/registrar';
            default: return '/login';
        }
    };

    // 1. Handle session restoration state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background-dark">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // 2. Unauthenticated check
    if (!user || (!user.id && !user._id)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authorization check
    // If specific roles are required, ensure the user has one of them.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const dashboardPath = getDashboardPath(user.role);
        console.warn(`Access denied to ${location.pathname} for role: ${user.role}. Bouncing to ${dashboardPath}`);
        return <Navigate to={dashboardPath} replace />;
    }

    // 4. Authorized - render the content
    return children;
};

export default ProtectedRoute;

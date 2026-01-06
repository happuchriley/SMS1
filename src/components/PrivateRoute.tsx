import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Define which routes are accessible by which roles
const routePermissions: Record<string, string[]> = {
  // Admin only routes
  '/students': ['administrator'],
  '/staff': ['administrator'],
  '/billing': ['administrator'],
  '/fee-collection': ['administrator'],
  '/payroll': ['administrator'],
  '/finance': ['administrator'],
  '/financial-reports': ['administrator'],
  '/reminders': ['administrator'],
  '/setup': ['administrator'],
  // Admin and Staff routes
  '/reports': ['administrator', 'staff'],
  '/tlms': ['administrator', 'staff'],
  // All roles can access
  '/elearning': ['all'],
  '/news': ['all'],
  '/documents': ['all'],
  '/messages': ['all'],
  '/notifications': ['all'],
  '/profile': ['all'],
  '/student-dashboard': ['student'],
  '/teacher-dashboard': ['staff'],
  '/staff/dashboard': ['staff'],
  '/staff/menu': ['staff'],
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const userType = sessionStorage.getItem('userType') || 'administrator';
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check route permissions
  const currentPath = location.pathname;
  
  // Check if user has access to this route
  const hasAccess = Object.entries(routePermissions).some(([route, allowedRoles]) => {
    if (currentPath.startsWith(route) || (route === '/' && currentPath === '/')) {
      if (allowedRoles.includes('all')) return true;
      return allowedRoles.includes(userType);
    }
    return false;
  });

  // Special case for root path
  if (currentPath === '/') {
    if (userType === 'staff') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (userType === 'administrator') {
      // Admin can access root
      return <>{children}</>;
    }
  }

  // Block access if user doesn't have permission (except root which is handled above)
  if (!hasAccess && currentPath !== '/') {
    // Redirect to appropriate dashboard
    if (userType === 'staff') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

export default PrivateRoute;

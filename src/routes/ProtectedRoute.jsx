import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Where a user lands when they hit a route their role can't access,
// or the catch-all "*" route. Keeps each role inside its own home
// instead of everyone bouncing to a hardcoded /dashboard (which
// Parent/Student aren't even allowed to view).
export function roleHome(role) {
  switch (role) {
    case 'SUPER_ADMIN': return '/admin';
    case 'PARENT': return '/parent';
    case 'STUDENT': return '/student';
    default: return '/dashboard';
  }
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, accessToken } = useAuth();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  // If the user belongs to a school that is PENDING, block them from normal dashboard routes
  if (user.schoolStatus === 'PENDING' && user.role !== 'SUPER_ADMIN' && location.pathname !== '/kyc') {
    return <Navigate to="/kyc" replace />;
  }

  return children;
}
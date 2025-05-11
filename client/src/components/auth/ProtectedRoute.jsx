import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // If authentication is still loading, show a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified and user doesn't have the required role, redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  // If authenticated and has the required role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;

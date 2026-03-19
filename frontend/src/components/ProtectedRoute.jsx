import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute:', { user, loading, allowedRoles });

  if (loading) {
    return <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-gold text-xl">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();
  
  // Check if user's role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin' || userRole === 'manager') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'staff') {
      return <Navigate to="/staff" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

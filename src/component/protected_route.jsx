import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, fallback = null }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="w-8 h-8 border-4 border-[#675975] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
import React from 'react';
import { useAuth } from '../context/auth';
import { EducationalLoader } from './EducationalLoader';

export const ProtectedRoute = ({ children, fallback = null }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <EducationalLoader label="Opening your learning space…" />;
  }

  if (!currentUser) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;

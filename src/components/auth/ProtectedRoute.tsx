import { Navigate, Outlet } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/api/client';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    setIsValid(!!token);
    setIsChecking(false);
  }, []);

  if (isChecking) return null;

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
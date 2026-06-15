import { Navigate, Outlet } from 'react-router-dom';

import { ACCESS_TOKEN_KEY } from '@/api/client';


  const ProtectedRoute = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
export default ProtectedRoute;
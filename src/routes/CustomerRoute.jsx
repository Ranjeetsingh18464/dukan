import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerLayout from '../components/layout/CustomerLayout';

export default function CustomerRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'superadmin') return <Navigate to="/admin" />;
  if (user.role === 'shopkeeper') return <Navigate to="/dashboard" />;
  return <CustomerLayout><Outlet /></CustomerLayout>;
}

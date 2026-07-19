import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/layout/AdminLayout';
import Loading from '../components/common/Loading';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'superadmin') return <Navigate to="/login" />;
  return <AdminLayout />;
}

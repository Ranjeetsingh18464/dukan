import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerLayout from '../components/layout/CustomerLayout';
import Loading from '../components/common/Loading';

export function ShopLayout() {
  const { loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  return <CustomerLayout><Outlet /></CustomerLayout>;
}

export default function ShopCustomerRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'superadmin') return <Navigate to="/admin" />;
  if (user.role === 'shopkeeper') return <Navigate to="/login" />;
  return <CustomerLayout><Outlet /></CustomerLayout>;
}

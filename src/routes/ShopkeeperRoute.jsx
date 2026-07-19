import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShopkeeperLayout from '../components/layout/ShopkeeperLayout';
import Loading from '../components/common/Loading';

export default function ShopkeeperRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'shopkeeper') return <Navigate to="/login" />;
  return <ShopkeeperLayout />;
}

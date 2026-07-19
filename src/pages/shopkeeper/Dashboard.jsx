import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import useOrders from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/helpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiBox, FiShoppingBag, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import ShareButtons from '../../components/common/ShareButtons';
import { SkeletonDashboardCard } from '../../components/common/Skeleton';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { products, loading: pLoading } = useProducts(user?.shopId);
  const { orders, loading: oLoading } = useOrders(user?.shopId);
  const [shopSlug, setShopSlug] = useState(null);
  const loading = pLoading || oLoading;

  useEffect(() => {
    async function loadShop() {
      if (!user?.shopId) return;
      const snap = await getDoc(doc(db, 'shops', user.shopId));
      if (snap.exists()) setShopSlug(snap.data().slug);
    }
    loadShop();
  }, [user?.shopId]);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <SkeletonDashboardCard key={i} />)}</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock <= 5);

  const cards = [
    { icon: FiBox, label: 'Products', value: products.length, color: 'bg-indigo-500' },
    { icon: FiShoppingBag, label: 'Orders', value: orders.length, color: 'bg-green-500' },
    { icon: FiDollarSign, label: 'Revenue', value: formatCurrency(totalRevenue), color: 'bg-yellow-500' },
    { icon: FiAlertTriangle, label: 'Low Stock', value: lowStockProducts.length, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shop Dashboard</h1>
        {shopSlug && (
          <ShareButtons url={`${window.location.origin}/shop/${shopSlug}`} title="Check out our shop" />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color} text-white`}><card.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {lowStockProducts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2"><FiAlertTriangle /> Low Stock Alerts</h3>
          <div className="space-y-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-red-500 font-medium">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

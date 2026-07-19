import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency } from '../../utils/helpers';
import { FiBriefcase, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { SkeletonDashboardCard } from '../../components/common/Skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState({ shops: 0, orders: 0, revenue: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubShops = onSnapshot(collection(db, 'shops'), (snap) => {
      setStats(prev => ({ ...prev, shops: snap.size }));
      setLoading(false);
    });
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      let revenue = 0;
      snap.forEach(doc => { revenue += doc.data().total || 0; });
      setStats(prev => ({ ...prev, orders: snap.size, revenue }));
    });
    return () => { unsubShops(); unsubOrders(); };
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <SkeletonDashboardCard key={i} />)}</div>;

  const cards = [
    { icon: FiBriefcase, label: 'Total Shops', value: stats.shops, color: 'bg-indigo-500', link: '/admin/shops' },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats.orders, color: 'bg-green-500' },
    { icon: FiDollarSign, label: 'Total Revenue', value: formatCurrency(stats.revenue), color: 'bg-yellow-500' },
    { icon: FiUsers, label: 'Customers', value: stats.customers, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color} text-white`}><card.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
            {card.link && <Link to={card.link} className="text-sm text-indigo-600 hover:text-indigo-700 mt-3 block">View all →</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}

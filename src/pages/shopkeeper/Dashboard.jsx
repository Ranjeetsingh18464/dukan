import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import useOrders from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/helpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiBox, FiShoppingBag, FiDollarSign, FiAlertTriangle, FiArrowRight, FiTrendingUp, FiClock } from 'react-icons/fi';
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
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.();
    if (!d) return false;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const cards = [
    { icon: FiBox, label: 'Products', value: products.length, color: 'bg-indigo-50 text-indigo-600', gradient: 'gradient-primary' },
    { icon: FiShoppingBag, label: 'Total Orders', value: orders.length, color: 'bg-emerald-50 text-emerald-600', gradient: 'gradient-success' },
    { icon: FiDollarSign, label: 'Revenue', value: formatCurrency(totalRevenue), color: 'bg-amber-50 text-amber-600', gradient: 'gradient-warning' },
    { icon: FiAlertTriangle, label: 'Low Stock', value: lowStockProducts.length, color: 'bg-red-50 text-red-600', gradient: 'gradient-danger' },
  ];

  const quickLinks = [
    { to: '/dashboard/products', icon: FiBox, label: 'Manage Products', desc: 'Add, edit, or remove products' },
    { to: '/dashboard/orders', icon: FiShoppingBag, label: 'View Orders', desc: `${pendingOrders} pending order(s)` },
    { to: '/dashboard/invoices', icon: FiDollarSign, label: 'Create Invoice', desc: 'Generate new invoice' },
    { to: '/dashboard/qr-codes', icon: FiTrendingUp, label: 'QR Codes', desc: 'Print shop QR codes' },
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Shop Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</h1>
            <p className="text-indigo-200 mt-1 text-sm flex items-center gap-2">
              <FiClock className="w-3.5 h-3.5" /> {todayOrders} order(s) today &middot; {pendingOrders} pending
            </p>
          </div>
          <div className="flex items-center gap-3">
            {shopSlug && (
              <ShareButtons url={`${window.location.origin}/shop/${shopSlug}`} title="Check out our shop" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`stat-card animate-slide-up animate-slide-up-delay-${i + 1}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.gradient} text-white shadow-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{card.label}</p>
                <p className="text-2xl font-bold truncate">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 animate-slide-up animate-slide-up-delay-3">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.to} className="card hover:shadow-md hover:border-indigo-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
                    <link.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{link.label}</p>
                    <p className="text-xs text-gray-500 truncate">{link.desc}</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto shrink-0 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="animate-slide-up animate-slide-up-delay-4">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="card text-center py-8">
              <FiShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...orders].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 4).map(order => (
                <Link key={order.id} to={`/dashboard/orders/${order.id}`} className="card block hover:shadow-md hover:border-indigo-200 transition-all !p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-xs">{order.orderId}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="card animate-slide-up animate-slide-up-delay-5">
          <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4" /> Low Stock Alerts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiBox className="w-4 h-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-red-500 font-medium">{p.stock} left in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

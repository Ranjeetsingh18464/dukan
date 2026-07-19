import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, AuthContext } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FiShoppingBag, FiClock, FiCheckCircle, FiPackage, FiHeart, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { userShopSlug } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = [...orders].sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  }).slice(0, 5);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const shopBase = userShopSlug ? `/shop/${userShopSlug}` : null;

  const stats = [
    { icon: FiShoppingBag, label: 'Total Orders', value: totalOrders, color: 'bg-indigo-50 text-indigo-600', to: shopBase ? `${shopBase}/my-orders` : null },
    { icon: FiClock, label: 'Pending', value: pendingOrders, color: 'bg-amber-50 text-amber-600' },
    { icon: FiCheckCircle, label: 'Delivered', value: deliveredOrders, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FiPackage, label: 'Total Spent', value: formatCurrency(totalSpent), color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold">{user?.email}</h1>
            <p className="text-indigo-200 mt-1 text-sm">Manage your orders and discover new shops</p>
          </div>
          <Link to="/customer/shops" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl px-5 py-3 font-medium transition-all text-sm shrink-0">
            <FiBriefcase className="w-4 h-4" /> Browse Shops <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Wrapper = stat.to ? Link : 'div';
          return (
            <Wrapper key={i} to={stat.to} className={`stat-card animate-slide-up animate-slide-up-delay-${i + 1} ${stat.to ? 'cursor-pointer hover:border-indigo-200' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                  <p className="text-xl font-bold truncate">{stat.value}</p>
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-slide-up animate-slide-up-delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            {shopBase && (
              <Link to={`${shopBase}/my-orders`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          {recentOrders.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-300 text-sm mt-1">Your orders will appear here</p>
              <Link to="/customer/shops" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                <FiShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <Link to={`/track/${order.id}`} key={order.id} className={`card block hover:shadow-md hover:border-indigo-200 transition-all animate-slide-up animate-slide-up-delay-${Math.min(i + 1, 5)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm">{order.orderId}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">{order.items?.length} item(s) — {formatDate(order.createdAt)}</div>
                  <div className="font-bold mt-1.5">{formatCurrency(order.total)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 animate-slide-up animate-slide-up-delay-4">
          {shopBase ? (
            <>
              <Link to={`${shopBase}`} className="card hover:shadow-md hover:border-indigo-200 transition-all block">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiBriefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">My Shop</p>
                    <p className="text-xs text-gray-500">Browse products</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              </Link>
              <Link to={`${shopBase}/cart`} className="card hover:shadow-md hover:border-indigo-200 transition-all block">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiShoppingBag className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">My Cart</p>
                    <p className="text-xs text-gray-500">{cartItems.length} item(s)</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              </Link>
              <Link to={`${shopBase}/wishlist`} className="card hover:shadow-md hover:border-indigo-200 transition-all block">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiHeart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Wishlist</p>
                    <p className="text-xs text-gray-500">{wishlistItems.length} item(s)</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              </Link>
              <Link to={`${shopBase}/my-orders`} className="card hover:shadow-md hover:border-indigo-200 transition-all block">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiPackage className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">My Orders</p>
                    <p className="text-xs text-gray-500">View order history</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              </Link>
            </>
          ) : (
            <Link to="/customer/shops" className="card hover:shadow-md hover:border-indigo-200 transition-all block">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <FiBriefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Browse Shops</p>
                  <p className="text-xs text-gray-500">Find a shop to start shopping</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

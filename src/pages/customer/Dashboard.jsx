import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FiShoppingBag, FiClock, FiCheckCircle, FiPackage, FiHeart, FiBriefcase } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.email}</h1>

      <Link to="/customer/shops" className="flex items-center gap-3 bg-indigo-600 text-white rounded-xl px-5 py-4 mb-8 hover:bg-indigo-700 transition-colors">
        <FiBriefcase className="w-5 h-5" />
        <div>
          <p className="font-semibold">Browse Shops</p>
          <p className="text-indigo-200 text-xs">Discover products from all shops</p>
        </div>
      </Link>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/customer/my-orders" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><FiShoppingBag className="text-indigo-600" /></div>
            <div><p className="text-xs text-gray-500">Total Orders</p><p className="text-xl font-bold">{totalOrders}</p></div>
          </div>
        </Link>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><FiClock className="text-yellow-600" /></div>
            <div><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold">{pendingOrders}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FiCheckCircle className="text-green-600" /></div>
            <div><p className="text-xs text-gray-500">Delivered</p><p className="text-xl font-bold">{deliveredOrders}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FiPackage className="text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">Total Spent</p><p className="text-xl font-bold">{totalSpent}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link to="/customer/my-orders" className="text-sm text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link to={`/track/${order.id}`} key={order.id} className="card block hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm">{order.orderId}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">{order.items?.length} item(s) — {formatDate(order.createdAt)}</div>
                  <div className="font-bold mt-1">{formatCurrency(order.total)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Link to="/customer/cart" className="card hover:shadow-md transition-shadow block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><FiShoppingBag className="text-indigo-600" /></div>
              <div><p className="text-sm font-semibold">My Cart</p><p className="text-xs text-gray-500">{cartItems.length} item(s)</p></div>
            </div>
          </Link>
          <Link to="/customer/wishlist" className="card hover:shadow-md transition-shadow block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FiHeart className="text-red-600" /></div>
              <div><p className="text-sm font-semibold">Wishlist</p><p className="text-xs text-gray-500">{wishlistItems.length} item(s)</p></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

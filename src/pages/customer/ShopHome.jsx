import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { isShopOpen, getShopStatusText, getShopStatusColor } from '../../utils/shopUtils';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import SearchBar from '../../components/common/SearchBar';
import ImageLightbox from '../../components/common/ImageLightbox';
import GoogleMapsEmbed from '../../components/common/GoogleMapsEmbed';
import ShareButtons from '../../components/common/ShareButtons';
import { SkeletonProductCard } from '../../components/common/Skeleton';
import { FiHeart, FiShoppingCart, FiMapPin, FiClock, FiInfo, FiShare2, FiX, FiPlus, FiMinus, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ShopHome() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { recent, addProduct } = useRecentlyViewed();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [trackResults, setTrackResults] = useState([]);
  const [tracking, setTracking] = useState(false);
  const { items, addItem, removeItem, updateQuantity, clearCart, getCartTotal, getItemCount } = useCart();

  useEffect(() => {
    async function load() {
      const shopsRef = collection(db, 'shops');
      const q = query(shopsRef, where('slug', '==', slug));
      const snap = await onSnapshot(q, (s) => {
        if (!s.empty) {
          const shopData = { id: s.docs[0].id, ...s.docs[0].data() };
          setShop(shopData);
          loadProducts(shopData.id);
          loadCategories(shopData.id);
        }
        setLoading(false);
      });
      return snap;
    }
    function loadProducts(shopId) {
      const q = query(collection(db, 'products'), where('shopId', '==', shopId), where('isActive', '==', true));
      onSnapshot(q, (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
    function loadCategories(shopId) {
      const q = query(collection(db, 'categories'), where('shopId', '==', shopId));
      onSnapshot(q, (snap) => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
    load();
  }, [slug]);

  const shopOpen = shop ? isShopOpen(shop.openingHours) : true;

  const filtered = [...products]
    .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))
    .filter(p => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter && p.categoryId !== catFilter) return false;
      return true;
    });

  function addToCart(product) {
    addItem(product, 1, shop?.id);
    toast.success(`${product.name} added to cart`);
  }

  function openLightbox(images, index) {
    setLightboxImages(images);
    setLightboxIndex(index);
  }

  async function trackOrder() {
    if (!trackId.trim() || !shop) return;
    setTracking(true);
    setTrackResults([]);
    try {
      const q = query(collection(db, 'orders'), where('shopId', '==', shop.id));
      const snap = await new Promise((resolve, reject) => {
        const unsub = onSnapshot(q, (s) => { resolve(s); unsub(); }, reject);
      });
      const matched = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o =>
          o.id === trackId.trim() ||
          o.orderId?.toLowerCase() === trackId.trim().toLowerCase() ||
          o.customerPhone === trackId.trim()
        );
      setTrackResults(matched);
    } catch {
      setTrackResults([]);
    }
    setTracking(false);
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <SkeletonProductCard key={i} />)}
      </div>
    </div>
  );

  if (!shop) return <div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-500">Shop not found</h2></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {shop.banner && (
        <div className="relative h-48 md:h-64 bg-gray-200">
          <img src={shop.banner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex items-center gap-4 ${shop.banner ? '-mt-12 relative z-10' : 'pt-8'} mb-8`}>
          {shop.logo && <img src={shop.logo} alt="" className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover" />}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={shop.banner ? {} : { color: '#111827' }}>{shop.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-medium ${getShopStatusColor(shopOpen)}`}>
                <FiClock className="inline w-3 h-3 mr-1" /> {getShopStatusText(shopOpen)}
              </span>
              {shop.phone && <span className="text-sm text-gray-500">{shop.phone}</span>}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setShowTracker(true)} className="p-2 text-gray-600 hover:text-indigo-600 transition" title="Track Order">
              <FiPackage className="w-5 h-5" />
            </button>
            <button onClick={() => setShowCart(true)} className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
              <FiShoppingCart className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{getItemCount()}</span>
              )}
            </button>
            <ShareButtons url={window.location.href} title={shop.name} />
          </div>
        </div>

        {shop.description && (
          <section className="card mb-8">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><FiInfo /> About</h2>
            <p className="text-gray-600">{shop.description}</p>
            {shop.address && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><FiMapPin className="w-4 h-4" /> {shop.address}</p>
            )}
            {shop.googleMaps && (
              <a href={shop.googleMaps} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2 font-medium">
                <FiMapPin className="w-4 h-4" /> View on Google Maps
              </a>
            )}
            {(shop.googleMaps || shop.address) && (
              <div className="mt-4">
                <GoogleMapsEmbed location={shop.googleMaps} address={shop.address} />
              </div>
            )}
          </section>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search products..." /></div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field w-auto md:w-48">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
              <div className="relative h-36">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(product.images, 0)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-2 right-2 p-2 rounded-full ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'} shadow`}
                >
                  <FiHeart className="w-4 h-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/shop/${slug}/product/${product.id}`} className="font-semibold hover:text-indigo-600 line-clamp-1">{product.name}</Link>
                <p className="text-lg font-bold text-indigo-600 mt-1">{formatCurrency(product.price)}</p>
                <button onClick={() => addToCart(product)} className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm">
                  <FiShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {recent.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recent.map(p => (
                <Link key={p.id} to={`/shop/${slug}/product/${p.id}`} className="flex-shrink-0 w-32">
                  <img src={p.images?.[0] || ''} alt="" className="w-32 h-32 object-cover rounded-lg" />
                  <p className="text-xs mt-1 line-clamp-1">{p.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {lightboxImages && (
        <ImageLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxImages(null)} />
      )}

      {/* Track Order Modal */}
      {showTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowTracker(false); setTrackId(''); setTrackResults([]); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2"><FiPackage /> Track Order</h2>
              <button onClick={() => { setShowTracker(false); setTrackId(''); setTrackResults([]); }} className="p-1 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
                  placeholder="Enter Order ID or Phone Number"
                  className="input-field flex-1"
                  autoFocus
                />
                <button onClick={trackOrder} disabled={tracking} className="btn-primary flex items-center gap-2 shrink-0">
                  <FiSearch className="w-4 h-4" /> {tracking ? '...' : 'Track'}
                </button>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {trackResults.length > 0 && trackResults.map(order => (
                  <Link
                    key={order.id}
                    to={`/track/${order.id}`}
                    onClick={() => { setShowTracker(false); setTrackId(''); setTrackResults([]); }}
                    className="block border rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.orderId || order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{order.customerName} &middot; {order.customerPhone}</p>
                        <p className="text-xs text-gray-400 mt-1">{order.items?.length} items</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 mt-2">Track full status &rarr;</p>
                  </Link>
                ))}
                {trackId && !tracking && trackResults.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No orders found. Try your Order ID or registered phone number.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Your Cart ({getItemCount()})</h2>
              <button onClick={() => setShowCart(false)} className="p-1 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 py-12">Your cart is empty</p>
              ) : items.map(item => (
                <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  <img src={item.images?.[0] || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-indigo-600 font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"><FiMinus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"><FiPlus className="w-3 h-3" /></button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
                <Link to="/customer/checkout" onClick={() => setShowCart(false)} className="btn-primary block text-center w-full">
                  Proceed to Checkout
                </Link>
                <button onClick={() => { clearCart(); setShowCart(false); }} className="text-sm text-red-500 hover:text-red-600 w-full text-center">
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

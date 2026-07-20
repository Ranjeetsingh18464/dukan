import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency } from '../../utils/helpers';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import ImageLightbox from '../../components/common/ImageLightbox';
import QuantitySelector from '../../components/common/QuantitySelector';
import ShareButtons from '../../components/common/ShareButtons';
import QRCodeGenerator from '../../components/common/QRCodeGenerator';
import Loading from '../../components/common/Loading';
import { FiHeart, FiShoppingCart, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug, id } = useParams();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const p = { id: snap.id, ...snap.data() };
        setProduct(p);
        addProduct(p);
        const shopSnap = await getDoc(doc(db, 'shops', p.shopId));
        if (shopSnap.exists()) setShop({ id: shopSnap.id, ...shopSnap.data() });
        if (p.categoryId) {
          const relQ = query(collection(db, 'products'), where('shopId', '==', p.shopId), where('categoryId', '==', p.categoryId), where('isActive', '==', true));
          onSnapshot(relQ, (s) => {
            setRelatedProducts(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(rp => rp.id !== id).slice(0, 4));
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function addToCart() {
    addItem(product, qty, product.shopId);
    toast.success(`${product.name} added to cart`);
  }

  if (loading) return <Loading fullScreen />;
  if (!product) return <div className="text-center py-16"><h2 className="text-2xl text-gray-500">Product not found</h2></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="rounded-xl overflow-hidden mb-4 cursor-pointer" onClick={() => setLightboxOpen(true)}>
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt="" className="w-full h-64 md:h-96 object-cover" />
            ) : (
              <div className="w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          {product.brand && <p className="text-gray-500 mb-2">by {product.brand}</p>}
          <p className="text-3xl font-bold text-indigo-600 mb-4">{formatCurrency(product.price)}</p>
          {product.description && <p className="text-gray-600 mb-6">{product.description}</p>}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <QuantitySelector value={qty} onChange={setQty} />
            <button onClick={addToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiShoppingCart className="w-5 h-5" /> <span className="hidden sm:inline">Add to</span> Cart
            </button>
            <button onClick={() => toggleWishlist(product)} className={`p-3 rounded-lg border ${isInWishlist(product.id) ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-50'}`}>
              <FiHeart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <ShareButtons url={window.location.href} title={product.name} />
            <QRCodeSVG value={window.location.href} size={48} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600"><FiShield className="text-green-500" /> Quality Assured</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><FiTruck className="text-blue-500" /> Fast Delivery</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><FiRefreshCw className="text-orange-500" /> Easy Returns</div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(rp => (
              <Link key={rp.id} to={`/shop/${slug}/product/${rp.id}`} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <img src={rp.images?.[0] || ''} alt="" className="w-full h-32 object-cover" />
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-1">{rp.name}</p>
                  <p className="text-indigo-600 font-bold">{formatCurrency(rp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lightboxOpen && product.images?.length > 0 && (
        <ImageLightbox images={product.images} initialIndex={selectedImage} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

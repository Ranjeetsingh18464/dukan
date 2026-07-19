import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency } from '../../utils/helpers';
import Empty from '../../components/common/Empty';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  function addToCart(product) {
    addItem(product, 1, product.shopId);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <Empty message="Your wishlist is empty" icon={FiHeart} />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4">
              <img src={item.images?.[0] || ''} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-indigo-600 font-bold">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => addToCart(item)} className="btn-primary flex items-center gap-2 text-sm">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/helpers';
import QuantitySelector from '../../components/common/QuantitySelector';
import Empty from '../../components/common/Empty';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCart();

  if (items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Empty message="Your cart is empty" icon={FiShoppingBag} />
      <div className="text-center mt-4"><Link to="/login" className="text-indigo-600 hover:text-indigo-700">Browse shops</Link></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="card flex items-center gap-4">
            <img src={item.images?.[0] || ''} alt="" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-indigo-600 font-bold">{formatCurrency(item.price)}</p>
            </div>
            <QuantitySelector value={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
            <p className="font-bold w-24 text-right">{formatCurrency(item.price * item.quantity)}</p>
            <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 /></button>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-between">
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600">Clear Cart</button>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{formatCurrency(getCartTotal())}</p>
        </div>
      </div>
      <div className="mt-6 text-right">
        <Link to="/customer/checkout" className="btn-primary text-lg px-8">Proceed to Checkout</Link>
      </div>
    </div>
  );
}

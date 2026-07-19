import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiPackage, FiHeart, FiHome, FiRefreshCw, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();

  if (user?.role === 'superadmin') return <Navigate to="/admin" replace />;
  if (user?.role === 'shopkeeper') return <Navigate to="/dashboard" replace />;
  if (user) return <Navigate to="/customer" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, 'customer');
        toast.success('Account created! Please sign in.');
        setIsRegister(false);
      } else {
        await login(email, password);
        toast.success('Logged in successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
    setLoading(false);
  }

  const features = [
    { icon: FiPackage, title: 'Order History', desc: 'Track all your past orders in one place' },
    { icon: FiHeart, title: 'Wishlist', desc: 'Save your favorite products for later' },
    { icon: FiHome, title: 'Saved Address', desc: 'Save addresses for faster checkout' },
    { icon: FiRefreshCw, title: 'Reorder', desc: 'Reorder past purchases with one click' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Dukan</h1>
          <p className="text-gray-500 text-lg">Multi-Shop Marketplace</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Customer Account</h2>
              <p className="text-sm text-gray-500 mb-6">Optional — Continue as guest or sign in for the full experience</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="Enter password" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {isRegister ? <FiUserPlus className="w-4 h-4" /> : <FiLogIn className="w-4 h-4" />}
                  {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-600 hover:text-indigo-700">
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link to="/customer" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-medium">
                  <FiShoppingBag /> Guest Checkout <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Other Accounts</h2>
              <p className="text-sm text-gray-500 mb-4">Shopkeepers & Admins sign in with their dedicated credentials</p>
              <div className="flex gap-3">
                <Link to="/admin" className="flex-1 py-2.5 text-center border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Admin Panel</Link>
                <Link to="/shopkeeper-login" className="flex-1 py-2.5 text-center border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Shopkeeper</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-2">Guest Checkout</h2>
            <p className="text-sm text-gray-500 mb-6">No account needed — just browse and buy</p>

            <div className="space-y-5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-xs text-gray-400 text-center">
                Sign in to unlock all features. Guest checkout is always available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

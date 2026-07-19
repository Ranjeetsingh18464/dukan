import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiPackage, FiHeart, FiHome, FiRefreshCw, FiShoppingBag, FiArrowRight, FiBriefcase } from 'react-icons/fi';

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
    { icon: FiPackage, title: 'Order History', desc: 'Track all your past orders in one place', color: 'bg-indigo-50 text-indigo-600' },
    { icon: FiHeart, title: 'Wishlist', desc: 'Save your favorite products for later', color: 'bg-rose-50 text-rose-600' },
    { icon: FiHome, title: 'Saved Address', desc: 'Save addresses for faster checkout', color: 'bg-amber-50 text-amber-600' },
    { icon: FiRefreshCw, title: 'Reorder', desc: 'Reorder past purchases with one click', color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-primary text-white py-12 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FiBriefcase className="w-4 h-4" /> Multi-Shop Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Dukan</h1>
          <p className="text-indigo-100 text-lg">Browse shops, discover products, shop from anywhere</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6 animate-slide-up">
            <div className="card">
              <h2 className="text-xl font-bold mb-1">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-sm text-gray-500 mb-6">{isRegister ? 'Join Dukan to start shopping' : 'Sign in to your customer account'}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11" placeholder="Enter password" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
                  {isRegister ? <FiUserPlus className="w-4 h-4" /> : <FiLogIn className="w-4 h-4" />}
                  {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/customer" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-medium text-sm">
                  <FiShoppingBag className="w-4 h-4" /> Browse as Guest <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="card animate-slide-up animate-slide-up-delay-2">
              <h2 className="text-lg font-bold mb-1">Shopkeeper / Admin</h2>
              <p className="text-sm text-gray-500 mb-4">Sign in with your dedicated credentials</p>
              <div className="flex gap-3">
                <Link to="/admin" className="flex-1 py-2.5 text-center border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  Admin Panel
                </Link>
                <Link to="/shopkeeper-login" className="flex-1 py-2.5 text-center border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  Shopkeeper
                </Link>
              </div>
            </div>
          </div>

          <div className="card animate-slide-up animate-slide-up-delay-1">
            <h2 className="text-xl font-bold mb-1">Why Sign Up?</h2>
            <p className="text-sm text-gray-500 mb-6">Create an account to unlock the full shopping experience</p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors animate-slide-up animate-slide-up-delay-${i + 1}`}>
                  <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-sm text-indigo-700 font-medium">No account? No problem.</p>
                <p className="text-xs text-indigo-500 mt-1">Guest checkout is always available. Sign in to track orders and save your wishlist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

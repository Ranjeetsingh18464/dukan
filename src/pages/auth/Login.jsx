import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiBriefcase } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user, userShopSlug } = useAuth();

  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
    if (user.role === 'shopkeeper') return <Navigate to={userShopSlug ? `/shop/${userShopSlug}/dashboard` : '/login'} replace />;
    if (user.role === 'customer' && userShopSlug) return <Navigate to={`/shop/${userShopSlug}`} replace />;
    if (user.role === 'customer') return <Navigate to="/customer/shops" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-primary text-white py-12 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FiBriefcase className="w-4 h-4" /> Multi-Shop Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Dukan</h1>
          <p className="text-indigo-100 text-lg">One login for admins, shopkeepers, and customers</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 pb-16">
        <div className="card animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiLogIn className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your account</p>
          </div>

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
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
              ) : (
                <><FiLogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-4">Your role determines where you're redirected after login</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiLock className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Super Admin</p>
                  <p className="text-xs text-gray-400">Full platform control</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiBriefcase className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Shopkeeper</p>
                  <p className="text-xs text-gray-400">Manage your assigned shop</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiMail className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Customer</p>
                  <p className="text-xs text-gray-400">Shop from your assigned store</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

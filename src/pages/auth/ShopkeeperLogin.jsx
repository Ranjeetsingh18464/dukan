import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiBriefcase } from 'react-icons/fi';

export default function ShopkeeperLogin() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiBriefcase className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Shopkeeper Panel</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to manage your shop</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-6">{isRegister ? 'Create Shopkeeper Account' : 'Shopkeeper Sign In'}</h2>
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
            {isRegister && (
              <p className="text-xs text-gray-400">Register with the email your admin set up and you'll be auto-linked to your shop.</p>
            )}
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
        </div>
      </div>
    </div>
  );
}

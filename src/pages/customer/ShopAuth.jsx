import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiUser, FiBriefcase } from 'react-icons/fi';

export default function ShopAuth() {
  const { slug } = useParams();
  const { login, register, user, userShopSlug, loading: authLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);

  useEffect(() => {
    async function loadShop() {
      try {
        const q = query(collection(db, 'shops'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) setShop({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (err) {
        console.error('Failed to load shop:', err);
      }
      setShopLoading(false);
    }
    loadShop();
  }, [slug]);

  if (authLoading || shopLoading) return <Loading fullScreen />;
  if (!shop) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Shop not found</p></div>;

  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
    if (user.role === 'shopkeeper') {
      if (userShopSlug) return <Navigate to={`/shop/${userShopSlug}/dashboard`} replace />;
      return <Loading fullScreen />;
    }
    return <Navigate to={`/shop/${slug}`} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, 'customer', shop.id, name);
        toast.success(`Welcome to ${shop.name}!`);
      } else {
        await login(email, password);
        toast.success('Logged in successfully');
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please sign in.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(err.message || 'Failed');
      }
    }
    setLoading(false);
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-primary text-white py-10 px-4 animate-fade-in">
        <div className="max-w-md mx-auto text-center">
          {shop.logo && <img src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-2xl mx-auto mb-3 border-2 border-white/30 object-cover" />}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-3">
            <FiBriefcase className="w-4 h-4" /> {shop.name}
          </div>
          <h1 className="text-2xl font-bold mb-1">{isRegister ? 'Join' : 'Welcome to'} {shop.name}</h1>
          <p className="text-indigo-100 text-sm">{isRegister ? 'Create an account to start shopping' : 'Sign in to start shopping'}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-5 pb-16">
        <div className="card animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {isRegister ? <FiUserPlus className="w-7 h-7 text-indigo-600" /> : <FiLogIn className="w-7 h-7 text-indigo-600" />}
            </div>
            <h2 className="text-xl font-bold">{isRegister ? 'Create Account' : 'Sign In'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister ? `Register to shop at ${shop.name}` : 'Enter your credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-11" placeholder="Your full name" required />
                </div>
              </div>
            )}
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11" placeholder={isRegister ? 'Create a password (6+ chars)' : 'Enter password'} required minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isRegister ? 'Creating account...' : 'Signing in...'}</span>
              ) : (
                <>{isRegister ? <><FiUserPlus className="w-4 h-4" /> Create Account</> : <><FiLogIn className="w-4 h-4" /> Sign In</>}</>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={toggleMode} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to={`/shop/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">
              Browse {shop.name} without signing in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

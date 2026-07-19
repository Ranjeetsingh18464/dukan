import { NavLink, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FiHome, FiShoppingBag, FiHeart, FiPackage, FiLogOut, FiMenu, FiX, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import { useState } from 'react';

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useParams();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const shopPrefix = slug ? `/shop/${slug}` : null;

  const links = shopPrefix ? [
    { to: shopPrefix, icon: FiBriefcase, label: 'Shop Home', end: true },
    { to: `${shopPrefix}/cart`, icon: FiShoppingBag, label: 'Cart', badge: cartItems.length },
    { to: `${shopPrefix}/my-orders`, icon: FiPackage, label: 'My Orders' },
    { to: `${shopPrefix}/wishlist`, icon: FiHeart, label: 'Wishlist' },
  ] : [
    { to: '/customer', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/customer/shops', icon: FiBriefcase, label: 'Browse Shops' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><FiArrowLeft className="w-4 h-4" /></button>
            <Link to={shopPrefix || '/customer'} className="font-bold text-lg text-indigo-600">Dukan</Link>
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {links.map(link => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `px-3 py-1.5 rounded-xl text-sm font-medium transition-all relative ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                  <link.icon className="inline w-4 h-4 mr-1.5" />{link.label}
                  {link.badge > 0 && (
                    <span className="ml-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">{link.badge}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">{user?.email?.[0]?.toUpperCase() || '?'}</div>
              <span className="truncate max-w-[120px]">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl hidden md:flex items-center gap-1.5 transition-colors font-medium">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className={`md:hidden border-t bg-white overflow-hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-3 space-y-1">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />{link.label}
                </span>
                {link.badge > 0 && (
                  <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{link.badge}</span>
                )}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
                <FiLogOut className="w-4 h-4" />Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

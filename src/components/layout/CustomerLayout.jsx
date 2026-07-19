import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FiHome, FiShoppingBag, FiHeart, FiPackage, FiLogOut, FiMenu, FiX, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import { useState } from 'react';

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/customer', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/customer/shops', icon: FiBriefcase, label: 'Browse Shops' },
    { to: '/customer/my-orders', icon: FiPackage, label: 'My Orders' },
    { to: '/customer/wishlist', icon: FiHeart, label: 'Wishlist' },
    { to: '/customer/cart', icon: FiShoppingBag, label: `Cart (${cartItems.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiArrowLeft className="w-4 h-4" /></button>
            <Link to="/customer" className="font-bold text-lg text-indigo-600">Dukan</Link>
            <nav className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <link.icon className="inline w-4 h-4 mr-1" />{link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">{user?.email?.[0]?.toUpperCase() || '?'}</div>
              <span className="truncate max-w-[120px]">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg hidden md:flex items-center gap-1"><FiLogOut /> Logout</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2"><FiMenu /></button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-2 space-y-1">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>
                <link.icon className="inline w-4 h-4 mr-2" />{link.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600"><FiLogOut className="inline w-4 h-4 mr-2" />Logout</button>
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

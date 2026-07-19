import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiBriefcase, FiPlusCircle, FiSettings, FiBox, FiGrid, FiTag, FiBarChart2, FiBell, FiLogOut, FiX, FiFileText, FiTruck, FiShoppingBag, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPackage } from 'react-icons/fi';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useState, useEffect } from 'react';

export default function Sidebar({ role, slug, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (role === 'shopkeeper' && user?.shopId) {
      const q = query(collection(db, 'notifications'), where('shopId', '==', user.shopId), where('isRead', '==', false));
      const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
      return unsub;
    }
  }, [role, user?.shopId]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const prefix = slug ? `/shop/${slug}/dashboard` : '/dashboard';

  const adminLinks = [
    { to: '/admin', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/admin/shops', icon: FiBriefcase, label: 'Shops' },
    { to: '/admin/shops/create', icon: FiPlusCircle, label: 'Create Shop' },
    { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const shopkeeperSections = [
    {
      title: null,
      links: [
        { to: prefix, icon: FiHome, label: 'Dashboard', end: true },
      ],
    },
    {
      title: 'SALES',
      links: [
        { to: `${prefix}/orders/create`, icon: FiFileText, label: 'Create Invoice' },
        { to: `${prefix}/total-sale`, icon: FiTrendingUp, label: 'Total Sale', end: true },
      ],
    },
    {
      title: 'INVENTORY',
      links: [
        { to: `${prefix}/products`, icon: FiBox, label: 'Products' },
        { to: `${prefix}/stock`, icon: FiPackage, label: 'Stock', end: true },
        { to: `${prefix}/orders`, icon: FiDollarSign, label: 'Invoices', end: true },
        { to: `${prefix}/purchase-orders`, icon: FiTruck, label: 'Purchase Order', end: true },
        { to: `${prefix}/total-purchase`, icon: FiTrendingDown, label: 'Total Purchase', end: true },
        { to: `${prefix}/purchase-orders/create`, icon: FiFileText, label: 'Create Purchase Order' },
      ],
    },
    {
      title: 'OTHER',
      links: [
        { to: `${prefix}/qr-codes`, icon: FiGrid, label: 'QR Codes' },
        { to: `${prefix}/reports`, icon: FiBarChart2, label: 'Reports' },
        { to: `${prefix}/settings`, icon: FiSettings, label: 'Settings' },
      ],
    },
  ];

  const links = role === 'superadmin' ? adminLinks : null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="font-bold text-xl text-indigo-600">{role === 'superadmin' ? 'Admin Panel' : 'Shop Panel'}</h2>
          <button onClick={onClose} className="lg:hidden"><FiX className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {role === 'superadmin' ? (
            links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="flex-1">{link.label}</span>
              </NavLink>
            ))
          ) : (
            shopkeeperSections.map((section, sIdx) => (
              <div key={sIdx}>
                {section.title && (
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">{section.title}</p>
                )}
                {section.links.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={onClose}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{link.badge > 9 ? '9+' : link.badge}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))
          )}
        </nav>
        <div className="p-3 border-t shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          </div>
          {slug && role === 'shopkeeper' && (
            <a href={`/shop/${slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg mb-1">
              <FiBriefcase className="w-5 h-5" /> View Shop
            </a>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <FiLogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

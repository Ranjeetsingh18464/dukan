import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SearchBar from '../../components/common/SearchBar';
import Empty from '../../components/common/Empty';
import { formatDate } from '../../utils/helpers';
import { FiPlus, FiEye, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'shops'));
      setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading shops:', err);
      setError(err.message);
    }
    setLoading(false);
  }

  async function deleteShop(id) {
    if (!confirm('Delete this shop?')) return;
    await deleteDoc(doc(db, 'shops', id));
    toast.success('Shop deleted');
    loadShops();
  }

  async function toggleShop(id, isActive) {
    await updateDoc(doc(db, 'shops', id), { isActive: !isActive });
    toast.success('Shop updated');
    loadShops();
  }

  const filtered = shops.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shops</h1>
        <Link to="/admin/shops/create" className="btn-primary flex items-center gap-2"><FiPlus /> Create Shop</Link>
      </div>
      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search shops..." /></div>
      {error && (
        <div className="card border-red-200 bg-red-50 mb-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}
      {!loading && filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-2">No shops found</p>
          <p className="text-xs text-gray-400">Total shops in DB: {shops.length}</p>
          <Link to="/admin/shops/create" className="btn-primary mt-4 inline-block">Create Your First Shop</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Shop</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Created</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(shop => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {shop.logo && <img src={shop.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="font-medium">{shop.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{shop.slug}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleShop(shop.id, shop.isActive)} className={`flex items-center gap-1 ${shop.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {shop.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(shop.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/shops/${shop.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600"><FiEye /></Link>
                      <button onClick={() => deleteShop(shop.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

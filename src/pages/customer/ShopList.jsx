import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SearchBar from '../../components/common/SearchBar';
import Empty from '../../components/common/Empty';
import { FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'shops'));
      setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const filtered = shops.filter(s => s.isActive !== false && (!search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.address?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Shops</h1>
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search shops..." />
      </div>
      {filtered.length === 0 && !loading ? (
        <Empty message="No shops found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <Link key={shop.id} to={`/shop/${shop.slug}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-start gap-3">
                {shop.logo ? (
                  <img src={shop.logo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <FiBriefcase className="w-6 h-6 text-indigo-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{shop.name}</h3>
                  {shop.address && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><FiMapPin className="w-3 h-3 shrink-0" />{shop.address}</p>}
                  {shop.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><FiPhone className="w-3 h-3 shrink-0" />{shop.phone}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

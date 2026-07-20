import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Empty from '../../components/common/Empty';
import toast from 'react-hot-toast';
import { FiBriefcase, FiMapPin, FiPhone, FiNavigation, FiCrosshair, FiList, FiGrid, FiX, FiLoader, FiSearch } from 'react-icons/fi';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
    headers: { 'Accept-Language': 'en' },
  });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
    headers: { 'Accept-Language': 'en' },
  });
  const data = await res.json();
  return data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
}

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('card');
  const [locationFilter, setLocationFilter] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [shopCoords, setShopCoords] = useState({});
  const [detecting, setDetecting] = useState(false);
  const [radius, setRadius] = useState(50);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'shops'));
      setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const geocodeAllShops = useCallback(async (shopsList, coords) => {
    const results = {};
    await Promise.allSettled(
      shopsList.map(async (shop) => {
        const addr = shop.address || shop.googleMaps;
        if (!addr) return;
        const c = await geocode(addr);
        if (c) results[shop.id] = c;
      })
    );
    if (coords) {
      Object.keys(results).forEach(id => {
        results[id].distance = haversineDistance(coords.lat, coords.lon, results[id].lat, results[id].lon);
      });
    }
    setShopCoords(results);
  }, []);

  const handleDetectLocation = useCallback(async () => {
    setDetecting(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUserCoords(coords);
      const city = await reverseGeocode(coords.lat, coords.lon);
      if (city) setLocationFilter(city);
      await geocodeAllShops(shops, coords);
      toast.success('Location detected');
    } catch {
      toast.error('Could not detect location');
    }
    setDetecting(false);
  }, [shops, geocodeAllShops]);

  const handleLocationSearch = useCallback(async () => {
    if (!locationFilter.trim()) { setUserCoords(null); setShopCoords({}); return; }
    setDetecting(true);
    const c = await geocode(locationFilter);
    if (c) {
      setUserCoords(c);
      await geocodeAllShops(shops, c);
    } else {
      toast.error('Location not found');
    }
    setDetecting(false);
  }, [locationFilter, shops, geocodeAllShops]);

  const clearLocation = () => {
    setLocationFilter('');
    setUserCoords(null);
    setShopCoords({});
  };

  const filtered = shops.filter(s => {
    if (s.isActive === false) return false;
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) && !s.address?.toLowerCase().includes(search.toLowerCase())) return false;
    if (userCoords && shopCoords[s.id] && shopCoords[s.id].distance > radius) return false;
    return true;
  }).sort((a, b) => {
    if (userCoords && shopCoords[a.id] && shopCoords[b.id]) return shopCoords[a.id].distance - shopCoords[b.id].distance;
    return 0;
  });

  function openDirections(shop) {
    const dest = shop.address || shop.googleMaps || shop.name;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`, '_blank');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Browse Shops</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setView('card')} className={`p-2 rounded-lg transition-colors ${view === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Card View">
            <FiGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="List View">
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops..."
            className="input-field pl-11 pr-4"
          />
        </div>
        <div className="flex-1 relative">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
            placeholder="Filter by city..."
            className="input-field pl-11 pr-9"
          />
          {locationFilter && (
            <button onClick={clearLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={handleLocationSearch} disabled={detecting || !locationFilter.trim()} className="btn-primary flex items-center gap-2 shrink-0 text-sm px-4">
          <FiMapPin className="w-4 h-4" /> Search
        </button>
        <button onClick={handleDetectLocation} disabled={detecting} className="btn-secondary flex items-center gap-2 shrink-0 text-sm px-4">
          {detecting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCrosshair className="w-4 h-4" />} Detect
        </button>
        {userCoords && (
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="input-field w-auto text-sm shrink-0">
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={99999}>All</option>
          </select>
        )}
      </div>

      {filtered.length === 0 && !loading ? (
        <Empty message="No shops found" />
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <div key={shop.id} className="card hover:shadow-md transition-shadow group">
              <Link to={`/shop/${shop.slug}`} className="block">
                <div className="flex items-start gap-3">
                  {shop.logo ? (
                    <img src={shop.logo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <FiBriefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold truncate group-hover:text-indigo-600 transition-colors">{shop.name}</h3>
                    {shop.address && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><FiMapPin className="w-3 h-3 shrink-0" />{shop.address}</p>}
                    {shop.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><FiPhone className="w-3 h-3 shrink-0" />{shop.phone}</p>}
                    {userCoords && shopCoords[shop.id]?.distance != null && (
                      <p className="text-xs text-indigo-500 font-medium mt-1">{shopCoords[shop.id].distance.toFixed(1)} km away</p>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link to={`/shop/${shop.slug}`} className="btn-primary flex-1 text-center text-xs py-2">Visit Shop</Link>
                <button onClick={() => openDirections(shop)} className="btn-secondary flex items-center gap-1 text-xs py-2 px-3" title="Get Directions">
                  <FiNavigation className="w-3.5 h-3.5" /> Direction
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(shop => (
            <div key={shop.id} className="card hover:shadow-md transition-shadow flex items-center gap-4 p-4">
              {shop.logo ? (
                <img src={shop.logo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiBriefcase className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link to={`/shop/${shop.slug}`} className="font-bold hover:text-indigo-600 transition-colors">{shop.name}</Link>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                  {shop.address && <span className="flex items-center gap-1 truncate"><FiMapPin className="w-3 h-3 shrink-0" />{shop.address}</span>}
                  {shop.phone && <span className="flex items-center gap-1 shrink-0"><FiPhone className="w-3 h-3 shrink-0" />{shop.phone}</span>}
                  {userCoords && shopCoords[shop.id]?.distance != null && (
                    <span className="text-indigo-500 font-medium shrink-0">{shopCoords[shop.id].distance.toFixed(1)} km</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/shop/${shop.slug}`} className="btn-primary text-xs py-2">Visit</Link>
                <button onClick={() => openDirections(shop)} className="btn-secondary p-2" title="Get Directions">
                  <FiNavigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

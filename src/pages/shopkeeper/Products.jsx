import { useContext, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SearchBar from '../../components/common/SearchBar';
import Empty from '../../components/common/Empty';
import { formatCurrency } from '../../utils/helpers';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList, FiTag, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Products() {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const { products, loading } = useProducts(user?.shopId);
  const { categories } = useCategories(user?.shopId);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('card');

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await deleteDoc(doc(db, 'products', id));
    toast.success('Product deleted');
  }

  async function toggleProduct(id, isActive) {
    await updateDoc(doc(db, 'products', id), { isActive: !isActive });
    toast.success('Product updated');
  }

  async function moveProduct(index, direction) {
    const a = sorted[index];
    const b = sorted[index + direction];
    if (!a || !b) return;
    const posA = a.position ?? index;
    const posB = b.position ?? (index + direction);
    await updateDoc(doc(db, 'products', a.id), { position: posB });
    await updateDoc(doc(db, 'products', b.id), { position: posA });
    toast.success('Product moved');
  }

  const sorted = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
    return arr;
  }, [products]);

  const q = search.toLowerCase();
  const filtered = sorted.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.brand?.toLowerCase().includes(q) ||
    p.size?.toLowerCase().includes(q) ||
    p.unit?.toLowerCase().includes(q) ||
    (p.categoryId && categoryMap[p.categoryId]?.toLowerCase().includes(q))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('card')} className={`p-2 rounded-md transition-colors ${view === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><FiGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><FiList className="w-4 h-4" /></button>
          </div>
          <Link to={`/shop/${slug}/dashboard/products/add`} className="btn-primary flex items-center gap-2"><FiPlus /> Add Product</Link>
        </div>
      </div>
      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name, brand, category, size..." /></div>
      {filtered.length === 0 && !loading ? (
        <Empty message="No products yet. Add your first product!" />
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, index) => (
            <div key={product.id} className="card overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FiEdit className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button onClick={() => toggleProduct(product.id, product.isActive)} className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${product.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <FiTag className="w-3 h-3" /> {product.discount}% OFF
                  </div>
                )}
                {product.stock !== undefined && product.stock !== null && product.stock <= 5 && (
                  <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-lg">
                    Low Stock: {product.stock}
                  </div>
                )}
              </div>
              <div className="p-4">
                {product.brand && <p className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</p>}
                <h3 className="font-semibold text-sm truncate mt-0.5">{product.name}</h3>
                {product.categoryId && categoryMap[product.categoryId] && (
                  <p className="text-xs text-indigo-400 mt-0.5">{categoryMap[product.categoryId]}</p>
                )}
                {product.size && <p className="text-xs text-gray-400 mt-0.5">Size: {product.size} {product.unit}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-lg font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                  {product.mrp > product.price && (
                    <p className="text-sm text-gray-400 line-through">{formatCurrency(product.mrp)}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="flex gap-1">
                    <button onClick={() => moveProduct(index, -1)} disabled={index === 0} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><FiChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveProduct(index, 1)} disabled={index === filtered.length - 1} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><FiChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <Link to={`/shop/${slug}/dashboard/products/edit/${product.id}`} className="flex-1 text-center py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center justify-center gap-1">
                    <FiEdit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button onClick={() => deleteProduct(product.id)} className="flex-1 text-center py-1.5 text-sm bg-red-50 hover:bg-red-100 rounded-lg text-red-600 flex items-center justify-center gap-1">
                    <FiTrash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">MRP</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Discount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Size/Unit</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <span className="font-medium text-sm block">{product.name}</span>
                        {product.brand && <span className="text-xs text-gray-400">{product.brand}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 line-through">{product.mrp ? formatCurrency(product.mrp) : '-'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    {product.discount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <FiTag className="w-3 h-3" /> {product.discount}%
                      </span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{product.size ? `${product.size} ${product.unit}` : product.unit || '-'}</td>
                  <td className="px-4 py-3 text-sm">{product.stock ?? '∞'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleProduct(product.id, product.isActive)} className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${product.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <button onClick={() => moveProduct(index, -1)} disabled={index === 0} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><FiChevronUp /></button>
                      <button onClick={() => moveProduct(index, 1)} disabled={index === filtered.length - 1} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><FiChevronDown /></button>
                      <Link to={`/shop/${slug}/dashboard/products/edit/${product.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600"><FiEdit /></Link>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><FiTrash2 /></button>
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

import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import useOrders from '../../hooks/useOrders';
import Empty from '../../components/common/Empty';
import SearchBar from '../../components/common/SearchBar';

export default function Stock() {
  const { user } = useContext(AuthContext);
  const { products } = useProducts(user?.shopId);
  const { orders } = useOrders(user?.shopId);
  const [search, setSearch] = useState('');

  const invoices = orders.filter(o => o.type === 'invoice' || !o.type);
  const purchases = orders.filter(o => o.type === 'purchase');
  const filtered = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  function getSold(productId) {
    return invoices.reduce((sum, o) => {
      const item = o.items?.find(i => i.productId === productId);
      return sum + (item ? item.quantity : 0);
    }, 0);
  }

  function getPurchased(productId) {
    return purchases.reduce((sum, o) => {
      const item = o.items?.find(i => i.productId === productId);
      return sum + (item ? item.quantity : 0);
    }, 0);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stock</h1>
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter by product name..." />
      </div>
      {products.length === 0 ? (
        <Empty message="No products found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">S.No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Size/Unit</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Purchased</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sold</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((product, idx) => {
                const purchased = getPurchased(product.id);
                const sold = getSold(product.id);
                const stock = purchased - sold;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-sm">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{product.size ? `${product.size} ${product.unit}` : '—'}</td>
                    <td className="px-4 py-3 text-sm">{purchased}</td>
                    <td className="px-4 py-3 text-sm">{sold}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${stock < 0 ? 'text-red-600' : stock === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {stock}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import useOrders from '../../hooks/useOrders';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Reports() {
  const { user } = useContext(AuthContext);
  const { products } = useProducts(user?.shopId);
  const { orders } = useOrders(user?.shopId);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filteredOrders = orders.filter(o => {
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to + 'T23:59:59')) return false;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const lowStock = products.filter(p => p.stock !== undefined && p.stock <= 5);

  const productSales = {};
  filteredOrders.forEach(o => {
    o.items?.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="flex gap-4 mb-6">
        <div>
          <label className="label">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Avg Order</p>
          <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Top Products</h3>
          {topProducts.length === 0 ? <p className="text-gray-400 text-sm">No data</p> : (
            <div className="space-y-2">
              {topProducts.map(([name, qty], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-medium">{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Low Stock Items</h3>
          {lowStock.length === 0 ? <p className="text-gray-400 text-sm">All items well stocked</p> : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-red-500 font-medium">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useOrders from '../../hooks/useOrders';
import { formatDate } from '../../utils/helpers';
import Empty from '../../components/common/Empty';

export default function TotalPurchase() {
  const { user } = useContext(AuthContext);
  const { orders, loading } = useOrders(user?.shopId);

  const purchases = orders.filter(o => o.type === 'purchase');
  const totalPurchase = purchases.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCount = purchases.length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Total Purchase</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Purchase Amount</p>
          <p className="text-3xl font-bold text-indigo-600">{totalPurchase}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Purchase Orders</p>
          <p className="text-3xl font-bold text-indigo-600">{totalCount}</p>
        </div>
      </div>
      {purchases.length === 0 && !loading ? (
        <Empty message="No purchase orders yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">S.No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Order No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Vendor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Items</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((order, idx) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-sm">Order No {idx + 1}</td>
                  <td className="px-4 py-3 text-sm">{order.vendorName}</td>
                  <td className="px-4 py-3 text-sm">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 text-sm capitalize">{order.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

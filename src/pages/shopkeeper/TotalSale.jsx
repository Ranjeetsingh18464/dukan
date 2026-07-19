import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useOrders from '../../hooks/useOrders';
import { formatDate } from '../../utils/helpers';
import Empty from '../../components/common/Empty';

export default function TotalSale() {
  const { user } = useContext(AuthContext);
  const { orders, loading } = useOrders(user?.shopId);

  const invoices = orders.filter(o => o.type === 'invoice' || !o.type);
  const totalSale = invoices.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCount = invoices.length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Total Sale</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-indigo-600">{totalSale}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-3xl font-bold text-indigo-600">{totalCount}</p>
        </div>
      </div>
      {invoices.length === 0 && !loading ? (
        <Empty message="No sales yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">S.No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Invoice No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Items</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((order, idx) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-sm">Invoice No {idx + 1}</td>
                  <td className="px-4 py-3 text-sm">{order.customerName}</td>
                  <td className="px-4 py-3 text-sm">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 text-sm font-medium">{order.total}</td>
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

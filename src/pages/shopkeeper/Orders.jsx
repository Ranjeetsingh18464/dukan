import { useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useOrders from '../../hooks/useOrders';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SearchBar from '../../components/common/SearchBar';
import Empty from '../../components/common/Empty';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { exportOrdersToCSV } from '../../utils/exportUtils';
import { ORDER_STATUSES } from '../../utils/constants';
import { FiEye, FiDownload, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Orders() {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const { orders, loading } = useOrders(user?.shopId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function updateStatus(orderId, newStatus) {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: new Date() });
    await addDoc(collection(db, 'notifications'), {
      shopId: user.shopId, type: 'order_status', message: `Order ${orderId} status updated to ${newStatus}`,
      isRead: false, createdAt: new Date(),
    });
    toast.success('Status updated');
  }

  function handleExport() {
    const filtered = getFiltered();
    exportOrdersToCSV(filtered, user.shopName || 'Shop');
    toast.success('Exported!');
  }

  function getFiltered() {
    let result = orders.filter(o => o.type === 'invoice' || !o.type);
    if (search) result = result.filter(o => o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    return result;
  }

  const filtered = getFiltered();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2"><FiDownload /> Export CSV</button>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search orders..." /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {filtered.length === 0 && !loading ? (
        <Empty message="No orders found" />
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order, idx) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-sm">Invoice No {idx + 1}</td>
                  <td className="px-4 py-3 text-sm">{order.customerName}</td>
                  <td className="px-4 py-3 text-sm">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="text-sm border rounded-lg px-2 py-1">
                      {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/shop/${slug}/dashboard/orders/${order.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600 inline-flex"><FiEye /></Link>
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

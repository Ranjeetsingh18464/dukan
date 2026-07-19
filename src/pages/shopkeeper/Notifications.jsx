import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDateTime } from '../../utils/helpers';
import Empty from '../../components/common/Empty';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.shopId) return;
    const q = query(collection(db, 'notifications'), where('shopId', '==', user.shopId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user?.shopId]);

  async function markRead(id) {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true })));
  }

  async function deleteNotification(id) {
    await deleteDoc(doc(db, 'notifications', id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2"><FiCheck /> Mark all read</button>
        )}
      </div>
      {notifications.length === 0 && !loading ? (
        <Empty message="No notifications" icon={FiBell} />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`card flex items-center gap-4 ${!n.isRead ? 'border-l-4 border-indigo-500 bg-indigo-50/30' : ''}`}>
              <FiBell className={`w-5 h-5 ${!n.isRead ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className={`text-sm ${!n.isRead ? 'font-medium' : 'text-gray-600'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!n.isRead && <button onClick={() => markRead(n.id)} className="p-1 hover:bg-gray-100 rounded text-green-600"><FiCheck /></button>}
                <button onClick={() => deleteNotification(n.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

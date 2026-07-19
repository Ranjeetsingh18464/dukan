import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useCategories from '../../hooks/useCategories';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Modal from '../../components/common/Modal';
import Empty from '../../components/common/Empty';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function Categories() {
  const { user } = useContext(AuthContext);
  const { categories, loading } = useCategories(user?.shopId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditId(null);
    setName('');
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditId(cat.id);
    setName(cat.name);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'categories', editId), { name });
        toast.success('Category updated');
      } else {
        await addDoc(collection(db, 'categories'), { name, shopId: user.shopId, createdAt: new Date() });
        toast.success('Category added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  }

  async function deleteCategory(id) {
    if (!confirm('Delete category?')) return;
    await deleteDoc(doc(db, 'categories', id));
    toast.success('Category deleted');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Add Category</button>
      </div>
      {categories.length === 0 && !loading ? (
        <Empty message="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card flex items-center justify-between">
              <h3 className="font-medium">{cat.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600"><FiEdit /></button>
                <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

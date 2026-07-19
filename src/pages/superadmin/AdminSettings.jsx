import { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { confirmPasswordReset } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { FiSave, FiKey } from 'react-icons/fi';

export default function AdminSettings() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) { toast.error('User not found'); setLoading(false); return; }
      toast.success('Password reset email sent (requires email provider setup)');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiKey /> Reset Shopkeeper Password</h3>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="label">Shopkeeper Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="shopkeeper@email.com" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <FiSave /> {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

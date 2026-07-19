import { format } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function uploadFile(file, path) {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const { storage } = await import('../firebase/config');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function generateOrderId() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
}

export function truncate(str, len = 50) {
  return str?.length > len ? str.substring(0, len) + '...' : str || '';
}

import { format } from 'date-fns';
import { formatCurrency, formatDate } from './helpers';

export function exportOrdersToCSV(orders, shopName = 'Shop') {
  const headers = ['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Payment', 'Date'];
  const rows = orders.map(o => [
    o.orderId,
    o.customerName,
    o.customerPhone,
    o.items?.length || 0,
    formatCurrency(o.total),
    o.status,
    o.paymentMethod,
    formatDate(o.createdAt),
  ]);
  downloadCSV(headers, rows, `${shopName}-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

export function exportProductsToCSV(products, shopName = 'Shop') {
  const headers = ['Name', 'Price', 'Stock', 'Category', 'Active', 'Created'];
  const rows = products.map(p => [
    p.name,
    formatCurrency(p.price),
    p.stock ?? '∞',
    p.categoryName || '',
    p.isActive ? 'Yes' : 'No',
    formatDate(p.createdAt),
  ]);
  downloadCSV(headers, rows, `${shopName}-products-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

function downloadCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

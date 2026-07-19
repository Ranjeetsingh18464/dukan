import { FiPrinter } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

export default function InvoicePrint({ order, shop, orderNo }) {
  function handlePrint() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>${order.type === 'purchase' ? 'Purchase Order' : 'Invoice'} ${orderNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
        th { background: #f5f5f5; }
        .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.8em; }
      </style></head><body>
      <div class="header">
        <h2>${shop?.name || 'Shop'}</h2>
        <p>${shop?.address || ''}</p>
        <p>${shop?.phone || ''}</p>
      </div>
      <h3>${order.type === 'purchase' ? 'Purchase Order' : 'Invoice'}</h3>
      <p><strong>${orderNo}</strong></p>
      <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
      <p><strong>${order.type === 'purchase' ? 'Vendor' : 'Customer'}:</strong> ${order.type === 'purchase' ? order.vendorName : order.customerName}</p>
      <p><strong>Phone:</strong> ${order.type === 'purchase' ? order.vendorPhone : order.customerPhone}</p>
      <table>
        <tr><th>Item</th><th>Qty</th>${order.type !== 'purchase' ? '<th>Price</th><th>Subtotal</th>' : ''}</tr>
        ${(order.items || []).map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td>${order.type !== 'purchase' ? `<td>${item.price}</td><td>${item.price * item.quantity}</td>` : ''}</tr>`).join('')}
      </table>
      ${order.type !== 'purchase' ? `<div class="total">Total: ${order.total}</div>` : ''}
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      <div class="footer"><p>Thank you for your purchase!</p></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium text-sm">
      <FiPrinter /> Print {order.type === 'purchase' ? 'Purchase Order' : 'Invoice'}
    </button>
  );
}

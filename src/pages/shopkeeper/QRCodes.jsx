import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { QRCodeSVG } from 'qrcode.react';
import Loading from '../../components/common/Loading';
import { FiPrinter, FiDownload } from 'react-icons/fi';

export default function QRCodes() {
  const { user } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.shopId) { setLoading(false); return; }
      const snap = await getDoc(doc(db, 'shops', user.shopId));
      if (snap.exists()) setShop({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [user?.shopId]);

  const shopUrl = shop ? `${window.location.origin}/shop/${shop.slug}` : '';

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Shop QR - ${shop?.name}</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .container { text-align: center; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        p { color: #666; margin-bottom: 20px; }
        .url { font-size: 12px; color: #999; margin-top: 16px; word-break: break-all; }
        @media print { body { padding: 40px; } }
      </style></head><body>
      <div class="container">
        <h1>${shop?.name || 'Shop'}</h1>
        <p>Scan to visit our shop</p>
        <div id="qr"></div>
        <p class="url">${shopUrl}</p>
      </div>
      <script>
        const svg = document.querySelector('#qr-container svg');
        if (svg) document.getElementById('qr').appendChild(svg.cloneNode(true));
      </script>
      </body></html>
    `);
    printWindow.document.close();

    const qrSvg = document.querySelector('.qr-print-area svg');
    if (qrSvg) {
      printWindow.document.getElementById('qr').innerHTML = '';
      printWindow.document.getElementById('qr').appendChild(qrSvg.cloneNode(true));
    }
    setTimeout(() => printWindow.print(), 300);
  }

  function handleDownload() {
    const svg = document.querySelector('.qr-print-area svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `${shop?.name || 'shop'}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  if (loading) return <Loading />;
  if (!shop) return <p>Shop not found</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">QR Codes</h1>

      <div className="card text-center">
        <h2 className="font-semibold mb-1">Shop QR</h2>
        <p className="text-sm text-gray-500 mb-6">Scanning opens the correct page</p>

        <div className="qr-print-area inline-block bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200">
          <QRCodeSVG value={shopUrl} size={200} />
        </div>

        <p className="text-sm text-gray-400 mt-4 break-all">{shopUrl}</p>

        <div className="flex justify-center gap-3 mt-6">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <FiPrinter /> Print QR
          </button>
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
            <FiDownload /> Download QR
          </button>
        </div>
      </div>
    </div>
  );
}

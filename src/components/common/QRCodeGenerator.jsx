import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeGenerator({ value, size = 128, title }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG value={value} size={size} />
      {title && <p className="text-sm text-gray-500">{title}</p>}
    </div>
  );
}

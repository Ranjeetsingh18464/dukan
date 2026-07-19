import { useState } from 'react';
import { FiX, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  if (!images?.length) return null;

  function prev() { setIndex((index - 1 + images.length) % images.length); setZoom(1); }
  function next() { setIndex((index + 1) % images.length); setZoom(1); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"><FiX className="w-6 h-6" /></button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"><FiChevronLeft className="w-8 h-8" /></button>
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"><FiChevronRight className="w-8 h-8" /></button>

      <div className="flex gap-2 absolute top-4 left-4">
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 3)); }} className="text-white p-2 hover:bg-white/10 rounded-full"><FiZoomIn className="w-5 h-5" /></button>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }} className="text-white p-2 hover:bg-white/10 rounded-full"><FiZoomOut className="w-5 h-5" /></button>
      </div>

      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt="" className="max-w-full max-h-[85vh] object-contain transition-transform" style={{ transform: `scale(${zoom})` }} />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); setZoom(1); }} className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${i === index ? 'border-white' : 'border-transparent'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

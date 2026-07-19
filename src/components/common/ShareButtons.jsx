import { useState } from 'react';
import { FiShare2, FiCopy, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title, phone }) {
  const [open, setOpen] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
        <FiShare2 className="w-4 h-4" /> Share
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 flex flex-col gap-1 min-w-[160px]">
          <button onClick={copyLink} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"><FiCopy className="w-4 h-4" /> Copy Link</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"><FiMessageCircle className="w-4 h-4" /> WhatsApp</a>
        </div>
      )}
    </div>
  );
}

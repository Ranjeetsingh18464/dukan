import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiImage, FiSearch } from 'react-icons/fi';
import { uploadFile } from '../../utils/helpers';
import { compressImage, isImageFile } from '../../utils/imageCompress';
import toast from 'react-hot-toast';

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

async function searchImages(query) {
  if (!UNSPLASH_KEY) return [];
  const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=squarish`, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map(img => ({
    thumb: img.urls.thumb,
    full: img.urls.regular,
    alt: img.alt_description || query,
  }));
}

export default function ImageUploader({ onUpload, path, multiple = false, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [tab, setTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState([]);
  const inputRef = useRef();

  async function handleFiles(files) {
    const arr = Array.from(files).slice(0, maxFiles);
    setUploading(true);
    try {
      const urls = [];
      for (const file of arr) {
        if (isImageFile(file)) {
          const compressed = await compressImage(file);
          const url = await uploadFile(compressed, `${path}/${Date.now()}-${file.name}`);
          urls.push(url);
        } else {
          const url = await uploadFile(file, `${path}/${Date.now()}-${file.name}`);
          urls.push(url);
        }
      }
      const updated = multiple ? [...previews, ...urls] : urls;
      setPreviews(updated);
      onUpload(multiple ? updated : urls[0]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  }

  function removePreview(url) {
    const updated = previews.filter(p => p !== url);
    setPreviews(updated);
    if (multiple) onUpload(updated);
    else onUpload(null);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!UNSPLASH_KEY) {
      toast.error('Image search requires an Unsplash API key. Add VITE_UNSPLASH_ACCESS_KEY to your .env file. Get one free at unsplash.com/developers');
      return;
    }
    setSearching(true);
    const results = await searchImages(searchQuery.trim());
    setSearchResults(results);
    setSearching(false);
  }

  function toggleSearchImage(img) {
    setSelectedSearch(prev => {
      const exists = prev.find(s => s.full === img.full);
      if (exists) return prev.filter(s => s.full !== img.full);
      return [...prev, img];
    });
  }

  function confirmSearchImages() {
    const urls = selectedSearch.map(s => s.full);
    if (!urls.length) return;
    const updated = multiple ? [...previews, ...urls] : urls;
    setPreviews(updated);
    onUpload(multiple ? updated : urls[0]);
    setSelectedSearch([]);
    setSearchResults([]);
    setSearchQuery('');
    setTab('upload');
    toast.success(`${urls.length} image(s) added`);
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => setTab('upload')} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${tab === 'upload' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <FiUpload className="w-4 h-4" /> Upload
        </button>
        <button type="button" onClick={() => setTab('search')} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${tab === 'search' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <FiSearch className="w-4 h-4" /> Search Images
        </button>
      </div>

      {tab === 'upload' ? (
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 cursor-pointer transition-colors"
          >
            <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>
      ) : (
        <div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images (e.g. 'red shoes', 'iphone case')..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={searching} className="btn-primary px-4 flex items-center gap-2">
              <FiSearch className="w-4 h-4" /> {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {!UNSPLASH_KEY && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
              Add <code>VITE_UNSPLASH_ACCESS_KEY</code> to your <code>.env</code> file. Get a free key at <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer" className="underline">unsplash.com/developers</a>
            </p>
          )}
          {searchResults.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{searchResults.length} results — click to select</p>
                {selectedSearch.length > 0 && (
                  <button type="button" onClick={confirmSearchImages} className="btn-primary px-3 py-1 text-sm flex items-center gap-1">
                    <FiImage className="w-3 h-3" /> Add {selectedSearch.length} image(s)
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {searchResults.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleSearchImage(img)}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-square ${selectedSearch.some(s => s.full === img.full) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                    {selectedSearch.some(s => s.full === img.full) && (
                      <div className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {searching && <div className="text-center py-4 text-sm text-gray-400">Searching images...</div>}
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex gap-3 mt-3 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button onClick={() => removePreview(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

export default function AdvancedFilters({ filters, onChange, brands = [] }) {
  const [open, setOpen] = useState(false);

  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 btn-secondary">
        <FiFilter className="w-4 h-4" /> Filters
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-lg p-4 z-20 w-72 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Filters</h4>
            <button onClick={() => setOpen(false)}><FiX /></button>
          </div>
          <div>
            <label className="label">Price Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => update('minPrice', e.target.value)} className="input-field text-sm" />
              <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => update('maxPrice', e.target.value)} className="input-field text-sm" />
            </div>
          </div>
          {brands.length > 0 && (
            <div>
              <label className="label">Brand</label>
              <select value={filters.brand || ''} onChange={(e) => update('brand', e.target.value)} className="input-field text-sm">
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Availability</label>
            <select value={filters.availability || ''} onChange={(e) => update('availability', e.target.value)} className="input-field text-sm">
              <option value="">All</option>
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
          <div>
            <label className="label">Sort By</label>
            <select value={filters.sort || ''} onChange={(e) => update('sort', e.target.value)} className="input-field text-sm">
              <option value="">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
          <button onClick={() => onChange({})} className="text-sm text-red-500 hover:text-red-600">Clear Filters</button>
        </div>
      )}
    </div>
  );
}

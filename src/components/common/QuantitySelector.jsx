export default function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex items-center border rounded-lg">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium" disabled={value <= min}>-</button>
      <span className="px-4 py-2 text-center min-w-[3rem] font-medium">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium" disabled={value >= max}>+</button>
    </div>
  );
}

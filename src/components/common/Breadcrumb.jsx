export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <a href="/" className="hover:text-indigo-600">Home</a>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
          {item.href ? (
            <a href={item.href} className="hover:text-indigo-600">{item.label}</a>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

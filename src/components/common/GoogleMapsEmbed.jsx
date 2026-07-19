export default function GoogleMapsEmbed({ location, address }) {
  if (!location && !address) return null;

  const query = location || address;
  const src = `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(query)}&zoom=15`;

  return (
    <div className="rounded-xl overflow-hidden border w-full h-64">
      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Shop Location"
      />
    </div>
  );
}

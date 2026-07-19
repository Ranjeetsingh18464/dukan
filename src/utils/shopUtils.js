export function isShopOpen(openingHours) {
  if (!openingHours) return true;
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const todayHours = openingHours[day];
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.open || !todayHours.close) return true;
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function getShopStatusText(isOpen) {
  return isOpen ? 'Open Now' : 'Currently Closed';
}

export function getShopStatusColor(isOpen) {
  return isOpen ? 'text-green-600' : 'text-red-500';
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone?.replace(/\D/g, ''));
}

export function validatePassword(password) {
  return password?.length >= 6;
}

export function validateShopName(name) {
  return name?.trim().length >= 2;
}

export function validateProduct(product) {
  const errors = {};
  if (!product.name?.trim()) errors.name = 'Product name is required';
  if (!product.price || product.price <= 0) errors.price = 'Valid price is required';
  if (!product.categoryId) errors.categoryId = 'Category is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOrder(order) {
  const errors = {};
  if (!order.items?.length) errors.items = 'At least one item is required';
  if (!order.customerName?.trim()) errors.customerName = 'Customer name is required';
  if (!order.customerPhone?.trim()) errors.customerPhone = 'Phone is required';
  if (order.customerPhone && !validatePhone(order.customerPhone)) errors.customerPhone = 'Valid phone is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

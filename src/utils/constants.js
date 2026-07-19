export const COLLECTIONS = {
  USERS: 'users',
  SHOPS: 'shops',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
  COUPONS: 'coupons',
};

export const ROLES = {
  SUPERADMIN: 'superadmin',
  SHOPKEEPER: 'shopkeeper',
  CUSTOMER: 'customer',
};

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'indigo' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'pickup', label: 'Pickup from Store' },
  { value: 'online', label: 'Online Payment' },
];

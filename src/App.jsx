import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import BackToTop from './components/common/BackToTop';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import ShopkeeperRoute from './routes/ShopkeeperRoute';
import CustomerRoute from './routes/CustomerRoute';

const Login = React.lazy(() => import('./pages/auth/Login'));
const ShopkeeperLogin = React.lazy(() => import('./pages/auth/ShopkeeperLogin'));
const AdminDashboard = React.lazy(() => import('./pages/superadmin/Dashboard'));
const AdminShops = React.lazy(() => import('./pages/superadmin/Shops'));
const AdminCreateShop = React.lazy(() => import('./pages/superadmin/CreateShop'));
const AdminShopDetail = React.lazy(() => import('./pages/superadmin/ShopDetail'));
const AdminSettings = React.lazy(() => import('./pages/superadmin/AdminSettings'));
const ShopkeeperDashboard = React.lazy(() => import('./pages/shopkeeper/Dashboard'));
const ShopkeeperProducts = React.lazy(() => import('./pages/shopkeeper/Products'));
const ShopkeeperProductForm = React.lazy(() => import('./pages/shopkeeper/ProductForm'));
const ShopkeeperCategories = React.lazy(() => import('./pages/shopkeeper/Categories'));
const ShopkeeperOrders = React.lazy(() => import('./pages/shopkeeper/Orders'));
const ShopkeeperOrderDetail = React.lazy(() => import('./pages/shopkeeper/OrderDetail'));
const ShopkeeperCoupons = React.lazy(() => import('./pages/shopkeeper/Coupons'));
const ShopkeeperReports = React.lazy(() => import('./pages/shopkeeper/Reports'));
const ShopkeeperSettings = React.lazy(() => import('./pages/shopkeeper/ShopSettings'));
const ShopkeeperNotifications = React.lazy(() => import('./pages/shopkeeper/Notifications'));
const ShopkeeperCreateOrder = React.lazy(() => import('./pages/shopkeeper/CreateOrder'));
const ShopkeeperCreateInvoice = React.lazy(() => import('./pages/shopkeeper/CreateInvoice'));
const ShopkeeperPurchaseOrders = React.lazy(() => import('./pages/shopkeeper/PurchaseOrders'));
const ShopkeeperTotalSale = React.lazy(() => import('./pages/shopkeeper/TotalSale'));
const ShopkeeperTotalPurchase = React.lazy(() => import('./pages/shopkeeper/TotalPurchase'));
const ShopkeeperStock = React.lazy(() => import('./pages/shopkeeper/Stock'));
const ShopkeeperQRCodes = React.lazy(() => import('./pages/shopkeeper/QRCodes'));
const CustomerShopHome = React.lazy(() => import('./pages/customer/ShopHome'));
const CustomerProductDetail = React.lazy(() => import('./pages/customer/ProductDetail'));
const CustomerCart = React.lazy(() => import('./pages/customer/Cart'));
const CustomerCheckout = React.lazy(() => import('./pages/customer/Checkout'));
const CustomerOrderConfirmation = React.lazy(() => import('./pages/customer/OrderConfirmation'));
const CustomerOrderTracking = React.lazy(() => import('./pages/customer/OrderTracking'));
const CustomerMyOrders = React.lazy(() => import('./pages/customer/MyOrders'));
const CustomerWishlist = React.lazy(() => import('./pages/customer/Wishlist'));
const CustomerDashboard = React.lazy(() => import('./pages/customer/Dashboard'));
const CustomerShopList = React.lazy(() => import('./pages/customer/ShopList'));

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading fullScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getHomeRoute(user)} /> : <Login />} />
      <Route path="/shopkeeper-login" element={user ? <Navigate to={getHomeRoute(user)} /> : <ShopkeeperLogin />} />

      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="shops/create" element={<AdminCreateShop />} />
        <Route path="shops/:id" element={<AdminShopDetail />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/dashboard" element={<ShopkeeperRoute />}>
        <Route index element={<ShopkeeperDashboard />} />
        <Route path="products" element={<ShopkeeperProducts />} />
        <Route path="products/add" element={<ShopkeeperProductForm />} />
        <Route path="products/edit/:id" element={<ShopkeeperProductForm />} />
        <Route path="categories" element={<ShopkeeperCategories />} />
        <Route path="orders" element={<ShopkeeperOrders />} />
        <Route path="orders/create" element={<ShopkeeperCreateInvoice />} />
        <Route path="orders/:id" element={<ShopkeeperOrderDetail />} />
        <Route path="purchase-orders" element={<ShopkeeperPurchaseOrders />} />
        <Route path="purchase-orders/create" element={<ShopkeeperCreateOrder />} />
        <Route path="total-sale" element={<ShopkeeperTotalSale />} />
        <Route path="total-purchase" element={<ShopkeeperTotalPurchase />} />
        <Route path="stock" element={<ShopkeeperStock />} />
        <Route path="coupons" element={<ShopkeeperCoupons />} />
        <Route path="reports" element={<ShopkeeperReports />} />
        <Route path="settings" element={<ShopkeeperSettings />} />
        <Route path="qr-codes" element={<ShopkeeperQRCodes />} />
        <Route path="notifications" element={<ShopkeeperNotifications />} />
      </Route>

      <Route path="/shop/:slug" element={<CustomerShopHome />} />
      <Route path="/shop/:slug/product/:id" element={<CustomerProductDetail />} />
      <Route path="/track/:id" element={<CustomerOrderTracking />} />

      <Route path="/customer" element={<CustomerRoute />}>
        <Route index element={<CustomerDashboard />} />
        <Route path="shops" element={<CustomerShopList />} />
        <Route path="my-orders" element={<CustomerMyOrders />} />
        <Route path="wishlist" element={<CustomerWishlist />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="checkout" element={<CustomerCheckout />} />
        <Route path="order-confirmation/:id" element={<CustomerOrderConfirmation />} />
      </Route>

      <Route path="/cart" element={<Navigate to="/customer/cart" replace />} />
      <Route path="/my-orders" element={<Navigate to="/customer/my-orders" replace />} />
      <Route path="/wishlist" element={<Navigate to="/customer/wishlist" replace />} />
      <Route path="/checkout" element={<Navigate to="/customer/checkout" replace />} />

      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function getHomeRoute(user) {
  if (user.role === 'superadmin') return '/admin';
  if (user.role === 'shopkeeper') return '/dashboard';
  return '/customer';
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<Loading fullScreen />}>
                <AppRoutes />
              </Suspense>
              <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
              <OfflineIndicator />
              <BackToTop />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

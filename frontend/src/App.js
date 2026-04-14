import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import {  systemAPI } from './services/api';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage         from './pages/HomePage';
import ProductsPage     from './pages/ProductsPage';
import ProductDetail    from './pages/ProductDetail';
import CartPage         from './pages/CartPage';
import CheckoutPage     from './pages/CheckoutPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import ProfilePage      from './pages/ProfilePage';
import OrdersPage       from './pages/OrdersPage';
import OrderDetailPage  from './pages/OrderDetailPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminCodes       from './pages/admin/AdminCodes';
import NotFoundPage     from './pages/NotFoundPage';
import TermsPage        from './pages/TermsPage';
import PrivacyPage      from './pages/PrivacyPage';

// 🛡️ 1. جارد وضع الصيانة (Maintenance Guard)
// 🛡️ 1. جارد وضع الصيانة (المعدل)
const MaintenanceGuard = ({ children }) => {
  const { hasRole } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // استخدمي مسار الـ health بدلاً من dashboard لضمان أنه يعمل للزوار أيضاً
    systemAPI.health() 
      .then(res => {
        // تأكدي أن الباك إند يرسل حالة الصيانة في مسار الـ health
        // إذا لم تكن موجودة بعد، سنفترض أنها false حالياً لتوقف اللوب
        setIsMaintenance(res.data.maintenanceMode || false);
      })
      .catch(() => setIsMaintenance(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isMaintenance && !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-6xl mb-4">🛠️</h1>
          <h2 className="text-white text-3xl font-bold mb-2">الموقع في وضع الصيانة</h2>
          <p className="text-gray-500">نعمل حالياً على تحديثات جديدة، سنعود قريباً جداً.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Guards الأصلية
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children, minRole = 'admin' }) => {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  return hasRole(minRole) ? children : <Navigate to="/" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505]" style={{ overflowX: 'hidden' }}>
      <Navbar />
      <main className="flex-1" style={{ minWidth: 0, overflowX: 'hidden' }}>
        <MaintenanceGuard> {/* 🔒 تغليف كافة المسارات بحماية الصيانة */}
          <Routes>
            {/* Public */}
            <Route path="/"             element={<HomePage />} />
            <Route path="/products"     element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart"         element={<CartPage />} />
            <Route path="/terms"        element={<TermsPage />} />
            <Route path="/privacy"      element={<PrivacyPage />} />

            {/* Auth */}
            <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Protected */}
            <Route path="/checkout"   element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/profile"    element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/orders"     element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />

            {/* Admin */}
            <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute minRole="editor"><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users"    element={<AdminRoute minRole="manager"><AdminUsers /></AdminRoute>} />
            <Route path="/admin/codes"    element={<AdminRoute><AdminCodes /></AdminRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MaintenanceGuard>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
            <AppRoutes />
          
          {/* ✨ تصميم التوست باللون الأسود والأبيض الفخم */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#000', // أسود
                color: '#fff',      // أبيض
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                fontSize: '14px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              },
              success: {
                style: {
                  background: '#fff', // أبيض للنجاح
                  color: '#000',      // نص أسود
                },
                iconTheme: { primary: '#000', secondary: '#fff' },
              },
              error: {
                style: {
                  background: '#1a0000',
                  border: '1px solid #330000',
                  color: '#ff8888',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
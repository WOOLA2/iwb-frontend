import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Service from './pages/Service';
import BrandSuppliers from './pages/BrandSuppliers';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import IncomeStatementPage from './pages/IncomeStatementPage';
import SalesPage from './pages/SalesPage';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import QueryForm from './components/QueryForm';

// ProtectedRoute component to restrict access to admin routes
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult();
          const allowedRoles = ['admin', 'sales', 'finance', 'investor'];
          if (allowedRoles.includes(tokenResult.claims.role)) {
            setUser(currentUser);
          } else {
            setUser(null);
            setError('User lacks required role. Contact administrator to set "admin" role.');
          }
        } else {
          setUser(null);
          setError('No user logged in. Please log in again.');
        }
      } catch (err) {
        if (err.code === 'auth/quota-exceeded') {
          setError('Firebase authentication quota exceeded. Please try again later or upgrade your Firebase plan.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/query-form" element={<QueryForm />} />

        {/* Public routes */}
        <Route path="/service" element={<Service />} />
        <Route path="/brand-suppliers" element={<BrandSuppliers />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/income-statement"
          element={
            <ProtectedRoute>
              <IncomeStatementPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
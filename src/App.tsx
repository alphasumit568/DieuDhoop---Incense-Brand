/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import Quiz from './pages/Quiz';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/admin/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OnboardingWalkthrough from './components/OnboardingWalkthrough';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { ChevronUp } from 'lucide-react';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#1c1917', color: '#fafaf9', borderRadius: '2px', fontSize: '12px', border: '1px solid #44403c' } }} />
          <div className="min-h-screen flex flex-col bg-brand-beige">
            <Navbar />
            <OnboardingWalkthrough />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
            <WhatsAppButton />
            <ScrollToTop />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

function WhatsAppButton() {
  const phone = "919045025153"; // Sample number
  const message = "Namaste! I'm interested in DieuDhoop products.";
  
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      id="whatsapp-button"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WhatsApp" />
    </a>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 bg-brand-stone text-brand-beige p-3 rounded-full shadow-2xl hover:bg-brand-gold transition-colors flex items-center justify-center border border-white/10"
          id="scroll-to-top"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

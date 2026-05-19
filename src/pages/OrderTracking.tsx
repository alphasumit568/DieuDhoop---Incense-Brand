import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Package, Truck, CheckCircle, AlertCircle, Calendar, Hash, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatPrice } from '../lib/utils';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      // Basic validation for Order ID (Firestore uses document IDs)
      const sanitizedId = orderId.trim();
      const orderRef = doc(db, 'orders', sanitizedId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrderData({ id: orderSnap.id, ...orderSnap.data() });
      } else {
        setError('Order not found. Please check your ID and try again.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('An error occurred while tracking your order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'paid', 'shipped', 'delivered'];
    return steps.indexOf(status?.toLowerCase() || 'pending');
  };

  const statusIndex = getStatusStep(orderData?.status);

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-serif text-brand-stone mb-4"
        >
          Track Your Sacred Journey
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs uppercase tracking-[0.3em] text-brand-stone/60 font-bold"
        >
          Enter your Order ID to see the current status of your divine delivery.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 border border-brand-sand shadow-sm mb-12"
      >
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone/40" />
            <input 
              type="text" 
              placeholder="YOUR ORDER ID (e.g. DH1234567890)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-brand-beige/20 border border-brand-sand rounded-none pl-12 py-4 text-xs font-bold uppercase tracking-widest focus:border-brand-gold outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-brand-stone text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Search size={14} />
              </motion.div>
            ) : <Search size={14} />}
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {orderData && (
          <motion.div 
            key="order-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Status Timeline */}
            <div className="grid grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Confirmed', icon: CheckCircle, status: 'pending' },
                { label: 'Paid', icon: CheckCircle, status: 'paid' },
                { label: 'Shipped', icon: Truck, status: 'shipped' },
                { label: 'Delivered', icon: Package, status: 'delivered' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className={cn(
                    "w-10 h-10 rounded-sm flex items-center justify-center mb-3 transition-all duration-500",
                    idx <= statusIndex ? "bg-brand-gold text-white" : "bg-brand-beige/50 text-brand-stone/20"
                  )}>
                    <step.icon size={18} />
                  </div>
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest",
                    idx <= statusIndex ? "text-brand-stone" : "text-brand-stone/30"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-brand-sand p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-6 pb-4 border-b border-brand-sand">
                    Sacred Provisions
                  </h3>
                  <div className="space-y-6">
                    {orderData.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">{item.name}</p>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-brand-stone/40">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-brand-sand space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-stone/40">
                        <span>Sacred Subtotal</span>
                        <span>{formatPrice(orderData.total - (orderData.shipping || 0))}</span>
                      </div>
                      {orderData.shipping > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-stone/40">
                          <span>Energy Exchange (Shipping)</span>
                          <span>{formatPrice(orderData.shipping)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-gold pt-2">
                        <span>Divine Total</span>
                        <span>{formatPrice(orderData.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-brand-sand p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-6 pb-4 border-b border-brand-sand flex items-center gap-2">
                    <MapPin size={14} className="text-brand-gold" />
                    Sacred Destination
                  </h3>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-stone/60 space-y-2">
                    <p className="text-brand-stone">{orderData.shippingAddress?.name}</p>
                    <p>{orderData.shippingAddress?.address}</p>
                    <p>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.zipCode}</p>
                    <p>Contact: {orderData.shippingAddress?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-brand-stone text-white p-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/60 mb-6 flex items-center gap-2">
                    <Calendar size={14} />
                    Order Registry
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Ordered On</p>
                      <p className="text-[10px] font-bold tracking-widest">
                        {orderData.createdAt?.toDate().toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Order ID</p>
                      <p className="text-[10px] font-bold tracking-widest font-mono">#{orderData.id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Current Status</p>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-brand-gold">
                        {orderData.status || 'Processing'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-gold/10 border border-brand-gold/20 p-8">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold leading-relaxed italic text-center">
                    "May the fragrance of these sacred offerings bring peace and prosperity to your abode."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

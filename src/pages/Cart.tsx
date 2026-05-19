import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Gift, Truck, ShieldCheck, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";
import { cn } from "../lib/utils";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const SHIPPING_THRESHOLD = 500;
  const shippingProgress = Math.min((total / SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(SHIPPING_THRESHOLD - total, 0);

  const suggestions = (MOCK_PRODUCTS as Product[]).filter(p => !items.some(i => i.id === p.id)).slice(0, 3);

  const handleCheckout = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center bg-brand-beige/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-cream/50 p-12 rounded-full mb-8 relative"
        >
          <ShoppingBag size={64} className="text-brand-sand" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute inset-0 bg-brand-gold/10 rounded-full blur-2xl"
          />
        </motion.div>
        <h2 className="text-5xl font-serif mb-6 text-brand-stone">Your vessels are empty.</h2>
        <p className="text-stone-500 mb-10 max-w-sm leading-relaxed">Start your journey toward spiritual fragrance and peace. Browse our curated collection of sacred scents.</p>
        <Link 
          to="/shop" 
          className="group relative inline-flex items-center space-x-4 bg-brand-stone text-brand-beige px-12 py-5 rounded-sm font-bold uppercase tracking-[0.3em] text-[10px] overflow-hidden transition-all hover:brightness-125 shadow-2xl"
        >
          <span className="relative z-10">Shop Collection</span>
          <ArrowRight size={14} className="relative z-10 group-hover:translate-x-2 transition-transform" />
        </Link>

        {/* Quick Suggestions for Empty Cart */}
        <div className="mt-32 w-full max-w-4xl px-4">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold mb-12">Recommended for You</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {(MOCK_PRODUCTS as Product[]).slice(0, 3).map(p => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 max-w-7xl mx-auto px-6">
      <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-8xl font-serif text-brand-stone tracking-tight leading-none">Cart.</h1>
          <p className="text-stone-400 mt-6 uppercase tracking-[0.4em] font-bold text-[11px] flex items-center">
            <span className="w-8 h-[1px] bg-brand-gold mr-4"></span>
            Your Selection for Serenity
          </p>
        </div>
        
        {/* Shipping Progress */}
        <div className="bg-brand-cream/30 p-6 rounded-sm border border-brand-sand/30 min-w-[300px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-stone">
              {amountToFreeShipping > 0 
                ? `Add ${formatPrice(amountToFreeShipping)} for free shipping` 
                : "Free shipping unlocked"}
            </span>
            <Truck size={14} className={amountToFreeShipping === 0 ? "text-brand-gold" : "text-stone-300"} />
          </div>
          <div className="h-1 bg-brand-sand/20 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${shippingProgress}%` }}
              className="h-full bg-brand-gold"
            />
          </div>
          <p className="text-[8px] text-stone-400 uppercase tracking-widest text-right">Standard Sacred Delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Items List */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-12">
          <div className="border-t border-brand-sand/30">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  key={`${item.id}-${item.variantName || 'default'}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-10 border-b border-brand-sand/30 group"
                >
                  <div className="flex items-center space-x-8 mb-6 sm:mb-0">
                    <Link to={`/product/${item.id}`} className="block w-24 h-32 md:w-28 md:h-36 overflow-hidden bg-brand-cream/30 rounded-sm flex-shrink-0 relative overflow-hidden group">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </Link>
                    
                    <div className="space-y-2">
                      <Link to={`/product/${item.id}`} className="inline-block">
                        <h3 className="font-serif text-2xl md:text-3xl text-brand-stone leading-tight hover:text-brand-gold transition-colors">{item.name}</h3>
                      </Link>
                      {item.variantName && (
                        <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold px-2 py-0.5 bg-brand-cream inline-block rounded-sm">{item.variantName}</p>
                      )}
                      <p className="text-stone-500 font-mono text-xs">{formatPrice(item.price)} each</p>
                      
                      <div className="flex items-center space-x-6 pt-4">
                        <div className="flex items-center space-x-4 bg-brand-cream/50 rounded-sm px-3 py-1.5 border border-brand-sand/30">
                          <button 
                            onClick={() => updateQuantity(item.id, -1, item.variantName)}
                            className="text-stone-400 hover:text-brand-stone transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1, item.variantName)}
                            className="text-stone-400 hover:text-brand-stone transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <p className="text-brand-stone font-bold text-xl md:text-2xl font-serif">{formatPrice(item.price * item.quantity)}</p>
                    <button 
                      onClick={() => removeItem(item.id, item.variantName)} 
                      className="flex items-center space-x-2 text-[9px] uppercase tracking-widest font-bold text-stone-300 hover:text-brand-saffron transition-all sm:mt-4 group/remove"
                    >
                      <span className="opacity-0 group-hover/remove:opacity-100 -translate-x-2 group-hover/remove:translate-x-0 transition-all">Remove</span>
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Gift Message */}
          <div className="py-8 border-b border-brand-sand/30">
            <button 
              onClick={() => setShowGiftMessage(!showGiftMessage)}
              className="flex items-center space-x-3 group"
            >
              <div className={cn(
                "w-4 h-4 border border-brand-sand flex items-center justify-center transition-colors",
                showGiftMessage ? "bg-brand-stone border-brand-stone" : "bg-transparent"
              )}>
                {showGiftMessage && <Plus size={10} className="text-brand-beige" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-stone group-hover:text-brand-gold transition-colors">Add a divine gift message</span>
              <Gift size={14} className="text-brand-gold ml-2" />
            </button>
            <AnimatePresence>
              {showGiftMessage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6">
                    <textarea 
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write your sacred blessing here..."
                      className="w-full bg-brand-cream/30 border border-brand-sand/50 p-6 rounded-sm text-sm focus:outline-none focus:border-brand-gold min-h-[120px] font-sans"
                    />
                    <p className="text-[9px] text-stone-400 mt-2 uppercase tracking-widest">Handwritten on seed paper for 100% sacredness.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sacred Companions (Suggestions) */}
          {suggestions.length > 0 && (
            <div className="pt-20">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold">Sacred Companions</h3>
                <div className="h-[1px] flex-grow bg-brand-sand/30 mx-8"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {suggestions.map(p => (
                  <div key={p.id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-12 xl:col-span-4 xl:col-start-9 lg:sticky lg:top-40 h-fit space-y-8">
          <div className="bg-brand-stone text-brand-beige p-10 rounded-sm shadow-2xl relative overflow-hidden">
            {/* Texture background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <h3 className="font-serif text-3xl mb-10">Order Summary</h3>
            
            <div className="space-y-6 mb-10 relative z-10">
              <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold text-brand-beige/60">
                <span>Sacred Items Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold text-brand-beige/60">
                <span>Spiritual Handling</span>
                <span className="text-brand-gold italic">Gratis</span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold text-brand-beige/60">
                <span>Taxes & Duties</span>
                <span>Included</span>
              </div>
              
              <div className="border-t border-brand-beige/10 pt-8 flex justify-between font-serif text-3xl">
                <span className="text-brand-beige/80">Total</span>
                <span className="text-brand-gold">{formatPrice(total)}</span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10"
            >
              <Link 
                to="/checkout"
                onClick={handleCheckout}
                className="w-full bg-brand-gold text-brand-stone py-6 rounded-sm font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center space-x-3 transition-all hover:bg-white shadow-[0_20px_50px_rgba(212,175,55,0.3)] border border-brand-gold"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
              <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest font-bold text-brand-beige/40">
                <ShieldCheck size={12} className="text-brand-gold" />
                <span>Encrypted Security</span>
              </div>
              <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest font-bold text-brand-beige/40">
                <Heart size={12} className="text-brand-gold" />
                <span>Ethically Sourced</span>
              </div>
            </div>
          </div>

          {/* Extra Info Card */}
          <div className="bg-brand-cream/30 p-8 rounded-sm border border-brand-sand/30">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-stone mb-4">Need Guidance?</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed mb-6 font-medium">Our master blenders are available to assist you in selecting the perfect aroma for your ritual.</p>
            <Link to="/contact" className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-gold hover:text-brand-stone transition-colors border-b border-brand-gold/30 pb-1">
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

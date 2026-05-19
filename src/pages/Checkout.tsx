import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: "percent" | "flat" } | null>(null);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return (total * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const discountedTotal = total - calculateDiscount();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponError("");
    setLoading(true);
    
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAppliedCoupon({ 
          code: data.code, 
          discount: data.discount, 
          type: data.type as any 
        });
        setCouponCode("");
      } else {
        setCouponError(data.error || "Invalid spiritual code. Please try again.");
      }
    } catch (error) {
      console.error("Coupon lookup failed", error);
      setCouponError("Unable to verify code at this moment.");
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleOnlinePayment = async () => {
    // 1. Create order on backend
    const orderResponse = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: discountedTotal }),
    });
    const orderData = await orderResponse.json();

    // 2. Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "DieuDhoop",
      description: "Divine Incense Purchase",
      order_id: orderData.id,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // 3. Verify payment on backend
        const verifyResponse = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const verifyData = await verifyResponse.json();

        if (verifyData.status === "success") {
          // 4. Save order to Firestore
          await addDoc(collection(db, "orders"), {
            userId: user?.id,
            items,
            subtotal: total,
            discount: calculateDiscount(),
            totalAmount: discountedTotal,
            appliedCoupon: appliedCoupon?.code || null,
            status: "paid",
            paymentMethod: "online",
            shippingAddress: formData,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            createdAt: serverTimestamp()
          });

          // 5. Send WhatsApp notification
          await fetch("/api/notifications/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: formData.phone,
              message: `Namaste ${formData.name}! Your DieuDhoop order has been placed successfully. Order ID: ${response.razorpay_order_id}. Divine fragrance is on its way.`
            })
          });

          clearCart();
          navigate("/profile");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: { color: "#c5a059" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleCODPayment = async () => {
    const orderId = `order_cod_${Math.random().toString(36).slice(2, 10)}`;
    
    // 1. Save order to Firestore
    await addDoc(collection(db, "orders"), {
      userId: user?.id,
      items,
      subtotal: total,
      discount: calculateDiscount(),
      totalAmount: discountedTotal,
      appliedCoupon: appliedCoupon?.code || null,
      status: "pending",
      paymentMethod: "cod",
      shippingAddress: formData,
      orderId: orderId,
      createdAt: serverTimestamp()
    });

    // 2. Send WhatsApp notification
    await fetch("/api/notifications/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: formData.phone,
        message: `Namaste ${formData.name}! Your DieuDhoop order (Cash on Delivery) has been placed successfully. Order ID: ${orderId}. Please keep ₹${discountedTotal} ready for our delivery partner.`
      })
    });

    clearCart();
    navigate("/profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "online") {
        await handleOnlinePayment();
      } else {
        await handleCODPayment();
      }
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-4"
    >
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-2 text-brand-stone hover:text-brand-gold transition-colors mb-10 text-[11px] uppercase font-bold tracking-[0.2em] group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Vessel</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif mb-12">Checkout.</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Full Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} required />
                <Input label="Email Address" type="email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} required />
              </div>
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={(v: string) => setFormData({ ...formData, phone: v })} required />
              <Input label="Shipping Address" value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} required />
              <div className="grid grid-cols-2 gap-6">
                <Input label="City" value={formData.city} onChange={(v: string) => setFormData({ ...formData, city: v })} required />
                <Input label="Pincode" value={formData.pincode} onChange={(v: string) => setFormData({ ...formData, pincode: v })} required />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-stone/40 block">Select Offering Method</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod("online")}
                  className={cn(
                    "p-6 border rounded-sm cursor-pointer transition-all flex flex-col space-y-2",
                    paymentMethod === "online" ? "border-brand-gold bg-brand-gold/5" : "border-brand-border bg-white"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">Online Payment</span>
                    {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                  </div>
                  <span className="text-[9px] text-brand-stone/40 uppercase">Razorpay / UPI / Cards</span>
                </div>
                <div 
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "p-6 border rounded-sm cursor-pointer transition-all flex flex-col space-y-2",
                    paymentMethod === "cod" ? "border-brand-gold bg-brand-gold/5" : "border-brand-border bg-white"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">Cash on Delivery</span>
                    {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                  </div>
                  <span className="text-[9px] text-brand-stone/40 uppercase">Pay when peace arrives</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <motion.button 
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-brand-stone text-brand-beige py-6 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-2 hover:brightness-125 transition-all shadow-xl disabled:opacity-50 border border-white/10"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <span>{paymentMethod === "online" ? "Complete Sacred Payment" : "Place Order (COD)"}</span>
                )}
              </motion.button>
              
              <button 
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full py-4 text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400 hover:text-stone-800 transition-colors"
              >
                Return to Vessel
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-brand-cream p-10 rounded-sm border border-brand-sand sticky top-40">
            <h3 className="font-serif text-2xl mb-8">Sacred Order</h3>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs items-center">
                  <span className="text-stone-600 font-medium">{item.name} x {item.quantity}</span>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <div className="pt-6 border-t border-brand-sand">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="COUPON CODE" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-grow bg-white border border-brand-sand px-4 py-3 text-[10px] uppercase font-bold tracking-widest outline-none focus:ring-1 focus:ring-brand-gold rounded-sm"
                    />
                    <motion.button 
                      type="submit"
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                      className="bg-brand-stone text-brand-beige px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-125 transition-all border border-white/10 flex items-center justify-center min-w-[80px] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : "Apply"}
                    </motion.button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-brand-gold/10 p-3 rounded-sm border border-brand-gold/20">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-brand-gold tracking-widest uppercase">Coupon Applied</span>
                      <span className="text-[9px] font-medium text-brand-stone">{appliedCoupon.code}</span>
                    </div>
                    <button 
                      onClick={removeCoupon}
                      className="text-[9px] font-bold text-brand-saffron uppercase tracking-widest hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[9px] text-brand-saffron font-bold mt-2 uppercase tracking-widest">{couponError}</p>}
              </div>

              <div className="space-y-2 pt-6 border-t border-brand-sand">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-brand-gold font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(calculateDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl pt-2 text-brand-stone">
                  <span>Divine Total</span>
                  <span>{formatPrice(discountedTotal)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-stone-400 uppercase tracking-widest bg-white p-4 rounded-sm border border-brand-sand">
              <ShieldCheck size={20} className="text-brand-gold" />
              <span>Payments are encrypted and secured by industrial Vedic standards.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">{label}</label>
      <input 
        type={type} 
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 bg-white border border-brand-sand rounded-sm text-sm outline-none focus:ring-1 focus:ring-brand-gold" 
      />
    </div>
  );
}

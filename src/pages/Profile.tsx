import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Package, Heart, LogOut, Settings, ChevronRight, Zap, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, signOut, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "orders");
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const ordersQ = query(
          collection(db, "orders"), 
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const ordersSnapshot = await getDocs(ordersQ);
        setOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const subsQ = query(
          collection(db, "userSubscriptions"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const subsSnapshot = await getDocs(subsQ);
        setSubscriptions(subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error: any) {
        // Only log if it's not a permissions error (which we expect for JWT users)
        if (!error.message?.includes("permissions")) {
          console.error("Error fetching profile data:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
         return alert("Essence image too heavy. Keep it under 5MB.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(editForm);
    } catch (err) {
      // Error handled by context toast
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user) return (
    <div className="pt-40 text-center">
      <h2 className="text-4xl font-serif mb-6">Please login to view your temple.</h2>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center space-x-4 border-b border-brand-border pb-8">
            <div className={`w-16 h-16 rounded-full ${user?.avatar ? '' : 'bg-brand-gold'} flex items-center justify-center text-white text-2xl font-serif shadow-lg overflow-hidden`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif text-brand-stone break-all">{user?.name}</h2>
                {user?.role === "admin" && (
                  <span className="bg-brand-gold/10 text-brand-gold text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-brand-gold/20 flex items-center gap-1 shrink-0">
                    <Zap size={8} className="fill-brand-gold" /> Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] text-brand-saffron uppercase tracking-[0.2em] font-bold">Divine Member</p>
            </div>
          </div>

          <div className="space-y-2">
            <TabButton 
              active={activeTab === "orders"} 
              onClick={() => setActiveTab("orders")}
              icon={<Package size={18} />} 
              label="Orders" 
            />
            <TabButton 
              active={activeTab === "subscriptions"} 
              onClick={() => setActiveTab("subscriptions")}
              icon={<Zap size={18} />} 
              label="Divine Rituals" 
            />
            <TabButton 
              active={activeTab === "wishlist"} 
              onClick={() => setActiveTab("wishlist")}
              icon={<Heart size={18} />} 
              label="Wishlist" 
            />
            <TabButton 
              active={activeTab === "settings"} 
              onClick={() => setActiveTab("settings")}
              icon={<Settings size={18} />} 
              label="Settings" 
            />
            {user?.role === "admin" && (
              <button 
                onClick={() => navigate("/admin")}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-sm text-brand-gold hover:bg-brand-cream transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
              >
                <Settings size={18} className="animate-spin-slow" />
                <span>Admin Dashboard</span>
              </button>
            )}
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center space-x-4 px-6 py-4 rounded-sm text-brand-stone/40 hover:bg-red-50 hover:text-red-500 transition-all font-bold uppercase tracking-[0.2em] text-[10px] border border-transparent hover:border-red-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron block mb-2">Member Repository</span>
                <h3 className="text-4xl font-serif">Order History.</h3>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-brand-sand/20 rounded-sm" />)}
                </div>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="bg-white border border-brand-border p-8 rounded-sm flex justify-between items-center group cursor-pointer hover:border-brand-gold transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-8">
                      <div className="bg-brand-beige border border-brand-border p-4 rounded-sm">
                        <Package className="text-brand-gold" size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-brand-stone/40 tracking-[0.2em] uppercase">ID: {order.id.slice(0, 8)}</p>
                        <h4 className="text-xl font-serif text-brand-stone group-hover:text-brand-gold transition-colors">{order.items?.[0]?.name} {order.items.length > 1 && `+ ${order.items.length - 1} products`}</h4>
                        <p className="text-[10px] font-bold text-brand-stone/60 uppercase tracking-widest mt-1">{(order.createdAt as Timestamp)?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-8">
                      <div>
                        <p className="text-base font-bold text-brand-stone">{formatPrice(order.totalAmount)}</p>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-saffron">{order.status}</span>
                          <span className="text-[8px] uppercase tracking-widest font-bold text-brand-stone/30 mt-1">{order.paymentMethod === "online" ? "Paid Online" : "Cash on Delivery"}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-brand-stone/20 group-hover:text-brand-stone transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 bg-white border border-brand-border border-dashed rounded-sm">
                  <p className="text-serif text-2xl text-brand-stone/30 italic">"Your order history is currently as clear as a silent meditation."</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "subscriptions" && (
            <div className="space-y-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron block mb-2">Sacred Commitment</span>
                <h3 className="text-4xl font-serif">Divine Rituals.</h3>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-40 bg-brand-sand/20 rounded-sm" />)}
                </div>
              ) : subscriptions.length > 0 ? (
                subscriptions.map(sub => (
                  <div key={sub.id} className="bg-white border border-brand-border p-8 rounded-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-brand-gold/10 px-4 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                      {sub.status}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center space-x-8">
                        <div className="bg-brand-beige border border-brand-border p-4 rounded-sm">
                          <RefreshCw className="text-brand-gold animate-spin-slow" size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-brand-stone/40 tracking-[0.2em] uppercase">MEMBER SINCE: {sub.startDate?.toDate().toLocaleDateString()}</p>
                          <h4 className="text-xl font-serif text-brand-stone">{sub.planId.replace(/_/g, " ")}</h4>
                          <p className="text-[10px] font-bold text-brand-stone/60 uppercase tracking-widest mt-1">Next delivery: {sub.currentPeriodEnd?.toDate ? sub.currentPeriodEnd.toDate().toLocaleDateString() : new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="text-[10px] uppercase tracking-widest font-bold text-brand-stone border border-brand-border px-6 py-3 rounded-sm hover:bg-brand-sand transition-all">
                          Manage Plan
                        </button>
                        <button className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:underline transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 bg-white border border-brand-border border-dashed rounded-sm">
                  <p className="text-serif text-2xl text-brand-stone/30 italic mb-8">"You have no active sacred rituals."</p>
                  <button 
                    onClick={() => navigate("/subscriptions")}
                    className="inline-flex items-center space-x-2 text-brand-gold uppercase tracking-[0.2em] font-bold text-[11px] hover:brightness-110"
                  >
                    <span>View Divine Plans</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "wishlist" && (
             <div className="text-center py-20 bg-brand-cream/30 rounded-sm border border-brand-sand border-dashed">
             <p className="text-serif text-xl text-stone-400 italic">"The desires of the heart will manifest here soon."</p>
           </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron block mb-2">Sacred Configuration</span>
                <h3 className="text-4xl font-serif">Adept Settings.</h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="bg-white border border-brand-border p-10 rounded-sm space-y-10 max-w-2xl shadow-sm">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-brand-beige border-2 border-brand-gold/30 flex items-center justify-center overflow-hidden shadow-inner">
                      {editForm.avatar ? (
                        <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-serif text-brand-gold">{user?.name?.[0]}</span>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <span className="text-[8px] text-white font-bold uppercase tracking-widest text-center px-2">Update Essence</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-stone/40">Temporal Name</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-brand-cream/10 border border-brand-border p-3 rounded-sm outline-none focus:ring-1 focus:ring-brand-gold font-serif transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-stone/40">Communication Channel (Email)</label>
                      <input 
                        type="email" 
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full bg-brand-cream/10 border border-brand-border p-3 rounded-sm outline-none focus:ring-1 focus:ring-brand-gold font-serif transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="bg-brand-stone text-brand-beige px-10 py-4 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 transition-all flex items-center space-x-3 disabled:opacity-50 shadow-lg"
                  >
                    {saving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Zap size={14} className="fill-brand-beige" />
                    )}
                    <span>{saving ? "Updating..." : "Seal Changes"}</span>
                  </motion.button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, label, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-4 px-6 py-4 rounded-sm transition-all font-bold uppercase tracking-[0.2em] text-[10px] border",
        active ? "bg-brand-stone text-brand-beige border-brand-stone shadow-lg" : "text-brand-stone/40 hover:bg-brand-sand/50 hover:text-brand-stone border-transparent"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

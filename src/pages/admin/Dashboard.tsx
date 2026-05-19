import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { formatPrice } from "../../lib/utils";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Bell,
  Ticket,
  Check,
  X,
  Package,
  Eye,
  AlertCircle,
  MoreVertical,
  LogOut,
  Maximize2,
  Minimize2,
  BellRing,
  Search,
  User as UserIcon,
  MapPin,
  CreditCard,
  History,
  Truck,
  Upload,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, getCountFromServer } from "firebase/firestore";
import { storage, ref, uploadBytes, getDownloadURL } from "../../lib/firebase";

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });

  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [newCoupon, setNewCoupon] = useState({ code: "", discount: 0, type: "percent", active: true, expiresAt: "" });
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: 0, 
    discountPrice: 0, 
    stock: 0, 
    description: "", 
    categories: [] as string[],
    images: [] as string[],
    variants: [] as any[],
    tags: [] as string[]
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState({ name: "", description: "", slug: "", image: "" });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    // Real-time Coupons
    const qCoupons = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
    const unsubCoupons = onSnapshot(qCoupons, (snapshot) => {
      const fetchedCoupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Auto-deactivate expired coupons (run once when they change)
      const now = new Date();
      fetchedCoupons.forEach((coupon: any) => {
        if (coupon.active && coupon.expiresAt) {
          const expiryDate = new Date(coupon.expiresAt);
          if (now > expiryDate) {
            // Only update if it's currently active in Firestore
            // We use a separate async function to avoid blocking the snapshot processing
            const deactivate = async () => {
              try {
                await updateDoc(doc(db, "coupons", coupon.id), { active: false });
              } catch (err) {
                console.error("Auto-deactivate failed:", err);
              }
            };
            deactivate();
          }
        }
      });

      setCoupons(fetchedCoupons);
    }, (error) => {
      if (!error.message.includes("permissions")) console.error("Coupon fetch error:", error);
    });

    // Real-time Orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      // Calculate Stats
      const totalRev = ordersData.reduce((acc, curr: any) => acc + (curr.totalAmount || 0), 0);
      setStats(prev => ({ ...prev, revenue: totalRev, orders: ordersData.length }));
    }, (error) => {
      console.error("Order fetch error:", error);
    });

    // Real-time Products
    const qProducts = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const prodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodsData);
      setStats(prev => ({ ...prev, products: prodsData.length }));
    }, (error) => {
      console.error("Product fetch error:", error);
    });

    // Real-time Categories
    const qCategories = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(catsData);
    }, (error) => {
      console.error("Category fetch error:", error);
    });

    // Real-time Users count
    const qUsers = collection(db, "users");
    getCountFromServer(qUsers).then(snapshot => {
      setStats(prev => ({ ...prev, customers: snapshot.data().count }));
    }).catch(error => {
      console.error("User count error:", error);
    });

    // Mock Notifications
    setNotifications([
      { id: 1, title: "New Order", message: "Sumit Sharma placed an order for ₹1,249", time: "2 mins ago", unread: true },
      { id: 2, title: "Stock Alert", message: "Vedic Rose Cones is running low (4 Left)", time: "1 hour ago", unread: true },
      { id: 3, title: "System", message: "Divine Repository Backup Completed", time: "5 hours ago", unread: false },
    ]);

    return () => {
      unsubCoupons();
      unsubOrders();
      unsubProducts();
      unsubCategories();
    };
  }, [user?.role]);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCouponId) {
        await updateDoc(doc(db, "coupons", editingCouponId), {
          ...newCoupon,
          discount: Number(newCoupon.discount)
        });
        setEditingCouponId(null);
      } else {
        await addDoc(collection(db, "coupons"), {
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          discount: Number(newCoupon.discount),
          createdAt: serverTimestamp()
        });
      }
      setNewCoupon({ code: "", discount: 0, type: "percent", active: true, expiresAt: "" });
      setIsAddingCoupon(false);
    } catch (err) {
      console.error("Error saving coupon:", err);
    }
  };

  const startEditCoupon = (coupon: any) => {
    setNewCoupon({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      active: coupon.active,
      expiresAt: coupon.expiresAt || ""
    });
    setEditingCouponId(coupon.id);
    setIsAddingCoupon(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sacred code?")) {
      await deleteDoc(doc(db, "coupons", id));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), {
          ...newProduct,
          updatedAt: serverTimestamp()
        });
        setEditingProductId(null);
      } else {
        await addDoc(collection(db, "products"), {
          ...newProduct,
          createdAt: serverTimestamp()
        });
      }
      setNewProduct({ 
        name: "", 
        price: 0, 
        discountPrice: 0, 
        stock: 0, 
        description: "", 
        categories: [], 
        tags: [],
        images: [],
        variants: []
      });
      setIsAddingProduct(false);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const startEditProduct = (prod: any) => {
    setNewProduct({
      name: prod.name,
      price: prod.price,
      discountPrice: prod.discountPrice || 0,
      stock: prod.stock || 0,
      description: prod.description || "",
      categories: prod.categories || [],
      tags: prod.tags || [],
      images: prod.images || [],
      variants: prod.variants || []
    });
    setEditingProductId(prod.id);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Delete this divine aroma permanently?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await updateDoc(doc(db, "categories", editingCategoryId), {
          ...newCategory,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
          updatedAt: serverTimestamp()
        });
        setEditingCategoryId(null);
      } else {
        await addDoc(collection(db, "categories"), {
          ...newCategory,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
          createdAt: serverTimestamp()
        });
      }
      setNewCategory({ name: "", description: "", slug: "", image: "" });
      setIsAddingCategory(false);
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  const startEditCategory = (cat: any) => {
    setNewCategory({
      name: cat.name,
      description: cat.description || "",
      slug: cat.slug || "",
      image: cat.image || ""
    });
    setEditingCategoryId(cat.id);
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Banish this sacred grouping permanently?")) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  if (authLoading) return null;
  
  // Security: only allow if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="pt-40 text-center px-4">
        <div className="bg-red-50 text-red-600 p-10 rounded-3xl border border-red-100 max-w-xl mx-auto">
          <h2 className="text-4xl font-serif mb-4 uppercase tracking-tighter">Access Denied.</h2>
          <p className="font-medium">Only Divine Guardians may enter the Sacred Repository.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 bg-brand-cream/20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-brand-gold font-bold tracking-widest text-[10px] uppercase">Admin Repository</span>
              <span className="h-1 w-1 bg-stone-300 rounded-full"></span>
              <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">DieuDhoop v2.0</span>
            </div>
            <h1 className="text-4xl font-serif">Sanctuary Management.</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-white p-3 rounded-full border border-brand-sand hover:bg-brand-cream transition-all relative"
              >
                <Bell size={20} className={notifications.some(n => n.unread) ? "text-brand-gold animate-pulse" : "text-stone-600"} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-brand-saffron border-2 border-white rounded-full"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-white border border-brand-sand shadow-2xl rounded-sm z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-brand-sand bg-stone-50 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Divinity Alerts</span>
                      <button onClick={() => setNotifications([])} className="text-[9px] text-stone-400 hover:text-brand-saffron">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={cn("p-4 border-b border-brand-sand hover:bg-stone-50 transition-colors", n.unread && "bg-brand-cream/20")}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold">{n.title}</h4>
                            <span className="text-[8px] text-stone-400 font-bold uppercase">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-8 text-center">
                          <BellRing size={24} className="mx-auto text-stone-200 mb-2" />
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">All clear in the sanctuary.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => {
                setIsAddingProduct(true);
                setActiveTab("products");
              }}
              className="bg-stone-900 text-brand-beige px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-black transition-all shadow-lg border border-white/10"
            >
              <Plus size={16} />
              <span>New Product</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-10 border-b border-brand-sand overflow-x-auto whitespace-nowrap">
          {["overview", "products", "orders", "tracking", "coupons", "categories"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative flex items-center space-x-2",
                activeTab === tab ? "text-brand-gold" : "text-stone-400 hover:text-stone-600"
              )}
            >
              {tab === "tracking" && <Truck size={12} />}
              <span>{tab}</span>
              {activeTab === tab && (
                <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<IndianRupee />} label="Total Revenue" value={formatPrice(stats.revenue)} trend="+100% (New Store)" />
              <StatCard icon={<ShoppingBag />} label="Orders" value={stats.orders.toString()} trend="All-time active" />
              <StatCard icon={<Users />} label="Customers" value={stats.customers.toString()} trend="Divine Souls" />
              <StatCard icon={<TrendingUp />} label="Divinity Products" value={stats.products.toString()} trend="Active Listings" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <RecentOrdersTable orders={orders} updateStatus={updateOrderStatus} />
              </div>
              <div className="space-y-6">
                <InsightCard />
                <InventoryPreview products={products} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Product Repository</h2>
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{products.length} Products Found</div>
            </div>
            
            <AnimatePresence>
              {isAddingProduct && (
                <ProductForm 
                  product={newProduct} 
                  setProduct={setNewProduct} 
                  onSubmit={handleProductSubmit} 
                  onCancel={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                    setNewProduct({ name: "", price: 0, discountPrice: 0, stock: 0, description: "", categories: [], tags: [], images: [], variants: [] });
                  }} 
                  isEditing={!!editingProductId}
                  categories={categories}
                />
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="bg-white border border-brand-sand p-6 rounded-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-brand-cream rounded-sm flex items-center justify-center overflow-hidden border border-brand-sand">
                        {prod.images?.[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-stone-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{prod.name}</h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{prod.categories?.[0] || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => startEditProduct(prod)} className="p-2 text-stone-400 hover:text-brand-gold"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-stone-300 hover:text-brand-saffron"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-brand-stone">{formatPrice(prod.price)}</p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest", prod.stock < 10 ? "text-brand-saffron" : "text-green-600")}>
                        {prod.stock} in Stock
                      </p>
                    </div>
                    <Link to={`/product/${prod.id}`} className="text-[9px] font-bold uppercase tracking-widest text-brand-gold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={10} /> View Live
                    </Link>
                  </div>
                </div>
              ))}
              {products.length === 0 && !isAddingProduct && (
                <div 
                  onClick={() => setIsAddingProduct(true)}
                  className="col-span-full py-20 border-2 border-dashed border-brand-sand rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <Package size={40} className="text-stone-200 mb-4" />
                  <p className="font-serif text-xl text-stone-400 mb-2">No divinity found yet.</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">Click to manifest first product</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <RecentOrdersTable orders={orders} updateStatus={updateOrderStatus} full />
        )}

        {activeTab === "tracking" && (
          <OrderTrackingTable orders={orders} updateStatus={updateOrderStatus} />
        )}

        {activeTab === "coupons" && (
          <div className="space-y-8">
             {/* Original Coupon Content shifted here */}
             <div className="bg-white rounded-sm border border-brand-sand overflow-hidden shadow-sm">
              <div className="p-6 border-b border-brand-sand flex justify-between items-center bg-stone-50">
                <div className="flex items-center space-x-2">
                  <Ticket size={18} className="text-brand-gold" />
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-800">Coupon Mastery</h3>
                </div>
                <button 
                  onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                  className="bg-stone-900 text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:brightness-110 flex items-center space-x-2 shadow-md border border-white/10"
                >
                  <Plus size={12} />
                  <span>{isAddingCoupon ? "Cancel" : "New Coupon"}</span>
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence>
                  {isAddingCoupon && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCouponSubmit}
                      className="mb-8 p-6 bg-brand-cream/30 rounded-sm border border-brand-sand border-dashed space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-400">Code</label>
                          <input 
                            required
                            type="text" 
                            value={newCoupon.code}
                            onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                            placeholder="e.g. FESTIVE20"
                            className="w-full bg-white border border-brand-sand p-2 text-xs uppercase outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-400">Discount</label>
                          <input 
                            required
                            type="number" 
                            value={newCoupon.discount}
                            onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                            className="w-full bg-white border border-brand-sand p-2 text-xs outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-400">Type</label>
                          <select 
                            value={newCoupon.type}
                            onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}
                            className="w-full bg-white border border-brand-sand p-2 text-xs outline-none focus:ring-1 focus:ring-brand-gold"
                          >
                            <option value="percent">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-400">Expiry Date</label>
                          <input 
                            type="datetime-local" 
                            value={newCoupon.expiresAt}
                            onChange={e => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
                            className="w-full bg-white border border-brand-sand p-2 text-xs outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                        <div className="flex items-end pb-1 space-x-2">
                           <button 
                             type="submit"
                             className="flex-grow bg-brand-stone text-brand-beige py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-125 transition-all border border-white/10"
                           >
                             {editingCouponId ? "Update" : "Create Spirit"}
                           </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border border-brand-sand rounded-sm hover:bg-stone-50 transition-colors group">
                      <div className="flex items-center space-x-6">
                        <div className="w-10 h-10 bg-brand-cream border border-brand-sand flex items-center justify-center rounded-sm">
                          <Ticket size={16} className={coupon.active ? "text-brand-gold" : "text-stone-300"} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-bold tracking-widest text-brand-stone">{coupon.code}</h4>
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "text-[8px] px-2 py-0.5 rounded-full uppercase font-bold",
                                coupon.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                              )}>
                                {coupon.active ? "Active" : "Inactive"}
                              </span>
                              {coupon.expiresAt && new Date(coupon.expiresAt) < new Date() && (
                                <span className="text-[8px] px-2 py-0.5 rounded-full uppercase font-bold bg-stone-100 text-stone-500 border border-brand-sand">
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-500 font-medium pt-1">
                            {coupon.type === "percent" ? `${coupon.discount}% Off` : `₹${coupon.discount} Flat Discount`}
                            {coupon.expiresAt && (
                              <span className={cn(
                                "ml-3 italic",
                                new Date(coupon.expiresAt) < new Date() ? "text-brand-saffron font-bold" : "text-stone-400"
                              )}>
                                • {new Date(coupon.expiresAt) < new Date() ? 'Was' : 'Expires'}: {new Date(coupon.expiresAt).toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditCoupon(coupon)}
                          className="p-2 text-stone-400 hover:text-brand-gold"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 text-stone-300 hover:text-brand-saffron"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && !isAddingCoupon && (
                    <div className="text-center py-12 border-2 border-dashed border-brand-sand rounded-sm">
                      <Ticket size={24} className="mx-auto text-stone-200 mb-2" />
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">No sacred codes found yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 border border-brand-sand rounded-sm shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="bg-brand-cream p-2 rounded-sm text-brand-gold">
                  <Maximize2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-serif">Category Repository</h2>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Manage Sacred Groupings</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="bg-brand-stone text-brand-beige px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:brightness-125 transition-all shadow-md flex items-center space-x-2"
              >
                <Plus size={14} />
                <span>{isAddingCategory ? "Close Form" : "New Category"}</span>
              </button>
            </div>

            <AnimatePresence>
              {isAddingCategory && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-8 border border-brand-sand rounded-sm shadow-xl"
                >
                  <form onSubmit={handleCategorySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <AdminInput label="Category Name" value={newCategory.name} onChange={(v:any) => setNewCategory({...newCategory, name: v})} required />
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Category Essence (Description)</label>
                          <textarea 
                            rows={3}
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                            className="w-full bg-stone-50 border border-brand-sand p-4 text-xs font-serif outline-none focus:ring-1 focus:ring-brand-gold rounded-sm"
                            placeholder="Essence of ancient forests..."
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <AdminImageUpload label="Sacred Visualization" value={newCategory.image} onChange={(v:any) => setNewCategory({...newCategory, image: v})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 border-t border-brand-sand">
                      <button type="button" onClick={() => { setIsAddingCategory(false); setEditingCategoryId(null); }} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Discard</button>
                      <button type="submit" className="bg-brand-gold text-brand-stone px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 shadow-lg">
                        {editingCategoryId ? "Update Category" : "Establish Category"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white border border-brand-sand p-4 rounded-sm flex flex-col group hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] bg-brand-cream rounded-sm mb-4 overflow-hidden relative">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <ImageIcon className="absolute inset-0 m-auto text-stone-200" size={32} />
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold tracking-widest text-brand-stone uppercase">{cat.name}</h4>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditCategory(cat)} className="p-1.5 text-stone-400 hover:text-brand-gold"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-stone-300 hover:text-brand-saffron"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-2 italic mb-4">{cat.description || "No divine essence defined."}</p>
                  <div className="mt-auto pt-4 border-t border-brand-sand flex justify-between items-center">
                    <span className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">
                      {products.filter(p => p.categories?.includes(cat.name)).length} Products
                    </span>
                    <span className="text-[8px] font-mono text-stone-300 uppercase">{cat.slug}</span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && !isAddingCategory && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-sand rounded-sm">
                  <Plus size={32} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-sm font-serif text-stone-400">The sacred scrolls are blank.</p>
                  <button onClick={() => setIsAddingCategory(true)} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:underline">Establish first grouping</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "paid":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "shipped":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
};

function OrderTrackingTable({ orders, updateStatus }: any) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order: any) => 
    statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="bg-white rounded-sm border border-brand-sand overflow-hidden shadow-sm">
      <div className="p-6 border-b border-brand-sand bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-cream p-2 rounded-sm">
            <Truck size={18} className="text-brand-gold" />
          </div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-800">Order Logistics & Tracking</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border transition-all",
                statusFilter === status 
                  ? "bg-brand-stone text-white border-brand-stone" 
                  : "bg-white text-stone-400 border-brand-sand hover:border-brand-gold shadow-sm"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          Showing {filteredOrders.length} Sacred Shipments
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-sand text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4 text-right">Quick Update Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sand">
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">#{order.id.slice(-8)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-brand-sand rounded-full flex items-center justify-center text-[10px] font-serif uppercase shrink-0">
                      {order.shippingAddress?.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-bold text-stone-700">{order.shippingAddress?.name || 'Anonymous Seeker'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[8px] font-bold px-2 py-1 rounded-xs uppercase tracking-widest border flex items-center w-fit gap-1.5",
                    getStatusBadge(order.status)
                  )}>
                    <div className="w-1 h-1 rounded-full bg-current" />
                    {order.status || "processing"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {["pending", "paid"].includes(order.status?.toLowerCase()) && (
                      <button 
                        onClick={() => updateStatus(order.id, "shipped")}
                        className="bg-brand-gold text-white px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest hover:brightness-110 shadow-sm flex items-center gap-2"
                      >
                        <Package size={12} />
                        Ship Items
                      </button>
                    )}
                    {order.status?.toLowerCase() === "shipped" && (
                      <button 
                        onClick={() => updateStatus(order.id, "delivered")}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest hover:brightness-110 shadow-sm flex items-center gap-2"
                      >
                        <Check size={12} />
                        Deliver
                      </button>
                    )}
                    <select 
                      value={order.status || "pending"}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-[9px] font-bold bg-white border border-brand-sand rounded-sm px-2 py-1.5 uppercase tracking-widest focus:ring-1 focus:ring-brand-gold outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <AlertCircle size={24} className="mx-auto text-stone-200 mb-2" />
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">No active logistics records found matching this ritual state.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentOrdersTable({ orders, updateStatus, full = false }: any) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === "all" || order.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase();
    const searchStr = (order.shippingAddress?.name || "") + (order.shippingAddress?.email || "") + (order.id || "");
    const matchesSearch = searchStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className={cn("bg-white rounded-sm border border-brand-sand overflow-hidden shadow-sm", full && "min-h-[500px]")}>
      <div className="p-6 border-b border-brand-sand flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 gap-4">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-800">Sacred Transactions</h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search Seekers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-brand-sand rounded-sm text-[10px] w-full md:w-48 outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-brand-sand rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-brand-sand rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="all">All Payments</option>
            <option value="online">Online</option>
            <option value="cod">COD</option>
          </select>

          {!full && <button className="text-brand-gold text-[10px] font-bold uppercase tracking-widest hover:underline ml-2">View All</button>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-sand text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              <th className="px-6 py-4">Seeker</th>
              <th className="px-6 py-4">Sacred Items</th>
              <th className="px-6 py-4">Divine Status</th>
              <th className="px-6 py-4">Sacred Offering</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Sanctify Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sand">
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-brand-sand rounded-full flex items-center justify-center text-xs font-serif uppercase">
                      {order.shippingAddress?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{order.shippingAddress?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-stone-400">{order.shippingAddress?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-stone-100 rounded-sm border border-brand-sand flex-shrink-0 overflow-hidden">
                          {item.image || item.images?.[0] ? (
                            <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[6px] text-stone-300 uppercase">No Img</div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-stone-700 truncate max-w-[150px]">{item.name}</span>
                          <span className="text-[8px] text-stone-400 uppercase tracking-widest leading-none mt-0.5">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[8px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-widest border flex items-center w-fit gap-1.5 shadow-sm",
                    getStatusBadge(order.status)
                  )}>
                    <div className="w-1 h-1 rounded-full bg-current" />
                    {order.status || "processing"}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-sm tracking-tighter">{formatPrice(order.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{order.paymentMethod}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center space-x-3">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 text-stone-400 hover:text-brand-gold transition-colors shrink-0" title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    
                    <select 
                      value={order.status || "pending"}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-[9px] font-bold bg-white border border-brand-sand rounded-sm px-2 py-1.5 uppercase tracking-widest focus:ring-1 focus:ring-brand-gold outline-none cursor-pointer hover:border-brand-gold transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {order.status === "paid" && (
                      <button 
                        onClick={() => updateStatus(order.id, "shipped")}
                        className="hidden lg:flex items-center space-x-1.5 bg-brand-gold text-white px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest hover:brightness-110 shadow-sm transition-all border border-white/20"
                      >
                        <Truck size={10} />
                        <span>Ship</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <AlertCircle size={24} className="mx-auto text-stone-200 mb-2" />
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">No sacred offerings match your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            updateStatus={updateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, updateStatus }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-sm shadow-2xl relative flex flex-col md:flex-row"
      >
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="flex justify-between items-start mb-8 border-b border-brand-sand pb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Transaction Record</span>
                <span className="h-1 w-1 bg-stone-200 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">ID: {order.id}</span>
              </div>
              <h2 className="text-3xl font-serif">Order Details.</h2>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-800 flex items-center gap-2">
                  <UserIcon size={12} className="text-brand-gold" />
                  Divine Seeker
                </h3>
                <div className="bg-stone-50 p-6 rounded-sm border border-brand-sand">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-stone-800">{order.shippingAddress?.name}</p>
                      <p className="text-xs text-stone-500">{order.shippingAddress?.email}</p>
                      <p className="text-xs text-stone-500">{order.shippingAddress?.phone}</p>
                    </div>
                    <Link 
                      to={`/profile`} // In a real app we'd have /admin/users/:id
                      className="bg-white border border-brand-sand px-3 py-1.5 rounded-sm text-[8px] font-bold uppercase tracking-widest text-brand-gold hover:bg-brand-cream transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <History size={10} />
                      View Seeker Profile
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-brand-sand/50 flex items-start gap-2">
                    <MapPin size={12} className="text-stone-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-800 flex items-center gap-2">
                  <ShoppingBag size={12} className="text-brand-gold" />
                  Sacred Items ({order.items?.length})
                </h3>
                <div className="divide-y divide-brand-sand/50 border border-brand-sand rounded-sm overflow-hidden">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-cream border border-brand-sand rounded-sm overflow-hidden shrink-0">
                          <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800">{item.name}</p>
                          {item.variantName && <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest">{item.variantName}</p>}
                          <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-stone-700">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-800 flex items-center gap-2">
                  <CreditCard size={12} className="text-brand-gold" />
                  Offering Method
                </h3>
                <div className="bg-stone-900 text-brand-beige p-6 rounded-sm shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-beige/50">Payment Status</span>
                    <span className={cn(
                      "text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border",
                      order.status === "paid" ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-brand-saffron/20 text-brand-saffron border-brand-saffron/20"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[10px] text-brand-beige/60 uppercase tracking-widest font-medium">Method</span>
                      <span className="text-xs font-bold uppercase tracking-widest">{order.paymentMethod}</span>
                    </div>
                    {order.paymentId && (
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] text-brand-beige/60 uppercase tracking-widest font-medium">Transaction ID</span>
                        <span className="text-[10px] font-mono opacity-80">{order.paymentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-brand-beige/60 uppercase tracking-widest font-medium">Placed On</span>
                      <span className="text-[10px] font-medium">{order.createdAt?.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summation */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-800">Sacred Breakdown</h3>
                <div className="bg-white p-6 rounded-sm border border-brand-sand space-y-4 shadow-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-bold">{formatPrice(order.subtotal || order.items?.reduce((a:any, b:any) => a + (b.price * b.quantity), 0) || 0)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <div className="flex items-center gap-2">
                        <span>Divine Discount</span>
                        {order.appliedCoupon && (
                          <span className="bg-green-50 text-[8px] font-bold px-1.5 py-0.5 rounded-xs border border-green-100 uppercase tracking-widest">
                            {order.appliedCoupon}
                          </span>
                        )}
                      </div>
                      <span className="font-bold">-{formatPrice(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs">
                    <span>Shipping Offering</span>
                    <span className="font-bold">{order.shippingCost ? formatPrice(order.shippingCost) : "Free"}</span>
                  </div>

                  <div className="pt-4 border-t border-brand-sand flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-stone">Sacred Total</span>
                    <span className="text-2xl font-serif text-brand-stone">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-brand-sand">
                {order.status === "paid" && (
                  <button 
                    onClick={() => { updateStatus(order.id, "shipped"); onClose(); }}
                    className="flex-grow bg-brand-gold text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:brightness-110 shadow-lg transition-all border border-white/20 flex items-center justify-center gap-2"
                  >
                    <Package size={14} />
                    Mark as Dispatched
                  </button>
                )}
                {order.status === "shipped" && (
                  <button 
                    onClick={() => { updateStatus(order.id, "delivered"); onClose(); }}
                    className="flex-grow bg-green-600 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:brightness-110 shadow-lg transition-all border border-white/20 flex items-center justify-center gap-2"
                  >
                    <Check size={14} />
                    Complete Delivery
                  </button>
                )}
                {["pending", "paid"].includes(order.status) && (
                  <button 
                    onClick={() => { updateStatus(order.id, "cancelled"); onClose(); }}
                    className="px-6 py-3 border border-brand-sand text-stone-400 hover:text-brand-saffron hover:border-brand-saffron transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <X size={14} />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProductForm({ product, setProduct, onSubmit, onCancel, isEditing, categories = [] }: any) {
  const [currentVariant, setCurrentVariant] = useState({ name: "", price: 0, discountPrice: 0, stock: 0 });

  const toggleCategory = (categoryName: string) => {
    const currentCats = [...(product.categories || [])];
    const index = currentCats.indexOf(categoryName);
    if (index === -1) {
      currentCats.push(categoryName);
    } else {
      currentCats.splice(index, 1);
    }
    setProduct({ ...product, categories: currentCats });
  };

  const addVariant = () => {
    if (!currentVariant.name || currentVariant.price <= 0) return;
    setProduct({
      ...product,
      variants: [...(product.variants || []), currentVariant]
    });
    setCurrentVariant({ name: "", price: 0, discountPrice: 0, stock: 0 });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = [...product.variants];
    updatedVariants.splice(index, 1);
    setProduct({ ...product, variants: updatedVariants });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 border border-brand-sand rounded-sm mb-12 shadow-xl"
    >
      <div className="flex justify-between items-center mb-8 border-b border-brand-sand pb-4">
        <h3 className="font-serif text-xl">{isEditing ? "Refine Divine Aroma" : "Manifest New Aroma"}</h3>
        <button onClick={onCancel} className="text-stone-400 hover:text-stone-800"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <AdminInput label="Aroma Name" value={product.name} onChange={(v:any) => setProduct({...product, name: v})} required />
            <div className="grid grid-cols-2 gap-6">
              <AdminInput label="Default Base Price (₹)" type="number" value={product.price} onChange={(v:any) => setProduct({...product, price: Number(v)})} required />
              <AdminInput label="Default Discount (₹)" type="number" value={product.discountPrice} onChange={(v:any) => setProduct({...product, discountPrice: Number(v)})} />
            </div>
            <AdminInput label="Total Stock Balance" type="number" value={product.stock} onChange={(v:any) => setProduct({...product, stock: Number(v)})} required />
            
            {/* Variants Section */}
            <div className="pt-6 border-t border-brand-sand">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-800 mb-4 flex items-center gap-2">
                <Maximize2 size={12} className="text-brand-gold" />
                Variant Options
              </h4>
              <div className="space-y-4 bg-stone-50 p-4 rounded-sm border border-brand-sand">
                <div className="grid grid-cols-2 gap-3">
                  <AdminInput label="Variant Name" value={currentVariant.name} onChange={(v:any) => setCurrentVariant({...currentVariant, name: v})} />
                  <AdminInput label="Price (₹)" type="number" value={currentVariant.price} onChange={(v:any) => setCurrentVariant({...currentVariant, price: Number(v)})} />
                  <AdminInput label="Discount (₹)" type="number" value={currentVariant.discountPrice} onChange={(v:any) => setCurrentVariant({...currentVariant, discountPrice: Number(v)})} />
                  <AdminInput label="Stock" type="number" value={currentVariant.stock} onChange={(v:any) => setCurrentVariant({...currentVariant, stock: Number(v)})} />
                </div>
                <button 
                  type="button" 
                  onClick={addVariant}
                  className="w-full bg-white border border-brand-sand py-2 text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:bg-brand-cream transition-all"
                >
                  Append Variant
                </button>
              </div>
              
              <div className="mt-4 space-y-2">
                {product.variants?.map((v: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-white p-3 border border-brand-sand rounded-sm text-[10px]">
                    <div>
                      <span className="font-bold text-stone-800">{v.name}</span>
                      <span className="mx-2 text-stone-300">•</span>
                      <span className="text-brand-gold">₹{v.price}</span>
                      {v.discountPrice > 0 && <span className="ml-1 text-stone-400 line-through">₹{v.discountPrice}</span>}
                    </div>
                    <button type="button" onClick={() => removeVariant(i)} className="text-stone-300 hover:text-brand-saffron">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block pb-1 border-b border-brand-sand">Sacred Groupings (Categories)</label>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={cn(
                        "text-[10px] px-3 py-2 border rounded-sm transition-all text-left flex items-center justify-between group",
                        product.categories?.includes(cat.name) 
                          ? "bg-brand-stone text-brand-beige border-brand-stone" 
                          : "bg-white text-stone-400 border-brand-sand hover:border-brand-gold"
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {product.categories?.includes(cat.name) && <Check size={10} className="text-brand-gold" />}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <p className="col-span-full text-[9px] text-stone-300 italic">No categories managed yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Scent Essence (Description)</label>
              <textarea 
                rows={4}
                value={product.description}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                className="w-full bg-stone-50 border border-brand-sand p-4 text-xs font-serif outline-none focus:ring-1 focus:ring-brand-gold rounded-sm"
                placeholder="The deep meditative soul of Mysore..."
                required
              />
            </div>
            <AdminInput 
              label="Sacred Tags (Comma Separated)" 
              value={product.tags?.join(", ") || ""} 
              onChange={(v:any) => setProduct({...product, tags: v.split(",").map((t:string) => t.trim()).filter((t:string) => t !== "")})} 
              placeholder="Meditation, Earthy, Slow Burn..."
            />
            <AdminMultiImageUpload 
              label="Sacred Visualizations (Gallery)" 
              values={product.images || []} 
              onChange={(v:any) => setProduct({...product, images: v})} 
              required 
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6 border-t border-brand-sand">
          <button type="button" onClick={onCancel} className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800">Discard</button>
          <button type="submit" className="bg-brand-stone text-brand-beige px-12 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-125 transition-all shadow-lg border border-white/10">
            {isEditing ? "Apply Blessings" : "Manifest Spirit"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function AdminMultiImageUpload({ label, values, onChange, required = false }: any) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls = [...values];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        newUrls.push(url);
      }
      onChange(newUrls);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Sacred image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = [...values];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">{label}</label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {values.map((url: string, idx: number) => (
          <div key={idx} className="relative aspect-square group rounded-sm overflow-hidden border border-brand-sand">
            <img src={url} alt={`Product gallery ${idx}`} className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-brand-saffron opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        
        <div className={cn(
          "relative aspect-square bg-stone-50 border border-brand-sand rounded-sm flex flex-col items-center justify-center transition-all overflow-hidden border-dashed hover:bg-brand-cream/50",
          uploading && "opacity-50"
        )}>
          <Upload className="text-stone-300 mb-1" size={20} />
          <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Add Images</p>
          
          <input 
            type="file" 
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={uploading}
            required={required && values.length === 0}
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <Loader2 className="text-brand-gold animate-spin" size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminImageUpload({ label, value, onChange, required = false }: any) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Sacred image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">{label}</label>
      <div className="relative group">
        <div className={cn(
          "w-full h-40 bg-stone-50 border border-brand-sand rounded-sm flex flex-col items-center justify-center transition-all overflow-hidden",
          !value && "border-dashed",
          uploading && "opacity-50"
        )}>
          {value ? (
            <div className="relative w-full h-full">
              <img src={value} alt="Product preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Image</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Upload className="mx-auto text-stone-300 mb-2" size={24} />
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Divine Visualization</p>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={uploading}
            required={required && !value}
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <Loader2 className="text-brand-gold animate-spin" size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminInput({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">{label}</label>
      <input 
        type={type} 
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-brand-sand p-3 text-xs outline-none focus:ring-1 focus:ring-brand-gold rounded-sm transition-all" 
      />
    </div>
  );
}

function InsightCard() {
  return (
    <div className="bg-stone-900 text-brand-beige p-8 rounded-sm shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={16} className="text-brand-gold" />
          <h3 className="font-serif text-xl italic tracking-wide">Vedic Insight</h3>
        </div>
        <p className="text-xs leading-relaxed text-brand-beige/70">"The divine flow of commerce is steady. Purity in your listings has increased conversion by 14% this moon cycle."</p>
      </div>
      <BarChart3 className="absolute bottom-0 right-0 text-white/5 w-32 h-32 -mb-8 -mr-8" />
    </div>
  );
}

function InventoryPreview({ products }: any) {
  return (
    <div className="bg-white rounded-sm border border-brand-sand p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-800">Sanctuary Stock</h3>
        <AlertCircle size={14} className="text-brand-saffron" />
      </div>
      <div className="space-y-6">
        {products.slice(0, 4).map((prod: any) => (
          <InventoryItem key={prod.id} label={prod.name} stock={prod.stock} total={100} color={prod.stock < 10 ? "bg-brand-saffron" : "bg-brand-gold"} />
        ))}
        {products.length === 0 && (
          <p className="text-[9px] text-stone-300 font-bold uppercase text-center py-4">Refined inventory empty.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-sm border border-brand-sand shadow-sm hover:border-brand-gold transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="bg-brand-cream p-4 rounded-sm text-brand-gold group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex items-center space-x-1">
          <TrendingUp size={10} className="text-brand-gold" />
          <span className="text-[9px] font-bold tracking-widest text-brand-gold uppercase">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-2">{label}</p>
        <p className="text-4xl font-serif text-stone-800 tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

function InventoryItem({ label, stock, total, color }: any) {
  const percentage = Math.min((stock / total) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-stone-600 truncate max-w-[150px]">{label}</span>
        <span className={stock < 10 ? "text-brand-saffron animate-pulse" : "text-stone-400"}>{stock} Left</span>
      </div>
      <div className="h-[2px] w-full bg-stone-50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
        />
      </div>
    </div>
  );
}

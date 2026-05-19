import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc } from "firebase/firestore";
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RefreshCw, MessageSquare, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Product, ProductVariant, Review } from "../types";
import { MOCK_PRODUCTS } from "../data/products";
import QuantitySelector from "../components/QuantitySelector";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mock data handled by shared products file

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", recommends: true });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addItem } = useCart();
  const { user, updateWishlist, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      // Check mock data first
      const mockFound = (MOCK_PRODUCTS as Product[]).find(p => p.id === id);
      if (mockFound) {
        setProduct(mockFound);
        if (mockFound.variants && mockFound.variants.length > 0) {
          setActiveVariant(mockFound.variants[0]);
        }
      } else if (id) {
        // Try Firestore if not in mock
        try {
          const docRef = doc(db, "products", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const prodData = { id: docSnap.id, ...data } as Product;
            setProduct(prodData);
            if (prodData.variants && prodData.variants.length > 0) {
              setActiveVariant(prodData.variants[0]);
            }
          } else {
             // Fallback to first mock product if totally not found
             setProduct(MOCK_PRODUCTS[0] as Product);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setProduct(MOCK_PRODUCTS[0] as Product);
        }
      }
    };

    fetchProduct();
    setQuantity(1);

    if (id) {
      let field = "createdAt";
      let direction: "asc" | "desc" = "desc";

      if (sortBy === "highest") {
        field = "rating";
        direction = "desc";
      } else if (sortBy === "lowest") {
        field = "rating";
        direction = "asc";
      }

      const q = query(
        collection(db, "reviews"),
        where("productId", "==", id),
        orderBy(field, direction)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        setReviews(reviewsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "reviews");
      });

      return () => unsubscribe();
    }
  }, [id, sortBy]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.id || user.uid,
        userName: user.name || user.displayName || "Divine Soul",
        userPhoto: user.avatar || user.photoURL || null,
        rating: newReview.rating,
        comment: newReview.comment,
        recommends: newReview.recommends,
        helpfulCount: 0,
        helpfulBy: [],
        createdAt: serverTimestamp()
      });
      setNewReview({ rating: 5, comment: "", recommends: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reviews");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, helpfulBy: string[]) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userId = user.id || user.uid;
    const isHelpful = helpfulBy?.includes(userId);
    const reviewRef = doc(db, "reviews", reviewId);

    try {
      await updateDoc(reviewRef, {
        helpfulCount: increment(isHelpful ? -1 : 1),
        helpfulBy: isHelpful ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  if (!product) return null;

  const isInWishlist = user?.wishlist.includes(product.id);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-brand-cream/30 border border-brand-sand/30 shadow-sm relative group">
            <motion.img 
              key={activeImg}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={product.images?.[activeImg] || product.images?.[0]} 
              className="w-full h-full object-cover" 
              alt={product.name}
              referrerPolicy="no-referrer"
              decoding="async"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${activeImg === idx ? 'border-brand-gold shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="text-brand-gold font-bold tracking-widest text-[10px] uppercase mb-4">
              {product.categories.join(", ")}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.averageRating) ? "fill-brand-gold text-brand-gold" : "text-stone-200"} />
                ))}
              </div>
              <span className="text-stone-400 text-xs font-medium uppercase tracking-widest">{product.ratingCount} Reviews</span>
            </div>
          </div>

          <div className="mb-10 flex items-end space-x-4">
            {activeVariant ? (
              activeVariant.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-stone-900">{formatPrice(activeVariant.discountPrice)}</span>
                  <span className="text-lg text-stone-400 line-through mb-1">{formatPrice(activeVariant.price)}</span>
                  <span className="bg-brand-saffron text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-full mb-2">Save {Math.round((activeVariant.price - activeVariant.discountPrice)/activeVariant.price * 100)}%</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-stone-900">{formatPrice(activeVariant.price)}</span>
              )
            ) : product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-stone-900">{formatPrice(product.discountPrice)}</span>
                <span className="text-lg text-stone-400 line-through mb-1">{formatPrice(product.price)}</span>
                <span className="bg-brand-saffron text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-full mb-2">Save {Math.round((product.price - product.discountPrice)/product.price * 100)}%</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-stone-900">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed font-serif italic text-lg mb-10">
            "{product.description}"
          </p>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div className="mb-10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Select Variant</h4>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveVariant(variant);
                      setQuantity(1);
                    }}
                    className={cn(
                      "px-6 py-3 border text-[10px] uppercase font-bold tracking-widest transition-all rounded-sm",
                      activeVariant?.name === variant.name 
                        ? "border-brand-gold bg-brand-gold text-white shadow-md" 
                        : "border-brand-sand text-stone-500 hover:border-brand-gold"
                    )}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] font-bold text-brand-saffron uppercase tracking-widest">
                {activeVariant?.stock > 0 ? `${activeVariant.stock} In Sacred Stock` : "Temporarily Out of Stock"}
              </p>
            </div>
          )}

          <div className="space-y-8 mb-12">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Quantity</h4>
              <QuantitySelector 
                quantity={quantity} 
                onChange={setQuantity}
                max={activeVariant ? activeVariant.stock : product.stock}
              />
            </div>

            <div className="flex space-x-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                whileHover={{ brightness: 1.2 }}
                disabled={(activeVariant ? activeVariant.stock <= 0 : product.stock <= 0)}
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  addItem({ 
                    ...product, 
                    id: product.id + (activeVariant ? `-${activeVariant.id}` : ""), 
                    price: activeVariant ? (activeVariant.discountPrice || activeVariant.price) : (product.discountPrice || product.price),
                    quantity, 
                    image: product.images[0],
                    variantName: activeVariant?.name
                  });
                }}
                className="flex-grow bg-stone-900 hover:bg-stone-800 text-brand-beige py-5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all shadow-xl disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} />
                <span>{ (activeVariant ? activeVariant.stock <= 0 : product.stock <= 0) ? "Divine Out of Stock" : "Add To Sacred Cart" }</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={() => updateWishlist(product.id)}
                className={`p-5 rounded-full border border-brand-sand transition-all ${isInWishlist ? "bg-red-50 text-red-500 border-red-200" : "text-stone-400 hover:text-red-400"}`}
              >
                <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
              </motion.button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-brand-sand mt-auto">
            <Feature icon={<Truck size={18} />} label="Free Shipping" />
            <Feature icon={<ShieldCheck size={18} />} label="Secure Checkout" />
            <Feature icon={<RefreshCw size={18} />} label="Easy Returns" />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="mt-32 pt-24 border-t border-brand-sand">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-[1px] w-8 bg-brand-gold"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">Community Reflections</span>
            </div>
            <h2 className="text-4xl font-serif text-brand-stone">What our seekers <br/><span className="italic">are saying.</span></h2>
          </div>
          
          <div className="bg-brand-cream/40 p-8 border border-brand-sand rounded-sm flex flex-col md:flex-row items-center gap-10">
            <div className="text-center">
              <p className="text-5xl font-serif text-brand-stone mb-2">{product.averageRating}</p>
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.averageRating) ? "fill-brand-gold text-brand-gold" : "text-stone-200"} />
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Based on {reviews.length || product.ratingCount} reviews</p>
            </div>
            
            <div className="w-[1px] h-20 bg-brand-sand hidden md:block"></div>
            
            <div className="space-y-2 w-full md:w-64">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4 group cursor-default">
                    <span className="text-[10px] font-bold text-stone-500 w-4">{rating}</span>
                    <div className="flex-grow h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-brand-gold"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-stone-400 w-8 text-right">{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Review Form */}
          <div className="lg:col-span-4 self-start sticky top-32">
            <div className="bg-white p-8 border border-brand-sand shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-brand-stone mb-8 pb-4 border-b border-brand-sand">Write a reflection</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Your Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="transition-all hover:scale-110 active:scale-90 p-1"
                    >
                      <Star 
                        size={26} 
                        className={cn(
                          "transition-all duration-300",
                          star <= (hoverRating || newReview.rating) 
                            ? "fill-brand-gold text-brand-gold scale-110" 
                            : "text-stone-200 scale-100"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Your Reflection</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="How did this fragrance touch your soul?"
                  className="w-full bg-brand-cream/30 border border-brand-sand rounded-sm p-4 text-sm font-serif min-h-[120px] outline-none focus:ring-1 focus:ring-brand-gold transition-all"
                />
              </div>

              <div className="flex items-center space-x-4 p-4 bg-brand-cream/20 rounded-sm border border-brand-sand/30 cursor-pointer hover:bg-brand-cream/40 transition-colors" onClick={() => setNewReview({ ...newReview, recommends: !newReview.recommends })}>
                 <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300 flex-shrink-0",
                    newReview.recommends ? "bg-brand-gold" : "bg-stone-200"
                  )}>
                  <motion.div 
                    initial={false}
                    animate={{ x: newReview.recommends ? 22 : 2 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 cursor-pointer select-none">
                  {newReview.recommends ? "Seeker Recommended" : "Would you recommend this vessel?"}
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full bg-brand-stone text-brand-beige py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-125 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Offering..." : user ? "Submit Review" : "Sign in to Reflect"}
              </motion.button>
            </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-sand">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                Found {reviews.length} Reflections
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Order:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] uppercase font-bold tracking-widest text-brand-stone outline-none cursor-pointer focus:text-brand-gold transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-8 border border-brand-sand/50 shadow-sm relative group overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden p-0.5 border border-brand-sand bg-white shadow-sm ring-4 ring-brand-cream/20">
                            {review.userPhoto ? (
                              <img src={review.userPhoto} className="w-full h-full object-cover rounded-full" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-brand-beige flex items-center justify-center">
                                <User className="text-brand-gold" size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-brand-stone uppercase tracking-widest">{review.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                                {review.createdAt?.toDate 
                                  ? review.createdAt.toDate().toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    }) 
                                  : 'A Moment Ago'}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-brand-sand"></div>
                              <span className="text-[9px] text-brand-gold font-bold uppercase tracking-widest">Verified Journey</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={cn(
                                  "transition-all duration-300",
                                  i < review.rating ? "fill-brand-gold text-brand-gold" : "text-stone-100"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-brand-gold/40">Sacred Rating</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute -top-4 -left-2 text-6xl font-serif text-brand-beige/40 pointer-events-none">“</span>
                        <p className="text-stone-700 font-serif leading-relaxed italic text-lg relative z-10 pl-4">
                          {review.comment}
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-brand-sand/30 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleHelpful(review.id, review.helpfulBy || [])}
                            className={cn(
                              "flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors group/helpful",
                              (review.helpfulBy || []).includes(user?.id || user?.uid) 
                                ? "text-brand-gold" 
                                : "text-stone-400 hover:text-brand-gold"
                            )}
                          >
                            <span className="group-hover/helpful:scale-110 transition-transform">
                              {(review.helpfulBy || []).includes(user?.id || user?.uid) ? "Helpful" : "Helpful?"}
                            </span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full",
                              (review.helpfulBy || []).includes(user?.id || user?.uid) 
                                ? "bg-brand-gold text-white" 
                                : "bg-brand-cream text-brand-gold"
                            )}>
                              {review.helpfulCount || 0}
                            </span>
                          </button>
                        </div>
                        {review.recommends && (
                          <div className="flex items-center space-x-1.5 text-green-600">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Seeker Recommended</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-brand-cream/20 border-2 border-dashed border-brand-sand rounded-sm">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MessageSquare size={48} className="mx-auto text-brand-gold/20 mb-6" />
                    </motion.div>
                    <h4 className="text-brand-stone font-serif text-xl mb-2">Silent Sanctuary</h4>
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Be the first to share your aromatic awakening</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="text-brand-gold">{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">{label}</span>
    </div>
  );
}

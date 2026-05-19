import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Star, Heart, Check, Info } from "lucide-react";
import { formatPrice } from "../lib/utils";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    averageRating: number;
    categories: string[];
    description?: string;
  };
}

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [quantity, setQuantity] = React.useState(1);
  const { addItem } = useCart();
  const { user, updateWishlist } = useAuth();
  const [activeImage, setActiveImage] = React.useState(0);
  
  const isInWishlist = user?.wishlist.includes(product.id);

  const handleAddToCart = () => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.discountPrice || product.price, 
      quantity, 
      image: product.images[0] 
    });
    toast.success(`${product.name} added to your ritual collection`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-stone/80 backdrop-blur-md"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-brand-stone rounded-full transition-colors shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Left: Images */}
          <div className="w-full md:w-1/2 bg-brand-cream/30 p-8 flex flex-col">
            <div className="flex-grow aspect-square overflow-hidden rounded-sm mb-6">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-1/2 p-10 flex flex-col overflow-y-auto">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-2 block">{product.categories.join(" • ")}</span>
                <h2 className="text-4xl font-serif text-brand-stone leading-tight">{product.name}</h2>
                <div className="flex items-center space-x-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < Math.floor(product.averageRating) ? "fill-brand-gold text-brand-gold" : "text-stone-300"} 
                    />
                  ))}
                  <span className="text-xs font-bold text-stone-400 ml-2">({product.averageRating.toFixed(1)}) Divine Reflections</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-serif text-brand-gold">{formatPrice(product.discountPrice)}</span>
                    <span className="text-stone-300 line-through text-lg">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-serif text-brand-stone">{formatPrice(product.price)}</span>
                )}
              </div>

              <p className="text-stone-500 text-sm leading-relaxed font-sans">
                {product.description || "Awaken your senses with this sacred aromative vessel, hand-crafted to elevate your spiritual journey and provide a sanctuary of peace in your daily ritual."}
              </p>

              <div className="pt-6 border-t border-brand-sand/30 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Sacred Quantity</span>
                  <QuantitySelector quantity={quantity} onChange={setQuantity} className="bg-stone-50" />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-grow bg-brand-stone text-brand-beige py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:brightness-125 transition-all shadow-xl"
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Collection</span>
                  </button>
                  <button 
                    onClick={() => updateWishlist(product.id)}
                    className={`p-4 rounded-sm border transition-all ${isInWishlist ? 'bg-red-50 border-red-100 text-red-500' : 'border-brand-sand text-brand-stone hover:bg-stone-50'}`}
                  >
                    <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-[9px] uppercase tracking-widest font-bold text-stone-400">
                <Check size={14} className="text-brand-gold" />
                <span>Ethically Sourced</span>
              </div>
              <div className="flex items-center space-x-3 text-[9px] uppercase tracking-widest font-bold text-stone-400">
                <Info size={14} className="text-brand-gold" />
                <span>Ritual Guide Included</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

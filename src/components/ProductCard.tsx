import React, { useState } from "react";
import type { MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, Loader2, Maximize2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { cn, formatPrice } from "../lib/utils";
import QuantitySelector from "./QuantitySelector";
import { Product } from "../types";
import QuickViewModal from "./QuickViewModal";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const { addItem } = useCart();
  const { user, updateWishlist } = useAuth();
  const navigate = useNavigate();

  const isInWishlist = user?.wishlist.includes(product.id);

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    // Simulate network delay for "asynchronous operation" feeling
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.discountPrice || product.price, 
      quantity, 
      image: product.images[0] 
    });
    
    toast.success(`${product.name} added to your ritual`);
    setQuantity(1);
    setIsAdding(false);
  };

  const handleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    updateWishlist(product.id);
  };

  const openQuickView = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white rounded-sm overflow-hidden flex flex-col h-full border border-brand-sand/30 hover:shadow-[0_20px_50px_rgba(44,44,44,0.1)] transition-all duration-700"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream/10">
          <Link to={`/product/${product.id}`} className="relative block h-full">
            {/* Main Image */}
            <img 
              src={product.images[0]} 
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover transition-all duration-1000 group-hover:scale-110",
                product.images.length > 1 && "group-hover:opacity-0",
                !imageLoaded ? "opacity-0" : "opacity-100"
              )}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            {/* Alternative Image on Hover */}
            {product.images.length > 1 && (
              <img 
                src={product.images[1]} 
                alt={`${product.name} ritual view`}
                onLoad={() => setImage2Loaded(true)}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-all duration-1000 opacity-0 group-hover:opacity-100 group-hover:scale-110",
                  !image2Loaded && "hidden"
                )}
                referrerPolicy="no-referrer"
              />
            )}

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-brand-stone/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openQuickView}
                className="bg-white text-brand-stone w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 mb-4"
              >
                <Maximize2 size={18} />
              </motion.button>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">Quick View</span>
            </div>

            {/* Interactive Add to Cart Reveal */}
            <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-sm shadow-xl space-y-4 border border-brand-sand/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Add to Ritual</span>
                  <div className="flex items-center space-x-3 bg-brand-cream/50 rounded-sm px-2 py-1">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} className="text-stone-400 hover:text-brand-stone"><Minus size={12}/></button>
                    <span className="text-xs font-mono font-bold w-4 text-center">{quantity}</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => q + 1); }} className="text-stone-400 hover:text-brand-stone"><Plus size={12}/></button>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-brand-stone text-brand-beige py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all hover:bg-black"
                >
                  {isAdding ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  <span>{isAdding ? "Gathering..." : "Add to Collection"}</span>
                </motion.button>
              </div>
            </div>
          </Link>
          
          {/* Wishlist Button (Always visible but styled) */}
          <button 
            onClick={handleWishlist}
            className={cn(
              "absolute top-4 right-4 z-30 p-2.5 rounded-full transition-all duration-500",
              isInWishlist 
                ? "bg-red-50 text-red-500 shadow-lg" 
                : "bg-white/80 text-brand-stone hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
            )}
          >
            <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} strokeWidth={isInWishlist ? 0 : 2} />
          </button>

          {/* Offer Badge */}
          {product.discountPrice && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-brand-saffron text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-xl">
                Offer
              </span>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-6 flex-grow flex flex-col">
          <div className="mb-2">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-gold">{product.categories[0]}</span>
          </div>
          <Link to={`/product/${product.id}`} className="group/title">
            <h3 className="font-serif text-xl md:text-2xl text-brand-stone mb-2 transition-colors group-hover/title:text-brand-gold leading-tight line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-sand/20">
            <div className="flex items-baseline space-x-3">
              {product.discountPrice ? (
                <>
                  <span className="text-lg font-serif text-brand-stone">{formatPrice(product.discountPrice)}</span>
                  <span className="text-[10px] text-stone-300 line-through font-bold">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-lg font-serif text-brand-stone">{formatPrice(product.price)}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Star size={12} className="fill-brand-gold text-brand-gold" />
              <span className="text-[10px] font-bold text-stone-400">{product.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </>
  );
};

export default ProductCard;

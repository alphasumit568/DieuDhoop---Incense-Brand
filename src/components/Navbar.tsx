import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 h-20 flex items-center justify-between px-6 md:px-12 border-b border-brand-border z-50 bg-brand-beige/80 backdrop-blur-md">
      {/* Mobile Controls - Left on mobile */}
      <div className="flex md:hidden items-center space-x-4">
        <button 
          className="text-brand-stone"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link to="/cart" className="p-2 hover:text-brand-gold transition-all relative">
          <ShoppingCart size={18} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-brand-gold text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Left Nav */}
      <div className="hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-medium text-brand-stone">
        <Link to="/shop" className="hover:text-brand-gold transition-colors">The Collection</Link>
        <Link to="/subscriptions" className="hover:text-brand-gold transition-colors">Divine Rituals</Link>
        <Link to="/quiz" className="hover:text-brand-gold transition-colors">Fragrance Finder</Link>
      </div>

      {/* Center Logo - Right side on mobile */}
      <div className="absolute left-1/2 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 max-md:right-6 max-md:left-auto max-md:translate-x-0">
        <Link to="/" className="flex items-center gap-2" id="nav-logo">
          <span className="text-3xl font-serif font-bold tracking-tighter text-brand-gold flex items-center gap-3">
            <Logo className="w-10 h-10 text-brand-gold" />
            <span className="mt-1">DIEUDHOOP</span>
          </span>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 md:space-x-10 text-[11px] uppercase tracking-[0.2em] font-medium text-brand-stone">
        {user?.role === "admin" && (
          <Link to="/admin" className="hidden md:block text-brand-gold font-bold hover:brightness-110 transition-all">Admin Dashboard</Link>
        )}
        {user && (
          <Link to="/profile" className="hidden md:flex items-center gap-3 group focus:outline-none">
            <div className={`w-8 h-8 rounded-full ${user?.avatar ? '' : 'bg-brand-gold'} flex items-center justify-center text-white text-[10px] font-serif group-hover:shadow-md transition-all border border-brand-border overflow-hidden`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <span className="group-hover:text-brand-gold transition-colors">Account</span>
          </Link>
        )}
        
        <Link to="/cart" className="hidden md:block p-2 hover:text-brand-gold transition-all relative">
          <ShoppingCart size={18} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-brand-gold text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <button onClick={() => signOut()} className="hidden md:block hover:text-brand-gold transition-colors uppercase tracking-widest font-bold">Logout</button>
        ) : (
          <Link to="/login" className="hidden md:block hover:text-brand-gold transition-colors uppercase tracking-widest font-bold">Login</Link>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full md:hidden bg-brand-beige border-b border-brand-border animate-in slide-in-from-top duration-300 z-40">
          <div className="px-6 py-10 space-y-6 text-center">
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest font-bold">The Collection</Link>
            <Link to="/subscriptions" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest font-bold">Divine Rituals</Link>
            <Link to="/quiz" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest font-bold">Fragrance Finder</Link>
            {user && (
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center gap-3 text-sm uppercase tracking-widest font-bold"
              >
                <div className={`w-6 h-6 rounded-full ${user?.avatar ? '' : 'bg-brand-gold'} flex items-center justify-center text-white text-[8px] font-serif shadow-sm overflow-hidden`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]
                  )}
                </div>
                <span>Journal</span>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest font-bold text-brand-gold">Admin Dashboard</Link>
            )}
            {user ? (
              <button 
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }} 
                className="block w-full text-sm uppercase tracking-widest font-bold text-brand-stone"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest font-bold text-brand-stone">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

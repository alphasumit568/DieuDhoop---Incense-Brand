import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-brand-stone text-brand-beige/60 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Brand */}
          <div className="md:col-span-5 space-y-8">
            <h2 className="text-4xl font-serif font-bold tracking-tighter text-brand-gold flex items-center gap-3">
              <Logo className="w-12 h-12 text-brand-gold" />
              <span>DIEUDHOOP</span>
            </h2>
            <p className="text-base font-light font-serif leading-relaxed max-w-md italic">
              "Handcrafted luxury incense sticks dipped in pure essential oils, inspired by ancient Vedic wisdom to cleanse your space and spirit."
            </p>
            <div className="flex space-x-8">
              <a href="https://www.instagram.com/official_dieudhoop?igsh=czlxbW5zZWM0cXM4" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] mb-10 text-[10px]">Registry</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-[0.1em] font-medium">
              <li><Link to="/shop" className="hover:text-brand-gold transition-colors">The Collection</Link></li>
              <li><Link to="/quiz" className="hover:text-brand-gold transition-colors">Fragrance Quiz</Link></li>
              <li><Link to="/#about" className="hover:text-brand-gold transition-colors">Our Rituals</Link></li>
            </ul>
          </div>

          {/* Assistance */}
          <div className="md:col-span-2">
            <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] mb-10 text-[10px]">Support</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-[0.1em] font-medium">
              <li><Link to="/track-order" className="hover:text-brand-gold transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-brand-gold transition-colors">Your Order</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Shipping</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Concierge</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] mb-10 text-[10px]">Account</h3>
            <p className="text-xs mb-6 font-medium leading-relaxed">BE THE FIRST TO RECEIVE DIVINE UPDATES AND SACRED RITUALS.</p>
            <form className="relative border-b border-brand-beige/20 pb-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent border-none px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:ring-0 outline-none text-brand-beige placeholder:text-brand-beige/20"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-gold font-bold text-[10px] uppercase tracking-widest hover:brightness-125">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-brand-beige/5 pt-10 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-[9px] uppercase tracking-[0.3em] font-black">
          <p>© 2024 DIEUDHOOP • LUXURY SPIRITUAL AROMATHERAPY</p>
          <div className="flex space-x-12 opacity-40">
            <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
            <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

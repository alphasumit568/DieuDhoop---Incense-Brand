import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Mantra (password) must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      
      toast.success("Secret mantra updated successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-sm border border-brand-sand shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-brand-stone mb-2">New Mantra</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Define your secret entry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-stone block ml-1">New Secret Mantra</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-cream/20 border border-brand-sand p-4 pl-12 rounded-sm outline-none focus:ring-1 focus:ring-brand-gold transition-all font-serif"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-brand-gold transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-stone block ml-1">Confirm Secret Mantra</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-cream/20 border border-brand-sand p-4 pl-12 rounded-sm outline-none focus:ring-1 focus:ring-brand-gold transition-all font-serif"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-brand-stone text-brand-beige py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-2 shadow-xl hover:brightness-125 transition-all disabled:opacity-50 border border-white/10"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                <span>Update Mantra</span>
                <ArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

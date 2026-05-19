import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset link");
      
      setSubmitted(true);
      toast.success("Spiritual guidance (reset link) sent to your inbox!");
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
        
        <div className="mb-8">
          <Link to="/login" className="flex items-center text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-brand-gold transition-colors">
            <ArrowLeft size={14} className="mr-2" />
            Back to Sanctuary
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-brand-stone mb-2">Recover Access</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Restore your divine path</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-stone-600 font-serif leading-relaxed text-center mb-6">
              Enter your registered email essence, and we will send you a sacred link to reset your secret mantra.
            </p>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-brand-stone block ml-1">Email Essence</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@divine.com"
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
                  <span>Send Reset Link</span>
                  <Send size={14} />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <Send size={24} className="text-green-500" />
            </div>
            <h2 className="text-xl font-serif text-brand-stone">Email Sent</h2>
            <p className="text-sm text-stone-600 font-serif leading-relaxed">
              We have sent a spiritual link to <strong>{email}</strong>. Please check your inbox and follow the instructions to restore your access.
            </p>
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold italic pt-4">
              Didn't receive it? Check your spam folder or wait a few moments.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        message,
        status: "new",
        createdAt: serverTimestamp()
      });
      setSent(true);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError("The divine connection was interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl font-serif mb-8">Contact Us</h1>
            <p className="text-lg text-brand-stone/70 font-serif leading-relaxed mb-12">
              Whether you seek aromatic guidance or wish to share your divine experience, We’re just a message away..
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="bg-brand-cream p-4 rounded-sm text-brand-gold">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">Email</h4>
                  <p className="text-xl font-serif">official.dieudhoop@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-brand-cream p-4 rounded-sm text-brand-gold">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">Phone Number</h4>
                  <p className="text-xl font-serif">+91 9045025153</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-brand-cream p-4 rounded-sm text-brand-gold">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">Location</h4>
                  <p className="text-xl font-serif">Tilothi, Hathras<br />Uttar Pradesh, India</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 border border-brand-sand shadow-2xl rounded-sm"
          >
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <Send size={40} />
                </div>
                <h3 className="text-3xl font-serif">Message Manifested.</h3>
                <p className="text-sm text-stone-500 font-serif">Your intent has been received. Our keepers will respond with the next dawn.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="text-brand-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 text-xs font-serif rounded-sm border border-red-100">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Full Name</label>
                    <input 
                      name="name"
                      type="text" 
                      required 
                      disabled={loading}
                      className="w-full bg-stone-50 border-b border-brand-sand p-4 text-sm font-serif outline-none focus:border-brand-gold transition-colors disabled:opacity-50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Email Address</label>
                    <input 
                      name="email"
                      type="email" 
                      required 
                      disabled={loading}
                      className="w-full bg-stone-50 border-b border-brand-sand p-4 text-sm font-serif outline-none focus:border-brand-gold transition-colors disabled:opacity-50" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Your Intent (Message)</label>
                  <textarea 
                    name="message"
                    rows={6} 
                    required 
                    disabled={loading}
                    className="w-full bg-stone-50 border-b border-brand-sand p-4 text-sm font-serif outline-none focus:border-brand-gold transition-colors resize-none disabled:opacity-50"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-stone text-brand-beige py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:brightness-125 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2 border border-white/10"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Manifesting...</span>
                    </>
                  ) : (
                    <span>Send Your Message</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

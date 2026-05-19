import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Mail, Lock, Loader2, Eye, EyeOff, Globe, Facebook, Linkedin, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      navigate("/profile");
    } catch (err: any) {
      // Errors handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/profile");
    } catch (err) {}
  };

  const handleAdminQuickLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue("email", "sumitsharma60158@gmail.com");
    setValue("password", "admin123");
  };

  return (
    <div className="min-h-screen bg-[#E1DAD3] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Line Art Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 Q 30 10 30 30 T 50 50' stroke='%233C362F' fill='none' stroke-width='0.5'/%3E%3Ccircle cx='80' cy='20' r='1' fill='%233C362F'/%3E%3Cpath d='M70 80 Q 90 80 90 60' stroke='%233C362F' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px'
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white p-10 md:p-12 rounded-[40px] shadow-sm text-center relative z-10"
      >
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black mb-3">Welcome to Dieudhoop</h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-[280px] mx-auto">
            Hey, Enter your details to get sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2 text-left">
            <div className="relative">
              <input 
                {...register("email")}
                type="email" 
                placeholder="Enter Email / Phone No"
                className={`w-full bg-white border border-black p-4 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 ml-2">{errors.email.message}</p>}
          </div>

          <div className="space-y-2 text-left">
            <div className="relative">
              <input 
                {...register("password")}
                type={showPassword ? "text" : "password"} 
                placeholder="Passcode"
                className={`w-full bg-white border border-black p-4 pr-14 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-medium hover:text-stone-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 ml-2">{errors.password.message}</p>}
          </div>

          <div className="flex justify-start px-1">
            <Link to="/forgot-password" size={14} className="text-xs text-stone-800 hover:underline font-bold">Having trouble in sign in?</Link>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#3C362F] text-white py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm disabled:opacity-70 flex items-center justify-center mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] text-stone-400 font-medium whitespace-nowrap">
              — Or Sign in with —
            </span>
          </div>

          <div className="flex justify-center mb-8">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 border border-stone-100 py-3 rounded-xl hover:bg-stone-50 transition-all text-xs font-bold text-stone-700"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              <span>Google</span>
            </button>
          </div>

          <p className="text-xs text-stone-500">
            Don't have an account? <Link to="/register" className="text-stone-800 hover:underline font-bold">Register</Link>
          </p>
        </div>

        <div className="mt-12 text-[9px] text-stone-300 font-medium flex flex-wrap justify-center gap-4 border-t border-stone-50 pt-6">
          <span>Copyright @Dieudhoop 2026</span>
          <span className="text-stone-200">|</span>
          <Link to="/privacy" className="hover:text-stone-500">Privacy Policy</Link>
          <button onClick={handleAdminQuickLogin} className="hover:text-brand-gold transition-colors ml-auto uppercase tracking-tighter">Divine Entry</button>
        </div>
      </motion.div>
    </div>

  );
}
